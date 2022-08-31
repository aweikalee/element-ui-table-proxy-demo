<template>
  <el-dropdown trigger="click">
    <el-button type="primary">动态列</el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <div class="my-table-toolbar">
          <VueDraggable v-model="proxyColumns" item-key="prop">
            <div
              class="my-table-toolbar__item"
              v-for="(element, index) in proxyColumns"
            >
              <el-checkbox
                :value="element.visiable"
                @change="toggleVisiable(element, index)"
                >{{ element.label }}</el-checkbox
              >

              <el-button
                :type="element.fixed === 'left' ? 'primary' : 'default'"
                size="mini"
                @click="setFixed(element, index, 'left')"
                >左固定</el-button
              >
              <el-button
                :type="element.fixed === 'right' ? 'primary' : 'default'"
                size="mini"
                @click="setFixed(element, index, 'right')"
                >右固定</el-button
              >
            </div>
          </VueDraggable>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import VueDraggable from "vuedraggable"
import { IMyTableColumnProps } from "./MyTable.vue"

export default defineComponent({
  components: {
    VueDraggable,
  },

  props: {
    columns: Array as PropType<IMyTableColumnProps[]>,
  },

  computed: {
    proxyColumns: {
      get(): IMyTableColumnProps[] {
        return this.columns ?? []
      },
      set(value: IMyTableColumnProps[]) {
        this.$emit("update:columns", value)
      },
    },
  },

  methods: {
    toggleVisiable(data: IMyTableColumnProps, index: number) {
      const newData = { ...data }
      const _columns = this.proxyColumns.slice()
      newData.visiable = !newData.visiable
      _columns[index] = newData
      this.proxyColumns = _columns
    },

    setFixed(
      data: IMyTableColumnProps,
      index: number,
      value: "left" | "right"
    ) {
      const newData = { ...data }
      const _columns = this.proxyColumns.slice()
      const oldFixed = newData.fixed
      if (oldFixed) {
        if (oldFixed === value) {
          newData.fixed = false
        } else {
          newData.fixed = oldFixed === "left" ? "right" : "left"
        }
      } else {
        newData.fixed = value
      }
      _columns[index] = newData
      this.proxyColumns = _columns
    },
  },
})
</script>

<style lang="less" scoped>
.my-table-toolbar {
  &__item {
    display: flex;
    align-items: center;
    padding: 0 10px;
    :deep(.el-checkbox) {
      margin-right: 10px;
    }
  }

  &__fixed {
    cursor: pointer;
  }
}
</style>
