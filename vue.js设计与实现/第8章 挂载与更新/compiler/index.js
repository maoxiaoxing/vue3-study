
function createRenderer(options) {

  const {
    createElement,
    insert,
    setElementText,
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
        if (key in el) {
          const type = typeof el[key]
          const value = vnode.props[key]
          // 如果是 boolean 类型 并且 value 是空字符串，将矫正为true
          if (type === 'boolean' && value === '') {
            el[key] = true
          } else {
            el[key] = value
          }
        } else {
          el.setAttribute(key, vnode.props[key])
        }
      }
    }
    console.log(container, el, 'ff')
    insert(el, container)
  }

  return {
    render,
    hydrate,
  }
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
  }
})
