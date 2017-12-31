-- 创建表结果的语句

-- 小说基本信息
drop table if Exists novel_list;
create table novel_list(
  id varchar(100) not null COMMENT 'uuid主键',
  novel_name varchar(100) not null COMMENT '小说名称',
  novel_id int not null COMMENT '小说id',
  novel_last_update_cha_name varchar(100) COMMENT '最后更新章节名称',
  novel_last_update_cha_id int COMMENT '最后更新章节id',
  novel_last_update DATETIME COMMENT '最后更新时间',
  novel_type varchar(10) COMMENT '小说类型',
  novel_author varchar(100) COMMENT '小说作者',
  updated_at DATETIME COMMENT '更新时间',
  created_at DATETIME COMMENT '创建时间',
  primary key (id)
) COMMENT '小说基本信息';



-- 创建索引
ALTER TABLE `novel_list` ADD UNIQUE (`novel_id`);
