<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 页面侧边 -->
      <el-aside :width="collapseFlag?'64px':'200px'">
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" :unique-opened='true'
        :collapse="collapseFlag" :collapse-transition="false" router 
        :default-active="activePath">
        <!-- this.$route.history.current.path -->
          <div class="collapse_1" @click="collapseMenu">
            |||
          </div>
          <!-- 一级导航 -->
          <el-submenu :index="item.id + ''" v-for="item in meunlist" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级导航 -->
            <el-menu-item :index="'/'+itemlist.path+''" v-for="itemlist in item.children" :key="itemlist.id"
             @click="saveNavState('/'+itemlist.path+'')">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{itemlist.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 页面内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  props: {},
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
  },
  data() {
    return {
      meunlist:[],
      iconsObj:{
        '125':'el-icon-user-solid',
        '103':'el-icon-s-cooperation',
        '101':'el-icon-s-goods',
        '102':'el-icon-s-order',
        '145':'el-icon-s-platform',
      },
      collapseFlag:false,
      activePath:''
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList(){
      const {data:res} = await this.$http.get('menus')
      if(res.meta.status !== 200)  return this.$message.error(res.meta.msg)
      this.meunlist = res.data
      // console.log(this.meunlist);
    },
    //导航栏折叠
    collapseMenu(){
      this.collapseFlag = !this.collapseFlag
    },
    //导航条返回不变
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath);
      this.activePath = activePath;
    }
  },
  components: {}
};
</script>

<style scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-header > div img {
  width: 100px;
  height: 50px;
}
.el-menu{
  border-right: none;
}
.el-header > div {
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 20px;
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.collapse_1{
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
  background-color: #4a5064;
  font-size: 15px;
  line-height: 28px;
}
</style>
