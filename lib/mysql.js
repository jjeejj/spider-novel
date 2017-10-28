/**
 * mysql 操作封装
 */

class Mysql {
	constructor(table, conn) {
		this.table = table;
		this.conn = conn;
		this.whereString = '';
	}

	__pushWhere(str, type) {
		if (this.whereString === '') {
			this.whereString += str
		} else {
			this.whereString += ' ' + type + ' ' + str
		}
	}

	where() {
		if (!this.table && typeof this.table !== 'string') throw new Error('please select a sheet first');
		let filter = arguments[0] ? arguments[0] : null;
		if(filter){
			this.__pushWhere(filter,'AND');
		}

		return this;
	}

	insert() {

	}

};
module.exports = Mysql;