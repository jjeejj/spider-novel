const mongo = 'mongodb://test:test@127.0.0.4:27017/test'

const mysql = {
	host: '127.0.0.1',
	port: 3306,
	database: 'test',
	user: 'root',
	password: 'root',
	charset: 'UTF8_GENERAL_CI',
	connectionlimit: 200
};

module.exports = {
	mongo,
	mysql
};
