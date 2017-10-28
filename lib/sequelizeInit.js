const Sequelize = require('sequelize');
const config = require('../config/db.js').mysql;

var sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 50,
        min: 0,
        idle: 30000
    }
});

module.exports  = sequelize;