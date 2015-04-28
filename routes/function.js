/**
 * 各种小方法，尽管我写的傻
 * github: https://github.com/highsea/ScrApiCompanyNew
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */

var database = require('./../db/userlist_comment_article.js'),
    config = require('./../db/config');


//方法 用户名 密码 type 验证--用于 更新用户 新建用户
function add_update_verify(req, res, callback){
    var r = req.query;
    if (!r.user||r.user==''||!r.password||r.password==''||!r.type||r.type=='') {
        //||!r.id||r.id==''
        jsonTips(req, res, 2010, config.Code2X[2010], '');

    }else{
        callback();
    }
}

/*
@ 首页 邀请码判断
@ 测试邀请码|过期邀请码|不存在邀请码
@
*/

function check_code(req, res, callback){
    var inviteCode = req.query.code,
        doc = {
            name:inviteCode,
        };

    if (inviteCode&&inviteCode!='') {

        database.userlist.find(doc, function(error, result){

            if (error) {
                console.log('userlist:')
                console.log(error);
                friendlyError(req, res, config.Code1X[5019]);

            } else{

                console.log(result);
                //邀请码存在

                if (result!=''||inviteCode=='hs001') {

                    //排除成功 后开始执行
                    //1、更新邀请码|2、读取公司列表
                    //3、更新用户兴趣（感兴趣，一般，无兴趣）公司
                    callback(inviteCode, doc, result);

                } else{
                    friendlyError(req, res, config.Code1X[1026]);

                };

            };

            //req.session.living = err ? err : doc;

        }) 

    } else{
        friendlyError(req, res, config.Code1X[1023]);
    };

}



//方法 菜单字母简写 中文名称 验证--用于 更新菜单 新建菜单
function add_update_menu(req, res, callback){
    var r = req.query;

    if (!r.name||r.name==''||r.title==''||!r.title) {
        jsonTips(req, res, 2011, config.Code2X[2011], '');

    }else{
        callback();
    }
}


/* 方法 管理员操作的 登录验证 （二次登陆）
@  返回 jsonp [4001 3000 2003 ]
@  验证通过执行回调 callback
*/
function login_verify(req, res, cb){
    var r = req.query;
    var keydoc = {
        name : r.name,
        content : r.key,
        type : 1
    };
    if (!r.name||!r.key||r.name==''||r.key=='') {
        jsonTips(req, res, 4001, config.Code4X[4001], '');
    }else{
        //验证密钥
        database.apiKey.find(keydoc, function(error, result){
            if (error||result=='') {
                jsonTips(req, res, 3000, config.Code3X[3000], error);
            }else{
                //开始处理 正真查询 user的 api 
                if (req.session.username=='') {
                    jsonTips(req, res, 2003, config.Code2X[2003], '');
                }else{
                    //console.log(req.session.username);
                    cb();
                }
            }
        })
    }
}

//方法 jsonp 提示 接口生成

function jsonTips(req, res, code, message, data){

    var str = {
        code : code,
        message : message,
        data : data
    }
    if (req.query.callback) {  
        str =  req.query.callback + '(' + JSON.stringify(str) + ')';
        res.end(str);  
    } else {  
        res.end(JSON.stringify(str));
    } 

}



//方法 jsonp 查询结果接口生成
function json_api(req, res, error, doc){

    var r = req.query;
    if (error) {
        var code = 5001,
            message = error,
            data = '';
    }else {
        var code = 2000,
            message = 'success',
            data = doc;
    }
    var str = {
        'code':code,
        'message':message,
        'data':data
    };

    if (r.callback) {  
        var str =  r.callback + '(' + JSON.stringify(str) + ')';
        res.end(str);  
    } else {  
        res.end(JSON.stringify(str));
    } 
}

/*
@ 通过 name 查询 该用户的所有信息
@ callback(result)
@ [{length:1}] 包含所有字段
*/
function userinfo (req, res, name, cb){


    database.userlist.find({name:name}, function(error, result){
        if (error) {
            console.log(error);
            friendlyError(req, res, error);
        }else if(result==''){
            // friendlyError(req, res, config.Code4X[4015]);
            jsonTips(req, res, 4015, config.Code4X[4015], '');
        }else{
            cb(result);
        }

    })



}

/*
@ 自定义的友好错误提示页面 渲染
@ text (String)
*/
function friendlyError(req, res, text){
    res.render('friendly-error', {
        title: config.productInfo.friendlyError.title,
        text: text
    })
}

function uploadHtml(req, res, resultPic, username){
    res.render('upload', {
        title : config.productInfo.up,
        resultpic: resultPic,
        username : username,
    })
}

function sToArray(req, res, some){
    if (some) {
        /*var someStr = req.query.some;
        return someStr.substring(someStr.indexOf("[")+1,someStr.indexOf("]")).split(',');*/
        return JSON.parse(some);
    }else{
        return '';
    }

}


exports.uploadHtml          = uploadHtml;
exports.add_update_verify 	= add_update_verify;
exports.login_verify  		= login_verify;
exports.jsonTips 			= jsonTips;
exports.json_api 			= json_api;
exports.add_update_menu 	= add_update_menu;
exports.userinfo            = userinfo;
exports.friendlyError       = friendlyError;
exports.check_code          = check_code;
exports.sToArray            = sToArray;
