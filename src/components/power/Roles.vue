<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <!-- v-slot="scope" -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              v-for="(item1,i) in scope.row.children"
              :key="i"
              :class="['roles-bottom-bd',i===0?'roles-top-bd':'','vcenter']"
            >
              <el-col :span="5">
                <el-tag
                  type
                  closable
                  @close="removeRightRole(scope.row,item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="i2"
                  :class="[i2===0?'':'roles-top-bd','vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightRole(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-row>
                      <el-tag
                        type="warning"
                        v-for="(item3,i3) in item2.children"
                        :key="i3"
                        closable
                        @close="removeRightRole(scope.row,item3.id)"
                      >{{item3.authName}}</el-tag>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-edit">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-edit" @click="showRolesAllRights(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="rolesAllRights" width="50%" @close="closeAllChlidren">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox 
      node-key="id" default-expand-all :default-checked-keys="defKeys"
      ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesAllRights = false">取 消</el-button>
        <el-button type="primary" @click="chooseRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  props: {},
  data() {
    return {
      roleList: [],
      rolesAllRights:false,
      rightsList:[],
      treeProps:{
        label:'authName',
        children:'children'
      },
      //获取已存在的权限的节点
      defKeys:[],
      roleId:''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取角色列表方法
    getRolesList() {
      this.$http.get("roles").then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取失败");
        } else {
          this.roleList = res.data.data;
        }
      });
    },
    // 删除用户权限的方法
    removeRightRole(role, id) {
      this.$confirm("此操作将永久删除该权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      })
        .then(res => {
          // console.log('123');
          this.$http.delete(`roles/${role.id}/rights/${id}`).then(res => {
            // role.data = res.data.data;
            // this.getRolesList();
            console.log(res);
            if (res.data.meta.status !== 200) {
              return this.$message.error("删除失败");
            } else {
              // this.getRolesList();
              role.children = res.data.data;
            }
          });
        })
        .catch(err => {
          this.$message.info("已取消删除");
        });
    },
    // 获取所有的权限数据
    showRolesAllRights(role){
      this.roleId = role.id;
      this.$http.get('rights/tree').then(res=>{
        // console.log(res.data.data);
        this.rightsList = res.data.data
        //递归获取三级节点
        this.getLeafKeys(role,this.defKeys)
        // console.log(this.defKeys);
        
        this.rolesAllRights = true
      }).catch(err=>{
        return this.$message.error('获取数据失败')
      })
    },
    // 通过递归的形式来获取角色下所以三级权限的id，
    // 并保存的defKey中
    getLeafKeys(node,arr){
      // 如果当前node不包含children属性就是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
      });
    },
    closeAllChlidren(){
      this.defKeys = [];
    },
    chooseRights(){
      const chooseR = [...this.$refs.treeRef.getCheckedKeys(),
      ...this.$refs.treeRef.getHalfCheckedKeys()];
      // console.log(chooseR);
      const idStr = chooseR.join(',')
      this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr}).
      then(res=>{
        this.$message.success('分配成功！')
        this.getRolesList();
        this.rolesAllRights = false;
      }).catch(err=>{
        return this.$message.error('获取失败')
      })
    }
  },
  components: {}
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.roles-top-bd {
  border-top: 1px solid #eee;
}
.roles-bottom-bd {
  border-bottom: 1px solid #eee;
}
</style>
