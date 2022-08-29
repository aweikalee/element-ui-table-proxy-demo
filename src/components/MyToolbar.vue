<template>
  <el-dropdown trigger="click">
    <el-button type="primary">动态列</el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <div class="my-table-toolbar">
          <VueDraggable v-model="columns" item-key="prop">
            <div
              class="my-table-toolbar__item"
              v-for="(element, index) in columns"
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
import { defineComponent } from "vue"
import VueDraggable from "vuedraggable"
import { IMyTableColumnProps } from "./MyTable.vue"

export default defineComponent({
  components: {
    VueDraggable,
  },

  props: {
    table: Object,
  },

  data() {
    return {
      tableRef: null,
    }
  },

  watch: {
    table: {
      handler(value) {
        this.tableRef = value
      },
      immediate: true,
    },
  },

  computed: {
    columns: {
      get(): IMyTableColumnProps[] {
        return this.tableRef?.columns ?? []
      },
      set(value: IMyTableColumnProps[]) {
        this.tableRef?.updateColumns(value)
      },
    },
  },

  methods: {
    toggleVisiable(data: IMyTableColumnProps, index: number) {
      const newData = { ...data }
      const _columns = this.columns.slice()
      newData.visiable = !newData.visiable
      _columns[index] = newData
      this.tableRef?.updateColumns(_columns)
    },

    setFixed(
      data: IMyTableColumnProps,
      index: number,
      value: "left" | "right"
    ) {
      const newData = { ...data }
      const _columns = this.columns.slice()
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
      this.tableRef?.updateColumns(_columns)
    },

    updateTableRef(value) {
      this.tableRef = value
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
