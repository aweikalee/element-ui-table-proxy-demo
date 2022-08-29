<template>
  <div>
    <keep-alive>
      <MyTable
        v-if="show"
        :data="data"
        ref="table"
        max-height="400"
        :style="{ maxWidth: '500px' }"
        :toolbar="$refs.toolbar"
      >
        <el-table-column prop="id" label="ID" min-width="50" />

        <el-table-column prop="order" label="订单号" min-width="200" />

        <el-table-column prop="price" label="价格" min-width="100">
          <template #default="{ row }">￥{{ row.price }}</template>
        </el-table-column>

        <el-table-column prop="amount" label="总计" min-width="100">
          <template #default="{ row }">{{ row.amount }}件</template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="100" />
      </MyTable>
    </keep-alive>

    <MyToolbar ref="toolbar" :table="$refs.table" />
    <el-button @click="show = !show">显隐（KeepAlive）</el-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import * as api from "./api"

import MyTable from "./components/MyTable.vue"
import MyToolbar from "./components/MyToolbar.vue"

export default defineComponent({
  components: {
    MyTable,
    MyToolbar,
  },

  data() {
    return {
      show: true,
      data: [],
      columns: [],
    }
  },

  created() {
    this.fetchMore()
  },

  methods: {
    async fetchMore() {
      this.data = await api.list()
    },
  },
})
</script>
