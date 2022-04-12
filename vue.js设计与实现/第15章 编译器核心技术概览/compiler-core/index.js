
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

function tokenzie(str) {
  // 状态机当前状态
  let currentState = State.initital
  // 缓存字符
  const chars = []
  // 生成的 token 会存储到 tokens 数组中，并作为函数的返回值返回
  const tokens = []
  while (str) {

  }
}
