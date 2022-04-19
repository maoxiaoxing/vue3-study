
export const State = {
  initital: 1, // 初始状态
  tagOpen: 2, // 标签开始状态
  tagName: 3, // 标签名称状态
  text: 4, // 文本状态
  tagEnd: 5, // 结束标签状态
  tagEndName: 6, // 结束标签名称状态
}

function isAlpha(char) {
  return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'z'
}

export function tokenzie(str) {
  // 状态机当前状态
  let currentState = State.initital
  // 缓存字符
  const chars = []
  // 生成的 token 会存储到 tokens 数组中，并作为函数的返回值返回
  const tokens = []
  // 开启自动机
  while (str) {
    const char = str[0]
    switch (currentState) {
      // 状态机处于初始状态
      case State.initital:
        if (char === '<') {
          // 状态机切换到开始状态
          currentState = State.tagOpen
          // 消费字符串 '<'
          str = str.slice(1)
        } else if (isAlpha(char)) {
          // 遇到字母，切换到文本状态
          currentState = State.text
          // 当前字母缓存到 chars 数组
          chars.push(char)
          // 消费当前字符
          str = str.slice(1)
        }
        break
      // 状态机当前处于标签开始状态
      case State.tagOpen:
        if (isAlpha(char)) {
          // 遇到字母，切换到标签名称状态
          currentState = State.tagName
          chars.push(char)
          str = str.slice(1)
        } else if (char === '/') {
          // 遇到字符 '/' 切换到结束状态
          currentState = State.tagEnd
          str = str.slice(1)
        }
        break
      // 状态机当前处于标签名称状态
      case State.tagName:
        if (isAlpha(char)) {
          // 遇到字母，当前处于标签名状态，不需要切换状态
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          // 遇到字符 '>' 切换到初始状态
          currentState = State.initital
          // 创建一个标签 token，并添加到 tokens 数组中
          // 此时 chars 数组中缓存的字符就是标签名称
          tokens.push({
            type: 'tag',
            name: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      // 状态机当前处于文本状态
      case State.text:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '<') {
          currentState = State.tagOpen
          tokens.push({
            type: 'text',
            content: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      // 状态机当前处于标签结束状态
      case State.tagEnd:
        if (isAlpha(char)) {
          currentState = State.tagEndName
          chars.push(char)
          str = str.slice(1)
        }
        break
      // 状态机当前处于结束标签名称状态
      case State.tagEndName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          currentState = State.initital
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
    }
  }

  return tokens
}

export function parse (str) {
  const tokens = tokenzie(str)
  const root = {
    type: 'Root',
    children: []
  }
  const elementStack = [root]
  while (tokens.length) {
    const parent = elementStack[elementStack.length-1]
    const t = tokens[0]
    switch (t.type) {
      case 'tag':
        const elementNode = {
          type: 'Element',
          tag: t.name,
          children: []
        }
        parent.children.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'text':
        const textNode = {
          type: 'Text',
          content: t.content
        }
        parent.children.push(textNode)
        break
      case 'tagEnd':
        elementStack.pop()
        break
    }
    tokens.shift()
  }
  return root
}

export function dump (node, indent = 0) {
  const type = node.type
  const desc = node.type === 'Root' ? '' : node.type === 'Element' ? node.tag : node.content
  console.log(`${'-'.repeat(indent)}${type}: ${desc}`)
  if (node.children) {
    node.children.forEach(n => dump(n, indent+2))
  }
}

export function traverseNode(ast, context) {
  context.currentNode = ast
  // 1. 增加退出阶段的回调函数数组
  const exitFns = []
  const transforms = context.nodeTransforms
  for (let i = 0; i< transforms.length; i++) {
    // 2. 转换函数可以返回另一个函数，该函数作为退出节点的回调函数
    const onExit = transforms[i](context.currentNode, context)
    if (onExit) {
      exitFns.push(onExit)
    }
    // transforms[i](context.currentNode, context)
    // 由于任何转换含糊都可能移除当前节点，因此每个转换函数执行完毕后，
    // 都应该检查当前节点是否已经被移除，如果被移除，直接返回即可
    if (!context.currentNode) return
  }

  const children = context.currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      // 递归调用 traverseNode 转化节点之前，将当前节点设置为父节点
      context.parent = context.currentNode
      context.childIndex = i
      traverseNode(children[i], context)
    }
  }

  // 在节点处理最后阶段执行缓存到 exitFns 中的回调函数   反序执行
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}

export function transform (ast) {
  const context = {
    currentNode: null, // 当前正在转化的节点
    childIndex: 0, // 增加 childIndex 存储当前节点在父节点 的 children 中的位置索引
    parent: null, // 存储当前转换节点的父节点
    replaceNode(node) {
      // 为了替换接地那，我们需要修改AST
      // 找到当前节点在父节点的 children 中的位置： context.children
      // 然后使用新节点替换即可
      context.parent.children[context.childIndex] = node
      // 由于当前节点已经被新节点替换掉了，因此需要将 currentNode 更新为新节点
      context.currentNode = node
    },
    removeNode() {
      if (context.parent) {
        // 调用数组的 splice 方法，根据当前节点的索引删除当前节点
        context.parent.children.splice(context.childIndex, 1)
        // 将 context.currentNode 置空
        context.currentNode = null
      }
    },
    nodeTransforms: [
      transformElement,
      transformText,
    ]
  }
  traverseNode(ast, context)
  console.log(dump(ast))
}

// 转换标签
function transformElement (node, context) {
  if (node.type === 'Element' && node.tag === 'p') {
    node.tag = 'h1'
  }
}

// 转换文本
function transformText (node, context) {
  if (node.type === 'Text') {
    // node.content = node.content.repeat(2)
    context.removeNode()
  }
}

// 创建 StringLiteral 节点
export function createStringLiteral(value) {
  return {
    type: 'StringLiteral',
    value,
  }
}

// 创建 Identifier 节点
export function createIdentifier(value) {
  return {
    type: 'Identifier',
    value,
  }
}

// 创建 ArrayExpression 节点
export function createArrayExpression(value) {
  return {
    type: 'ArrayExpression',
    value,
  }
}


