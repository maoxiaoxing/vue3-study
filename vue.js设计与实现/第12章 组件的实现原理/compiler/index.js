import { effect, getType, isObject, reactive, shallowReactive } from '../reactivity/reactivity.js'

// 文本类型节点
export const Text = Symbol()
// 注释类型节点
export const Comment = Symbol()
// Fragment 类型节点
export const Fragment = Symbol()


function createRenderer(options) {

  const {
    createElement,
    insert,
    setElementText,
    patchProps,
    createText,
    setText,
    createComment,
  } = options

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // container.innerHTML = ''
        unmount(container._vnode)
      }
    }
    container._vnode = vnode
  }

  function hydrate(vnode, container) {

  }

  function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }

    if (getType(n2.type) === 'string') {
      if (!n1) {
        mountElement(n2, container, anchor)
      } else {
        patchElement(n1, n2)
      }
    } else if (n2.type === Text) {
      if (!n1) {
        // 没有旧节点，直接创建文本节点，然后进行挂载
        const el = n2.el = createText(n2.children)
        insert(el, container)
      } else {
        const el = n2.el = n1.el
        if (n2.children !== n1.children) {
          setText(el, n2.children)
        }
      }
    } else if (n2.type === Comment) {
      if (!n1) {
        const el = n2.el = createComment(n2.children)
        insert(el, container)
      } else {
        const el = n2.el = n1.el
        if (n2.children !== n1.children) {
          setText(el, n2.children)
        }
      }
    } else if (n2.type === Fragment) {
      if (!n1) {
        if (Array.isArray(n2.children)) {
          n2.children.forEach((c) => patch(null, c, container))
        } else {
          patch(null, n2.children, container)
        }
      } else {
        patchChildren(n1, n2, container)
      }
    } else if (typeof n2.type === 'object') {
      // type 是对象，描述的是组件
      if (!n1) {
        mountComponent(n2, container, anchor)
      } else {
        patchComponent(n1, n2, anchor)
      }
    }

  }

  function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((c) => unmount(c))
      }
  
      setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      // patchKeyChildren(n1, n2, container)
      patchKeyedChildren(n1, n2, container)
    } else {
      // setElementText(container, '')
      // n2.children.forEach((c) => patch(null, c, container))
      if (Array.isArray(n1.children)) {
        n1.children.forEach((c) => unmount(c))
      } else if (typeof n1.children === 'string') {
        setElementText(container, '')
      }
    }
  }

  // 双指针遍历
  function patchKeyChildren(n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children
    let oldStartIdx = 0
    let oldEndIdx = oldChildren.length - 1
    let newStartIdx = 0
    let newEndIdx = newChildren.length - 1

    let oldStartVNode = oldChildren[oldStartIdx]
    let oldEndVNode = oldChildren[oldEndIdx]
    let newStartVNode = newChildren[newStartIdx]
    let newEndVNode = newChildren[newEndIdx]

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (!oldStartVNode) {
        oldStartVNode = oldChildren[++oldStartIdx]
      } else if (!oldEndVNode) {
        oldEndVNode = newChildren[--oldEndIdx]
      } else if (oldStartVNode.key === newStartVNode.key) {
        // 头部老节点 和 头部新节点 相等 不需要操作
        patch(oldStartVNode, newStartVNode, container)
        oldStartVNode = oldChildren[++oldStartIdx]
        newStartVNode = newChildren[++newStartIdx]
      } else if (oldEndVNode.key === newEndVNode.key) {
        patch(oldEndVNode, newEndVNode, container)
        oldEndVNode = oldChildren[--oldEndIdx]
        newEndVNode = newChildren[--newEndIdx]
      } else if (oldStartVNode.key === newEndVNode.key) {
        patch(oldStartVNode, newEndVNode, container)
        insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)
        oldStartVNode = oldChildren[++oldStartIdx]
        newEndVNode = newChildren[--newEndIdx]
      } else if (oldEndVNode.key === newStartVNode.key) {
        patch(oldEndVNode, newStartVNode, container)
        // oldEndVNode.el 移动到 oldStartVNode.el 前面
        insert(oldEndVNode.el, container, oldStartVNode.el)
        oldEndVNode = oldChildren[--oldEndIdx]
        newStartVNode = newChildren[++newStartIdx]
      } else {
        const idxInOld = oldChildren.findIndex((node) => {
          console.log(node, newStartVNode)
          return node.key === newStartVNode.key
        })
        if (idxInOld > 0) {
          const vnodeToMove = oldChildren[idxInOld]
          patch(vnodeToMove, newStartVNode, container)
          insert(vnodeToMove.el, container, oldStartVNode.el)
          oldChildren[idxInOld] = undefined
          // newStartVNode = newChildren[++newStartIdx]
        } else {
          // 将 newStartVNode 作为新节点挂载到头部，使用当前头部节点 oldStartVNode.el 作为锚点
          // console.log((null, newStartVNode, container, oldStartVNode.el))
          patch(null, newStartVNode, container, oldStartVNode.el)
        }
        newStartVNode = newChildren[++newStartIdx]
      }
    }

    if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        patch(null, newChildren[i], container, newStartVNode.el)
      }
    } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        unmount(oldChildren[i])
      }
    }

  }

  function patchKeyedChildren(n1, n2, container) {
    const newChildren = n2.children
    const oldChildren = n1.children
    let j = 0
    let oldVNode = oldChildren[j]
    let newVNode = newChildren[j]
    while (oldVNode && newVNode && oldVNode.key === newVNode.key) {
      patch(oldVNode, newVNode, container)
      j++
      oldVNode = oldChildren[j]
      newVNode = newChildren[j]
    }

    let oldEnd = oldChildren.length - 1
    let newEnd = newChildren.length - 1

    oldVNode = oldChildren[oldEnd]
    newVNode = newChildren[newEnd]

    console.log(oldVNode, newVNode)
    while (oldVNode && newVNode && oldVNode.key === newVNode.key) {
      patch(oldVNode, newVNode, container)
      oldEnd--
      newEnd--
      oldVNode = oldChildren[oldEnd]
      newVNode = newChildren[newEnd]
    }

    // 预处理后，如果满足条件，则从 j 到 newEnd 之间的节点作为新节点插入
    if (j > oldEnd && j <= newEnd) {
      const anchorIndex = newEnd + 1
      const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
      while (j <= newEnd) {
        patch(null, newChildren[j++], container, anchor)
      }
    } else if (j > newEnd && j <= oldEnd) {
      // j 到 oldEnd 之间的元素需要卸载
      while (j <= oldEnd) {
        unmount(oldChildren[j++])
      }
    } else {
      const count = newEnd - j + 1
      const source = new Array(count)
      source.fill(-1)
      const oldStart = j
      const newStart = j
      let moved = false
      let pos = 0
      const keyIndex = {}
      for (let i = newStart; i <= newEnd; i++) {
        keyIndex[newChildren[i].key] = i
      }
      let patched = 0
      for (let i = oldStart; i <= oldEnd; i++) {
        const oldVNode = oldChildren[i]
        if (patched <= count) {
          const k = keyIndex[oldVNode.key]
          if (typeof k !== 'undefined') {
            const newVNode = newChildren[k]
            patch(oldVNode, newVNode, container)
            patched++
            source[k - newStart] = i
            if (k < pos) {
              moved = true
            } else {
              pos = k
            }
          } else {
            unmount(oldVNode)
          }
        } else {
          unmount(oldVNode)
        }
      }

      if (moved) {
        const seq = getSequence(source)
        let s = seq.length - 1
        let i = count - 1
        for (i; i >= 0; i--) {
          if (source[i] === -1) {
            const pos = i + newStart
            const newVNode = newChildren[pos]
            const nextPos = pos + 1
            const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
            patch(null, newVNode, container, anchor)
          } else if (i !== seq[s]) {
            const pos = i + newStart
            const newVNode = newChildren[pos]
            const nextPos = pos + 1
            const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
            insert(newVNode.el, container, anchor)
          } else {
            s--
          }
        }
      }
    }

  }

  function patchElement(n1, n2) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props
    for(const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key])
      }
    }
    for(const key in newProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null)
      }
    }
    patchChildren(n1, n2, el)
  }

  function mountElement(vnode, container, anchor) {
    const el = vnode.el = createElement(vnode.type)
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
    insert(el, container, anchor)
  }

  function patchComponent (n1, n2, anchor) {
    const instance = (n2.component = n1.component)
    const {
      props
    } = instance
    if (hasPropsChanged(n1.props, n2.props)) {
      const [nextProps] = resolveProps(n2.type.props, n2.props)
      for (const k in nextProps) {
        props[k] = nextProps[k]
      }
      for (const k in props) {
        if (!(k in nextProps)) {
          delete props[k]
        }
      }
    }
  }

  function mountComponent (vnode, container, anchor) {
    const componentOptions = vnode.type
    const { 
      render,
      data, 
      beforeCreate, 
      created, 
      beforeMount, 
      mounted, 
      beforeUpdate, 
      updated,
      props: propsOption
    } = componentOptions

    // 组件创建之前
    beforeCreate && beforeCreate()
    const state = reactive(data())

    const [props, attrs] = resolveProps(propsOption, vnode.props)

    const instance = {
      state,
      props: shallowReactive(props),
      isMounted: false,
      subTree: null,
    }
    vnode.component = instance

    const renderContext = new Proxy(instance, {
      get (t, k, r) {
        const {
          state,
          props,
        } = t
        if (state && k in props) {
          return state[k]
        } else if (k in props) {
          return props[k]
        } else {
          console.error('不存在')
        }
      },
      set (t, k, v, r) {
        const {
          state,
          props,
        } = t
        if (state && k in props) {
          state[k] = v
        } else if (k in props) {
          props[k] = v
        } else {
          console.error('不存在')
        }
      }
    })

    console.log(renderContext, 'renderContext')
    // 组件已经创建
    created && created.call(renderContext)

    effect(() => {
      const subTree = render.call(state, state)
      // 检查组件是否已经被挂载
      if (!instance.isMounted) {
        // 组件更新之前
        beforeMount && beforeMount.call(state)
        patch(null, subTree, container, anchor)
        instance.isMounted = true
        // 组件已经更新
        mounted && mounted.call(state)
      } else {
        // 组件更新之前
        beforeUpdate && beforeUpdate.call(state)
        // isMounted 为true 组件已经被挂载，只需要进行更新
        patch(instance.subTree, subTree, container, anchor)
        // 组件更新之后
        updated && updated.call(state)
      }
      instance.subTree = subTree
    }, {
      scheduler: queueJob,
    })
  }

  return {
    render,
    hydrate,
  }
}

function hasPropsChanged (prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps)
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true
  }

  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i]
    if (nextProps[key] !== prevProps[key]) {
      return true
    }
  }
  return false
}

/**
 * 
 * @param {*} options 组件接收的 props
 * @param {*} propsData 传入组件的 props
 * @returns 
 */
function resolveProps(options, propsData) {
  const props = {}
  const attrs = {}
  for (const key in propsData) {
    if (key in options) {
      props[key] = propsData[key]
    } else {
      attrs[key] = propsData[key]
    }
  }
  return [props, attrs]
}

// 任务缓存队列，对响应式 effectFn 进行去重
const queue = new Set()
// 代表正在刷新任务队列
let isFlushing = false
const p = Promise.resolve()

// 调度器，将任务添加到缓冲队列中，开始刷新队列
function queueJob(job) {
  queue.add(job)
  console.log(queue, 'queue')
  if (!isFlushing) {
    isFlushing = true
    p.then(() => {
      try {
        queue.forEach((job) => job())
      } finally {
        isFlushing = false
        queue.length = 0
      }
    })
  }
}


function unmount(vnode) {
  if (vnode.type === Fragment) {
    if (Array.isArray(vnode.children)) {
      vnode.children.forEach((c) => unmount(c))
    } else {
      unmount(vnode.children)
    }
    return
  }
  const parent = vnode.el.parentNode
  if (parent) {
    parent.removeChild(vnode.el)
  }
}

function shouldSetAsProps(el, key, value) {
  // 处理 input 的只读属性，值设置 HTML Attrbutes，而不设置 DOM Properties
  if (key === 'form' && el.tagName === 'INPUT') {
    return false
  }
  return key in el
}

function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i,j,u,v,c
  const len = arr.length
  for (i = i; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u+v)/2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while(u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
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
    // parent.children = el
    parent.insertBefore(el, anchor)
  },
  createText(text) {
    return document.createTextNode(text)
  },
  createComment(text) {
    return document.createComment(text)
  },
  setText(el, text) {
    el.nodeValue = text
  },
  patchProps(el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
      const invokers = el._vei || (el._vei = {})
      let invoker = invokers[key]
      const name = key.slice(2).toLowerCase()
      if (nextValue) {
        // 没有 invoker ,将 invoker 缓存到 el._vei中
        if (!invoker) {
          invoker = el._vei[key] = (e) => {
            // 如果事件发生时间小于事件绑定时间，则不执行事件
            if (e.timeStamp < invoker.attached) {
              return
            }
            // 如果 invoker.value 是数组，遍历执行每一个事件
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach((fn) => fn(e))
            } else {
              invoker.value(e)
            }
          }
          invoker.value = nextValue
          // 存储事件处理函数被绑定的时间
          invoker.attached = performance.now()
          el.addEventListener(name, invoker)
        } else {
          invoker.value = nextValue
        }
      } else if (invoker) {
        // 如果 invoker 存在，意味着更新，并且只需要更新 invoker.value的值
        el.removeEventListener(name, invoker)
      }
    } else if (key === 'class') {
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

// 格式化css
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
