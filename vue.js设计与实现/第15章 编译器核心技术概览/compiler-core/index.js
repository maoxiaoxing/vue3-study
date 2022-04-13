
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
          // 状态机奇幻岛开始状态
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
