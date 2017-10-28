const later = require('later');
const shu8 = require('./control/shu8.js');


const sequelize = require('./lib/sequelizeInit.js');

global.sequelize =sequelize;


//获取小说，每天更新一次
var t = later.setInterval(function() {
	shu8();
}, {
	schedules: [{
		h: [0],
		m: [0]
	}]
})