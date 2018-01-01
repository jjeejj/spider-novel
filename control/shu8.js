/**
 * 23shu8 的小说内容
 */
// const puppeteer = require('puppeteer');
const request = require('superagent');
require('superagent-charset')(request);
const cheerio = require('cheerio');
const NovelList = require('../model/novel_list.js');
const Mongo = require('../lib/mongo');
const connect = require('../lib/connect.js');

const baseUrl = 'http://23shu8.com';
const topUrl = baseUrl + /tops/;

/**
 * 该方法只获取更新小说列表
 */

const getNovelList = async function(page = 1) {
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
			// console.log('novelRecos',novelRecos)
			if (!novelRecos) { //没有记录，直接插入
				//插入小说基本信息
				await NovelList.create(novels);

				//更新内容
				await checkGetNewNovelConetnt(parseInt(novelId),parseInt(novelLastUpdateChaId));
			} else {
					//判断是否更新了
					if(novelRecos.novel_last_update_cha_id != novels.novel_last_update_cha_id){ //更新了
						novels.updated_at = new Date();
						await NovelList.update(novels,{
							where: {
								novel_id: parseInt(novelId)
							}
						});
						//更新内容
						await checkGetNewNovelConetnt(parseInt(novelId),parseInt(novelLastUpdateChaId));
					}
					// await fetchNewNovelConetnt(novelUri);
			};

			await sleep(5);
		});
		//获取当前页码出来的最大页数
		let bigPageNum = $('#pagenav').children().last().text();
		if (page >= Number(bigPageNum)) {
			console.log('已经爬取全部的小说数据', new Date());
			return;
		}

		//继续获取下一页的内容
		// await getNovelList(++page);

	} catch (err) {
		console.log('getNovelList err', err.message);
		//重新获取这一页的内容
		await getNovelList(page);
	}
};

/**
 * 获取小说具体章节及内容
 * @param  {Number} novelId 小说id
 * @param  {Number} novelChaId 小说i章节id
 * @return
 */
const getNewNovelConetnt = async function(novelId,novelChaId) {
	console.log(`更新 ${novelId},${novelChaId}开始`);
	//把传进来的参数,转为数字
	novelId = parseInt(novelId),novelChaId = parseInt(novelChaId);
	let novelConetntUrl = `${baseUrl}/${novelId}/${novelChaId}/`,
		res,$,lis,mongoConn,shu8NovelDb,chaContent,chaTitle;
	try {
		mongoConn = await connect.getMongoConn();
		shu8NovelDb = new Mongo(`shu8.${novelId}`,mongoConn);
		//获取章节内容
		console.log('novelConetntUrl',novelConetntUrl);
		res = await request.get(novelConetntUrl).charset('gbk');
		$ = cheerio.load(res.text);

		//获取该内容所属于的小说id
		let contentNovelId = $('div.weizhi').find('a').eq(1).attr('href').split('\/')[1];
		if(contentNovelId == novelId){ //归属正确,进行内容存取
			chaTitle = $('div#contents>div.catalog_h1').find('h1').eq(0).text();
			chaContent = $('div#content').text();
			//插入内容
			await shu8NovelDb.updateOne(
			{
				novel_id: novelId,
				novel_cha_id: novelChaId,
			},
			{
				novel_id: novelId,
				novel_cha_id: novelChaId,
				cha_title: chaTitle,
				cha_content: chaContent
			},{upsert: true});

			console.log(`更新 ${novelId},${novelChaId}结束`);
		};

	} catch (err) {
			throw(err)
	}
};

/**
 * 检查小说基本信息的最新更新章节，看是否有需要更新具体章节内容
 * @param  {Number} novelId 小说id
 * @param  {Number} novelLastUpdateChaId 小说 最新章节id
 * @return {[type]}
 */
const checkGetNewNovelConetnt = async function (novelId,novelLastUpdateChaId) {
	try{
		novelId = parseInt(novelId),novelLastUpdateChaId = parseInt(novelLastUpdateChaId);
		//根据小说id 查看 mongo 数据库中是否有 具体的章节记录。一本小说一个集合 集合名称的命名规则为: `shu8.${novelId}`
		let mongoConn = await connect.getMongoConn(); //mongo连接
		// console.log('mongoConn.collection',mongoConn.collection);
		let shu8NovelDb = new Mongo(`shu8.${novelId}`,mongoConn),shu8NovelDbStats;

		shu8NovelDbStats = await shu8NovelDb.stats();

		console.log('shu8NovelDbStats',shu8NovelDbStats)

		if(shu8NovelDbStats.ok == 0){ //没有该小说集合,去单独获取该小说章节页面
			let res = await request.get(baseUrl + `/${novelId}/`).charset('gbk');
			let $ = cheerio.load(res.text);
			$('ul.catalogs li').each(async function (index, element) {
				let aDoms = $(this).find('a');
				if(aDoms && aDoms.length > 0){ //是内容章节
					//获取每个章节的id,然后去获取内容
					let chaId = aDoms.eq(0).attr('href').split('\/')[2];
					await getNewNovelConetnt(novelId,chaId);
				};
				//等待 1s中
				await sleep(5);
			});
		}else{ //存在该小说集合,更新需要更新的章节
			//获取 mongo 已经存在的最大 id 章节
			let existLastNovelConetent = await shu8NovelDb.findOne({novel_id:novelId},{sort:{"novel_cha_id":-1}});
			console.log('existLastNovelConetent.novel_cha_id',existLastNovelConetent.novel_cha_id);
			console.log('novelId',novelId);
			console.log('novelLastUpdateChaId',novelLastUpdateChaId);
			for(let i = 1; i <= novelLastUpdateChaId - existLastNovelConetent.novel_cha_id;i++ ){
				await getNewNovelConetnt(novelId,existLastNovelConetent.novel_cha_id + i);
				await sleep(5);
			};
		};
	}catch(err){
		throw(err)
	}

};


module.exports = {getNovelList,checkGetNewNovelConetnt};
