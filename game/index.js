var VueRouter = require('../libs/vue-router.min');
var VueSimpleStore = require('../libs/vue-simple-store.min');

// 可选，依项目需求看是否需要共享状态存储
Vue.use(VueSimpleStore, {
	stores: [ require('./store') ],
	debug: true
});

AV.init({// leancloud pwd: Gg102385
	appId: 'SPhVUhoX44YfdeDHnVfuAGXL-gzGzoHsz',
	appKey: 'oSrGtDVEpx9fagWppyXyePS3'
});

var router = new VueRouter({
	routes: [
	  {
	    path: '/', 	// 默认首页
	    component: require('./pages/home/home')
	  },
	  {
	    path: '/play',
	    component: require('./pages/play/play')
	  }]
});

var app = new Vue({
	router: router
}).$mount('#app');
