<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 用户搜索区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="centerDialogVisible=!centerDialogVisible">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210px">
          <template v-slot="scope">
            <el-tooltip effect="dark" content="修改角色" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" @click="editUser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除角色" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" @click="romoveUser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户区域 -->
    <el-dialog
      title="添加用户"
      :visible.sync="centerDialogVisible"
      width="50%"
      center
      @close="addFormClose"
    >
      <!-- 主体区域 -->
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" center>
      <el-form :model="editForm" :rules="addRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 这是分配角色的对话框 -->
    <el-dialog title="提示" :visible.sync="setRolesVisible" width="50%">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="chooseRole" placeholder="请选择角色">
            <el-option v-for="item in rolesList" :key="item.id"
            :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Users",
  props: {},
  data() {
    // 验证邮箱的规则
    let checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      // test方法是有满足匹配
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入正确邮箱"));
    };
    //验证手机号的规则
    let checkMobile = (rule, value, cb) => {
      const regMobile = /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入正确手机号"));
    };
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      //添加用户是否  展开
      centerDialogVisible: false,
      //修改用户的对话框
      editDialogVisible: false,
      // 所有角色的数据列表
      rolesList:[],
      userInfo:{},
      // 被选中的值展示到下拉菜单中
      chooseRole:'',
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 控制分配角色的对话框
      setRolesVisible:false,
      //修改用户信息
      editForm: {},
      addRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 15, message: "长度在 3 到 15 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败");
      }
      this.userList = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    async userStateChanged(userinfo) {
      // console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("失败");
      }
      return this.$message.success("更新用户状态成功");
    },
    //关闭添加用户后重置表单
    addFormClose() {
      this.$refs.addFormRef.resetFields();
    },
    //添加用户的判断
    addUser() {
      this.$refs.addFormRef.validate(valida => {
        if (!valida) return;
        this.$http.post("users", this.addForm).then(res => {
          if (res.data.meta.status !== 201) {
            this.$message.error("添加用户失败");
          } else {
            this.$message.success("添加用户成功");
            this.centerDialogVisible = false;
            this.getUserList();
          }
        });
      });
    },
    // 编辑修改用户对话框
    editUser(id) {
      this.$http.get("users/" + id).then(res => {
        if (res.data.meta.status !== 200)
          return this.$message.error("请求失败");
        this.editForm = res.data.data;
      });
      this.editDialogVisible = true;
      // console.log(id);
    },
    editUserInfo() {
      this.$refs.editFormRef.validate(valida => {
        if (!valida) return;
        this.$http
          .put("users/" + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          .then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error("更新信息失败");
            } else {
              this.getUserList();
              this.editDialogVisible = false;
              return this.$message.success("更新信息成功");
            }
          });
      });
    },
    romoveUser(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      })
        .then(res => {
          this.$http.delete("users/" + id).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error("删除失败");
            } else {
              this.getUserList();
              return this.$message.success("删除成功");
            }
          });
        })
        .catch(err => {
          this.$message.info("已取消删除");
        });
    },
    // 下拉菜单的选择角色
    setRole(userInfo){
      this.userInfo = userInfo
      this.$http.get('roles').then(res=>{
        this.rolesList = res.data.data
        this.setRolesVisible = true;
        console.log(this.rolesList);
        
      }).catch(err=>{
        return this.$message.error('获取失败')
      })
    },
    saveRoleInfo(){
      if(!this.chooseRole){
        return $this.$message.error('请选择角色')
      }
      this.$http.put(`users/${this.userInfo.id}/role`,{
        rid:this.chooseRole
      }).then(res=>{
        this.$message.success('分配成功')
        this.setRolesVisible = false;
        this.getUserList();
      }).catch(err=>{
        return $this.$message.error('分配失败')
      })
    }
  },
  components: {}
};
</script>

<style scoped>
</style>
