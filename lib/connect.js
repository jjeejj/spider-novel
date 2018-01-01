const dbconfig = require('../config/db.js');
const MongoClient = require('mongodb').MongoClient;

exports.getMongoConn = function () {
	return new Promise(function (resolve,reject) {
		try{
			global.mongoConn.stats(function (err,stats) {
				if(err){
						MongoClient.connect(dbconfig.mongo, {poolSize:10,autoReconnect:true}, function (err, db) {
								if(err) {
									console.log('获取mongo链接失败',err.message)
									reject(err)
								};
								console.log('获取mongo链接成功')
								global.mongoConn = db;
								resolve(global.mongoConn);
						});
				} else {
						resolve(global.mongoConn);
				}
			});
		}catch(err){
			console.log('global.mongoConn.stats err',err.message);
			MongoClient.connect(dbconfig.mongo, {poolSize:10,autoReconnect:true}, function (err, db) {
					if(err) {
						console.log('获取mongo链接失败',err.message)
						reject(err)
					};
					global.mongoConn = db;
					resolve(global.mongoConn);
			});
		}
	});
};
