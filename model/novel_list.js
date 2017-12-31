const Sequelize = require('sequelize');

//小说列表,只显示小说的基本信息及最近更新的信息
var NovelList = sequelize.define('novel_list', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
    },
    novel_name: Sequelize.STRING(100),
    novel_id: Sequelize.INTEGER,
    novel_last_update_cha_name: Sequelize.STRING(100),
    novel_last_update_cha_id: Sequelize.INTEGER,
    novel_last_update: Sequelize.DATE,
    novel_type: Sequelize.STRING(10),
    novel_author: Sequelize.STRING(100)
}, {
        underscored: true,
        freezeTableName: true,
        tableName: 'novel_list'
});


module.exports = NovelList;
