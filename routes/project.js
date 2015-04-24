/**
 * Routes for project
 * github: https://github.com/highsea/ScrApiCompanyNew
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */
var database    = require('./../db/userlist_comment_article'),
    fun         = require('./function'),
    fs          = require('fs'),
    config      = require('./../db/config');

var appsetFile = ['./db/appset-', '.json'].join('');// new Date()-0,

/*
* 获取 App项目的设置
* 常用信息不能保存在数据库
* 这里采用 json 文件形式做缓存
*/
exports.subject = function(req, res){
	var name = req.session.username;
	if (name==req.query.username) {

		
        var JsonObj = JSON.parse(fs.readFileSync(appsetFile));
        if (JsonObj) {
            fun.jsonTips(req, res, 2000, config.Code2X[2000], JsonObj);
        }else{
            fun.jsonTips(req, res, 5022, config.Code5X[5022], JsonObj);
        }

	}else{
		res.redirect('/home');
	}
}


/*
* 更新 App项目的设置
* 写入 json 文件
*/
exports.subjectsave = function(req, res){
	var name = req.session.username,
        q = req.query,
        //未做 变量判断
        doc = {
           appname : q.appname,//issetSome(req, res, 'appname'),
           actname : q.actname,
           actcontent : q.actcontent,
        };
    //console.log(issetSome(req, res, 'appname'));
    //既做了是否已经登录的判断，又做了登录用户只能读取该用户授权的信息
	if (name==q.username) {

        var textStringify = JSON.stringify({
                appset:{
                    name:doc.appname,
                },
                activenow:{
                    name:doc.actname,
                    content:doc.actcontent
                },
            });
        console.log(textStringify);

        fs.writeFile(appsetFile, textStringify, function(err){
            if(err) {
                fun.jsonTips(req, res, 5021, config.Code5X[5021], err);
            }else{
                fun.jsonTips(req, res, 2000, config.Code2X[2000], '');
            }
        });

	}else{
		res.redirect('/home');
	}
}

/*function issetSome(req, res, some){
    var q = req.body?req.body:req.query,
        a = {
            appname : q.appname,//issetSome(req, res, 'appname'),
            actname : q.actname,
            actcontent : q.actcontent,
        };
    console.log(q);
    console.log(some);
    console.log(a[some]);
    return a[some]?a[some]:config.dbtext['wz'];

}*/

/*
@ 已存在的公司信息读取
@ 必须登录用户&&该用户授权信息
@
*/
exports.company = function(req, res){
	var name = req.session.username,
        q = req.query;
	if (name==q.username) {
        database.company.find({}, function(error, result){
            if (error) {
                fun.jsonTips(req, res, 5021, config.Code5X[5021], error);
            }else{
                //不做 '' 判断
                fun.jsonTips(req, res, 2000, config.Code2X[2000], result);
            }
        })
	}else{
		res.redirect('/home');
	}

}

/*
@ 新增公司信息
@ 必须登录用户&&该用户授权信息
@ post
*/
exports.companyadd = function(req, res){

    var name = req.session.username,
        q = req.body,
        doc = {
            name    : q.comname,
            operate : q.comoperate,//运营情况
            future  : q.comfuture,//未来发展
            financing:q.comfinancing,//融资需求
            content : q.comcontent,//简评
            logo    : q.comlogo, 
            // interest: [String],//userid Array
            // disinterest:[String],//userid Array
            // general : [String],//userid Array
        };



    //公司信息新增
        //console.log(doc);
    if (name==q.username) {

    //图片增加


        database.company.find({name:q.comname}, function(error, result){

            if (error) {
                fun.jsonTips(req, res, 5022, config.Code5X[5022], error);
            }else{

                if (result!='') {
                    fun.jsonTips(req, res, 3002, config.Code3X[3002], result)
                }else{

                    database.company.create(doc, function(err){
                        if (err) {
                            fun.jsonTips(req, res, 5021, config.Code5X[5021], err);
                        }else{
                            fun.jsonTips(req, res, 2000, config.Code2X[2000], '');
                        }
                    })
                }
            }
        })
    }else{
        res.redirect('/home');
    }
}

/*
@ 删除 公司信息
@ 必须登录用户&&该用户授权信息
@ post
*/
exports.comdelete = function(req, res){
    var name = req.session.username,
        q = req.query,
        doc = {
            _id:q.id
            };
    if (name==q.username) {
        database.company.find(doc, function(error, result){
            if (error) {
                fun.jsonTips(req, res, 5021, config.Code5X[5021], error);
            }else{
                if (result!='') {
                    database.company.remove(doc, function(e, d){
                        if (e) {
                            fun.jsonTips(req, res, 5001, config.Code5X[5001], e);
                        }else{
                            fun.jsonTips(req, res, 2000, config.Code2X[2000], null);
                        }
                    })
                }else{
                    fun.jsonTips(req, res, 2014, config.Code2X[2014], '')
                }
                
            }
        })
    }else{
        res.redirect('/home');
    }

}
