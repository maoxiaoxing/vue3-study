
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
  // 将转换代码编写在退出阶段的回调函数中
  // 这样可以保证该标签节点的子节点全部被处理完毕
  return () => {
    // 如果被转换的节点不是元素节点，则什么都不做
    if (node.type !== 'Element') {
      return
    }

    // 1. 创建 h 函数调用语句
    // h 函数调用的第一个参数是标签名称，因此我们以 node.tag 来创建一个字符串字面量节点， 作为第一个参数
    const callExp = createCallExpression('h', [
      createStringLiteral(node.tag)
    ])
    // 2. 处理 h 函数调用的参数
    node.children.length === 1 ?
      // 如果当前标签节点只有一个子节点，则直接使用子节点的 jsNode 作为参数
      callExp.arguments.push(node.children[0].jsNode) :
      // 如果当前标签节点有多个子节点 则创建一个 ArrayExpression 节点作为参数
      callExp.arguments.push(
        // 数组的每个元素都是子节点的 jsNode
        createArrayExpression(node.children.map(c => c.jsNode))
      )
    // 3. 将当前标签节点对应的 JavaScript AST 添加到 jsNode 属性下
    node.jsNode = callExp
  }
}

// 转换文本
function transformText (node, context) {
  if (node.type !== 'Text') {
    return
  }

  // 文本节点对应的 JavaScript AST 节点就是一个字符串字面量
  // 因此只需要使用 node.content 创建一个 StringLiteral 类型的节点即可
  // 最后将文本节点对应的 JavaScript AST 节点添加到 node.jsNode 属性下
  node.jsNode = createStringLiteral(node.content)
}

export function transformRoot(node) {
  return () => {
    if (node.type !== 'root') {
      return
    }
    // node 是根节点 根节点的第一个节点就是模板的根节点
    // 这里暂时不考虑模板存在多个根节点
    const vnodeJSAST = node.children[0].jsNode
    // 创建 render 函数逇声明语句节点，将 vnodeJSAST 作为 render 函数体的返回语句
    node.jsNode = {
      type: 'FunctionDecl',
      id: {
        type: 'Identifier',
        name: 'render',
      },
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: vnodeJSAST
        }
      ]
    }
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
export function createIdentifier(name) {
  return {
    type: 'Identifier',
    name,
  }
}

// 创建 ArrayExpression 节点
export function createArrayExpression(elements) {
  return {
    type: 'ArrayExpression',
    elements,
  }
}

// 创建 CallExpression 节点
export function createCallExpression(callee, arguments) {
  return {
    type: 'CallExpression',
    callee: createIdentifier(callee),
    arguments,
  }
}

export function generate(node) {
  const context = {
    // 存储最终生成的渲染函数代码
    code: '',
    // 生成代码时，通过调用 push 函数完成代码的拼接
    push(code) {
      context.code += code
    },
    currentIndent: 0, // 当前缩进的界别，初始值为0，即没有缩进
    // 该函数用来换行，即在代码字符串的后面追加 \n 字符
    // 另外，换行时应该保留缩进，所以我们还要追加 currentIndent * 2 个空格字符
    newline() {
      context.code += '\n' + `  `.repeat(context.currentIndent)
    },
    // 用来缩进，让 currentIndent 自增后，调用换行函数
    deIndent() {
      context.currentIndent--
      context.newline()
    }
  }

  genNode(node, context)
  return context.node

}

export function compile(template) {
  // 模板 ast
  const ast = parse(template)
  // 将模板 AST 转换为 JavaScript AST
  transform(ast)
  const code = generate(ast.jsNode)
  return code
}


