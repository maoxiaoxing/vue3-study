import { getType, isObject } from '../reactivity/index.js'

function createRenderer(options) {

  const {
    createElement,
    insert,
    setElementText,
    patchProps,
  } = options

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        container.innerHTML = ''
      }
    }
    container._vnode = vnode
  }

  function hydrate(vnode, container) {

  }

  function patch(n1, n2, container) {
    if (!n1) {
      mountElement(n2, container)
    } else {
  
    }
  }

  function mountElement(vnode, container) {
    const el = createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => {
        patch(null, child, el)
      })
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key]
        patchProps(el, key, null, value)
      }
    }
    insert(el, container)
  }

  return {
    render,
    hydrate,
  }
}

function shouldSetAsProps(el, key, value) {
  // 处理 input 的只读属性，值设置 HTML Attrbutes，而不设置 DOM Properties
  if (key === 'form' && el.tagName === 'INPUT') {
    return false
  }
  return key in el
}

export const renderer = createRenderer({
  createElement(tag) {
    return document.createElement(tag)
    // return {
    //   tag,
    // }
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, parent, anchor = null) {
    console.log(el, parent, anchor, 'pa')
    // parent.children = el
    parent.insertBefore(el, anchor)
  },
  patchProps(el, key, prevValue, nextValue) {
    if (key === 'class') {
      el.className = nextValue || ''
    } else if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key]
      // 如果是 boolean 类型 并且 value 是空字符串，将矫正为true
      if (type === 'boolean' && nextValue === '') {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  }
})

export function normalizeClass(_value) {
  const dfs = (value) => {
    let res = ''
    if (getType(value) === 'string') {
      res = value
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        res += normalizeClass(value[i]) + ' '
      }
    } else if (isObject(value)) {
      for (const name in value) {
        if (value[name]) {
          res += name + ' '
        }
      }
    }
    return res.trim()
  }
  return dfs(_value)
}
