<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightList" border stripe >
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <!-- 获取数据放在scope中 -->
          <template v-slot="scope">
            <el-tag type="" v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Rights",
  props: {},
  data() {
    return {
      // 获取数据的存储位置
      rightList:[],
    };
  },
  // 在创建后调用
  created() {
    this.getRightList();
  },
  methods: {
    // 获取最新数据放在rightList
    getRightList(){
      this.$http.get('rights/list').then(res=>{
        if(res.data.meta.status !== 200){
          return this.$message.error('获取失败！')
        }else{
          this.rightList = res.data.data;
          // console.log(this.rightList);
          
        }
      })  
    }
  },
  components: {}
};
</script>

<style scoped>
</style>
