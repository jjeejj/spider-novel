const later = require('later');
global.sequelize = require('./lib/sequelizeInit.js');

global.sleep = function (seconds) {
  return new Promise(function (resolve,reject) {
    setTimeout(function () {
      resolve()
    },seconds * 1000);
  })
};

const shu8 = require('./control/shu8.js');

console.log('sequelize',sequelize);





shu8.getNovelList();

// shu8.checkGetNewNovelConetnt(180870,26281520);


//获取小说列表，每半天更新一次
// later.setInterval(function() {
// 	shu8.getNovelList();
// }, {
// 	schedules: [{
// 		h: [0,12],
// 		m: [0]
// 	}]
// });
//获取更新内容
//获取更新内容
// later.setInterval(function() {
// 	shu8.getNovelContent();
// }, {
// 	schedules: [{
// 		h: [1,13],
// 		m: [0]
// 	}]
// });
