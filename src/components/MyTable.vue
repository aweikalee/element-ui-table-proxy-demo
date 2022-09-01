<script lang="ts">
import { defineComponent, PropType } from 'vue'
import Table from 'element-ui/lib/table'
import TableColumn from 'element-ui/lib/table-column'
import 'element-ui/lib/theme-chalk/table.css'

import { cloneVNode } from './vnode'
import * as storage from './storage'
import { useKeepScroll } from './useKeepScroll'

export interface IMyTableColumnProps {
  prop?: string
  label?: string
  fixed?: 'left' | 'right' | boolean
  visiable?: boolean
}

function isElTableColumn(vnode: any): vnode is TableColumn {
  return vnode?.componentOptions?.Ctor?.options?.name === TableColumn.name
}

function getColumnData(child: any): IMyTableColumnProps {
  const props = child.componentOptions.propsData ?? {}
  return {
    prop: props.prop,
    label: props.label,
    fixed: props.fixed,
    visiable: props.visiable ?? true,
  }
}

function isSameColumns(a: IMyTableColumnProps[], b: IMyTableColumnProps[]) {
  if (a.length !== b.length) return false

  const keys = a[0] ? Object.keys(a[0]) : []
  for (let i = 0; i < a.length; i += 1) {
    const _a = a[i]
    const _b = b[i]
    const isSame = keys.every((key) => _a[key] === _b[key])
    if (!isSame) return false
  }
  return true
}

export default defineComponent({
  name: 'MyTable',
  inheritAttrs: false,

  props: {
    columns: Array as PropType<IMyTableColumnProps[]>,
  },

  data() {
    return {
      /* 强制更新 el-table */
      key: 0,

      /* 列的排序与部分属性 */
      // slots 中获取的
      columnsFromSlot: [] as IMyTableColumnProps[],
      // 本地储存的
      columnsFromStorage: (storage.get('columns') ??
        []) as IMyTableColumnProps[],
      // 渲染用的
      columnsRender: [] as IMyTableColumnProps[],
    }
  },

  computed: {
    watchColumns() {
      return [this.columnsFromSlot, this.columnsFromStorage]
    },
  },

  watch: {
    columnsRender() {
      this.key += 1
    },
    columns(value) {
      if (value === this.columnsRender) return
      this.columnsFromStorage = value
      storage.set('columns', value)
    },

    // 当 columnsFromSlot 或 columnsFromStorage 有变更
    // 重新生成 columnsRender
    watchColumns() {
      const slot = [...this.columnsFromSlot]
      const storage = [...this.columnsFromStorage]

      let res: IMyTableColumnProps[] = []
      storage.forEach((props) => {
        const index = slot.findIndex(({ prop }) => prop === props.prop)
        if (~index) {
          const propsFromSlot = slot[index]
          res.push({
            ...propsFromSlot, // 可能新增属性 所以用 slot 的数据打个底
            ...props,
          })
          slot.splice(index, 1) // storage 里不存在的列
          // slot 中没有找到的 则会被过滤掉
        }
      })
      this.columnsRender = slot.concat(res)

      this.$emit('update:columns', this.columnsRender)
    },
  },

  mounted() {
    /* 追加功能 */
    // 记录滚动条位置
    const { setElement } = useKeepScroll(this)
    setElement(this.$refs.table?.$refs.bodyWrapper)

    // 解决 KeepAlive 恢复时布局错位
    let firstActivated = true
    this.$on('hook:activated', () => {
      if (firstActivated) {
        firstActivated = false
        return
      }
      this.$refs.table?.doLayout()
    })
  },

  destroyed() {
    /* 当前组件销毁 清空 columns */
    this.$emit('update:columns', [])
  },

  render(h) {
    /* 对 slot 进行分类 */
    const slots = {
      left: [] as TableColumn[], // ElTableColumn 且存在 prop 属性
      main: [] as TableColumn[], // ElTableColumn 不存在 prop 属性，但 fixed="left"
      other: [] as TableColumn[], // 其他
    }

    this.$slots.default?.forEach((vnode: any) => {
      if (isElTableColumn(vnode)) {
        const { prop, fixed } = getColumnData(vnode)
        if (prop !== undefined) return slots.main.push(vnode)
        if (fixed === 'left') return slots.left.push(vnode)
      }
      slots.other.push(vnode)
    })

    /* 更新 列的数据 */
    const columnsFromSlot = slots.main.map((vnode) => getColumnData(vnode))
    const isSame = isSameColumns(this.columnsFromSlot, columnsFromSlot)
    if (!isSame) {
      // 赋值会使 render 重新执行
      this.columnsFromSlot = columnsFromSlot
    }

    /* 对列进行筛选与排序 */
    const refactorySlot = () => {
      const { main } = slots
      const columnsProp = main.map((vnode) => getColumnData(vnode).prop)

      /* 对 slot.main 进行改写 */
      const refactorySlot: any[] = []
      this.columnsRender.forEach(({ prop, visiable, fixed }) => {
        if (!visiable) return

        let vnode: any = main.find((_, index) => prop === columnsProp[index])

        if (!vnode) return
        vnode = cloneVNode(vnode)

        // componentOptions 在 cloneVNode 时是直接引用的
        // 后续要修改所以主动拷贝一份
        vnode.componentOptions = { ...vnode.componentOptions }
        vnode.componentOptions.propsData = {
          ...vnode.componentOptions.propsData,
        }

        const propsData = vnode.componentOptions.propsData

        if (fixed !== undefined) propsData.fixed = fixed

        refactorySlot.push(vnode)
      })

      return refactorySlot
    }

    return h(
      Table,
      {
        ref: 'table',
        attrs: {
          ...this.$attrs,
          key: this.key,
        },
      },
      [slots.left as any, refactorySlot(), slots.other as any]
    )
  },
})
</script>
