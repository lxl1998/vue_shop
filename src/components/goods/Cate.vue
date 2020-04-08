<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="treetable"
      >
        <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" type v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
          <!-- <el-tag size="mini" type="">一级</el-tag>
          <el-tag size="mini" type="success">二级</el-tag>
          <el-tag size="mini" type="warning">三级</el-tag>-->
        </template>
        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
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
    <!-- 添加分类的对话框 -->
    <el-dialog title="提示" :visible.sync="addCateVisible" width="50%"
    @close="addCateColse">
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRulesRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedkeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            class="el-cascader-panel"
            :collapse-tags="true"
            clearable 
            change-on-select 
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  props: {},
  data() {
    return {
      // 查询的条件，num是第几页，size是显示几个
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表数据为空
      cateList: [],
      // 总数
      total: 0,
      // 控制添加分类对话框的显示
      addCateVisible: false,
      // 父级分类的列表
      parentCateList: [],
      // 指定级别的对象
      cascaderProps:{
        expandTrigger: 'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      // 被选中之后保存的数组
      selectedkeys:[],
      // 添加分类的表单对象
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      // tree-table的指定定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok"
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ]
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    getCateList() {
      this.$http
        .get("categories", { params: this.queryInfo })
        .then(res => {
          // console.log(res.data);
          this.cateList = res.data.data.result;
          // console.log(this.cateList);

          this.total = res.data.data.total;
        })
        .catch(err => {
          return this.$message.err("获取失败");
        });
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击按钮展开添加对话框
    showAddCate() {
      this.getParentCateList();
      this.addCateVisible = true;
    },
    // 获取父级分类的列表
    getParentCateList() {
      this.$http
        .get("categories", {
          params: {
            type: 2
          }
        })
        .then(res => {
          // console.log(res);
          this.parentCateList = res.data.data;
          // console.log(this.parentCateList);
          
        })
        .catch(err => {
          return this.$message.error("获取失败");
        });
    },
    parentCateChanged(){
      // console.log(this.selectedkeys);
      if(this.selectedkeys.length > 0){
        this.addCateForm.cat_pid =  
        this.selectedkeys[this.selectedkeys.length-1]
        this.addCateForm.cat_level = this.selectedkeys.length
        return
      }else{
        this.addCateForm.cat_pid =  0
        this.addCateForm.cat_level = 0
      }
    },
    addCate(){
      // console.log(this.addCateForm);
      this.$refs.addCateFormRulesRef.validate(valid=>{
        if(!valid) return;
        this.$http.post('categories',this.addCateForm).then(
          res=>{
            this.$message.success('添加成功')
            this.getCateList();
            this.addCateVisible = false;
          }
        ).catch(err=>{
          return this.$message.error('添加失败')
        })
      })
    },
    addCateColse(){
      this.$refs.addCateFormRulesRef.resetFields();
      this.selectedkeys = [];
      this.addCateForm.cat_pid =  0
      this.addCateForm.cat_level = 0
    }
  },
  components: {}
};
</script>

<style scoped>
.treetable {
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>
