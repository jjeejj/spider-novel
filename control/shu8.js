/**
 * 23shu8 的小说内容
 */
// const puppeteer = require('puppeteer');
const request = require('superagent');
require('superagent-charset')(request);
const cheerio = require('cheerio');
const databaseUtils = require('../lib/index');
const NovelList = require('../model/novel_list.js');
const Mongo = databaseUtils.Mongo;
const connect = require('../lib/connect.js');

const baseUrl = 'http://23shu8.com';
const topUrl = baseUrl + /tops/;

/**
 * 该方法只获取更新小说列表
 */

const getNovelList = async function(page) {
	let res, $;
	try {
		res = await request.get(topUrl + page).charset('gbk');
		$ = cheerio.load(res.text);

		//处理这一页的小说数据
		$('ul.content').each(async function(index, element) {
			let lis = $(this).find('li');
			let novelUri = lis.eq(0).children().first().attr('href');
			let novelName = lis.eq(0).children().first().text();
			let novelId = novelUri.split('\/')[1];
			let novelLastUpdateChaUri = lis.eq(1).children().first().attr('href');
			let novelLastUpdateChaId = novelLastUpdateChaUri.split('\/')[2];
			let novelLastUpdateChaName = lis.eq(1).children().first().text();
			let novelLastUpdate = lis.eq(3).text();
			let novelType = lis.last().text();
			let novelAuthor = lis.eq(2).children().first().text();
			if(!novelLastUpdateChaId){ //没有更新章节id
				return; //继续循环下一个
			};
			let novels = {
				novel_name: novelName,
				novel_id: parseInt(novelId),
				novel_last_update_cha_name: novelLastUpdateChaName,
				novel_last_update_cha_id: parseInt(novelLastUpdateChaId),
				novel_last_update: new Date(novelLastUpdate),
				novel_type: novelType,
				novel_author: novelAuthor
			};

			//判断是否有该小说，没有的话就插入。
			//若有判断是否更新
			let novelRecos = await NovelList.findOne({
				attributes: ["id","novel_id","novel_last_update_cha_id"],
				where: {
					novel_id: parseInt(novelId)
				}
			});
			if (!novelRecos) { //没有记录，直接插入
				//插入小说基本信息
				await NovelList.create(novels);
			} else {
					//判断是否更新了
					if(novelRecos.novel_last_update_cha_id != novels.novel_last_update_cha_id){ //更新了
						novels.updated_at = new Date();
						await NovelList.update(novels,{
							where: {
								novel_id: parseInt(novelId)
							}
						});
					}
					// await fetchNewNovelConetnt(novelUri);
			}

		});
		//获取当前页码出来的最大页数
		let bigPageNum = $('#pagenav').children().last().text();
		if (page >= Number(bigPageNum)) {
			console.log('已经爬取全部的小说数据', new Date());
			return;
		}

		//继续获取下一页的内容
		await getNovelList(++page);

	} catch (err) {
		console.log('getNovelList err', err.message);
		//重新获取这一页的内容
		await getNovelList(page);
	}
};

/**
 * 获取小说具体章节及内容
 * @param  {[type]} novelUri 小说id 对应的uri
 * @return
 */
const getNewNovelConetnt = async function(novelUri) {
	let novelUrl = baseUrl + novelUri,
		res,$,lis,mongoConn,novelContent,chaContent;
	try {
		mongoConn = await connect.getMongoConn();

		novelContent = new Mongo('novel_conetnt',mongoConn)

		res = await request.get(novelUrl).charset('gbk');
		console.log('res.text', res.text);
		//从后面的章节开始，若已经有了结束一本的书获取
		$ = cheerio.load(res.text);
		lis = $('ul.catalogs').find('li');
		if(!lis || lis.length <=0){
			console.log('获取该小说有问题,',novelUri);
			return;
		};

		for(let i = lis.length -1 ;i>=0;i--){ //从后面开始查询
			let $a = lis.eq(i).find('a');
			if(!$a){ //不存在 对应的章节
				continue;
			}

			let chaIdUri = $a.eq(0).attr('href');
			let chaId = $a.eq(0).attr('href').split('/')[2];

			//判断数据库，是否有该章节，没有酒继续，有的话就已经爬去，停止
			chaContent = await novelConetnt.findOne({'chapters.chaId':chaId});

			if(!chaContent){
				break;
			};
			chaContent  = await request.get(baseUrl + chaIdUri).charset('gbk'); //内容

		};

	} catch (err) {

	}
};

// const


module.exports = {getNovelList};
