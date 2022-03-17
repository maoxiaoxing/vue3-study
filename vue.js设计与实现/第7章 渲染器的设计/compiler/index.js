
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
    const el = document.createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    }
    // container.appendChild(el)
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
    return {
      tag,
    }
  },
  setElementText(el, text) {
    el.text = text
  },
  insert(el, parent, anchor = null) {
    parent.children = el
    console.log(el, parent, 'pa')
  }
})
