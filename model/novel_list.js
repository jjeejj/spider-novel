const Sequelize = require('sequelize');

//小说列表
var NovelList = global.sequelize.define('novel_list', {
    id: {
        type: Sequelize.STRING(50),
        primaryKey: true
    },
    novelName: Sequelize.STRING(100),
    novelUri: Sequelize.STRING(100),
    novelId: Sequelize.BOOLEAN,
    novelLastUpdateChaName: Sequelize.STRING(100),
    novelLastUpdateChaUri: Sequelize.STRING(100),
    novelLastUpdateChaId: Sequelize.BOOLEAN,
    novelLastUpdate: Sequelize.DATE,
    novelType: Sequelize.STRING(10),
    novelAuthor: Sequelize.STRING(100),
    novelAuthorUrl: Sequelize.STRING(100),
}, {
        timestamps: false
    });

module.exports = NovelList;