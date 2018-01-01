/**
 * mongo 操作封装
 * @constructor table conn
 */
class Mongo {
	constructor(table, conn) {
		this.table = table;
		this.conn = conn;
	}

	insertOne(doc, options) {
		let self = this;
		return new Promise(async function(resole, reject) {
			try {
				let collection = self.conn.collection(self.table);
				let result = await collection.insertOne(doc, options);
				resole(result);
			} catch (err) {
				console.log('insertOne err', err.message);
				reject(err);
			}
		})
	}
	insertMany(docs, options) {
		let self = this;
		return new Promise(async function(resole, reject) {
			try {
				let collection = self.conn.collection(self.table);
				let result = await collection.insertOne(doc, options);
				resole(result);
			} catch (err) {
				console.log('insertMany err', err.message);
				reject(err);
			}
		})
	}
	updateOne(filter, update, options) {
		let self = this;
		return new Promise(async function(resole, reject) {
			try {
				let collection = self.conn.collection(self.table);
				let result = await collection.updateOne(filter, update, options);
				resole(result);
			} catch (err) {
				console.log('updateOne err', err.message);
				reject(err);
			}
		})
	}
	updateMany(filter, update, options) {
		let self = this;
		return new Promise(async function(resole, reject) {
			try {
				let collection = self.conn.collection(self.table);
				let result = await collection.updateMany(filter, update, options);
				resole(result);
			} catch (err) {
				console.log('updateMany err', err.message);
				reject(err);
			}
		})
	}

	find(query) {
		var self = this;
		var option = arguments[1] ? arguments[1] : null; //option = {limit:10,skip:10}
		return new Promise(async function(resolve, reject) {
			let collection = self.conn.collection(self.table);
			collection = collection.find(query); //此处返回的是游标，用同样的变量会覆盖 上面获取的集合信息
			if (option) {
				for (var i in option) {
					collection = collection[i](option[i]); //在查询游标上加入条件
				}
			}
			collection.toArray(function(err, result) {
				err ? reject(err) : resolve(result);
			});
		})
	}

	findOne(query) {
		var self = this;
		var option = arguments[1] ? arguments[1] : null; //option = {limit:10,skip:10}
		return new Promise(async function(resolve, reject) {
			let collection = self.conn.collection(self.table);
			let doc = await collection.findOne(query,option); //
			resolve(doc);
		})
	}

	stats(){
		let self = this;
		return new Promise(async function(resole, reject) {
			try {
				let collection = self.conn.collection(self.table);
				let statsInfo = await collection.stats(); //如果没有该集合 会执行reject方法
				resole(statsInfo);
			} catch (err) {
				console.log('stats err', err);
				resole(err);
			}
		})
	}
}

module.exports = Mongo;
