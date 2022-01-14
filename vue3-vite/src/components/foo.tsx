import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  props: {
    msg: {
      type: String,
    }
  },
  setup () {
    return (props: any) => {
      return <div>{props.msg}</div>
    }
  }
})

// export default defineComponent({
//   data () {
//     return {
//       count: 0
//     }
//   },
//   render () {
//     return (
//       <div>foo</div>
//     )
//   }
// })

// export default () => {
//   return (
//     <div>
//       foo
//     </div>
//   )
// }
