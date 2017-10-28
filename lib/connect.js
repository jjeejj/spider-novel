const dbconfig = require('../config/db.js');
const MongoClient = require('mongodb').MongoClient;
const mysql = require('promise-mysql');

exports.getMongoConn = async function () {
	try {
		let conn = await MongoClient.connect(dbconfig.mongo);
		return conn;
	}catch(err){
		console.log('mongo连接获取失败',err.message);
	}
};

exports.getMysqlConn = async function () {
	try {
		let conn = await mysql.createConnection(dbconfig.mysql);
		return conn;
	}catch(err){
		console.log('mysql连接获取失败',err.message);
	}
};