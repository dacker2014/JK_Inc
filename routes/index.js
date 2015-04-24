/**
 * Routes for 会员增删改查登录注册
 * github: https://github.com/highsea/JK_Inc
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */
var database = require('./../db/userlist_comment_article'),
    fun = require('./function'),
    nodemailer = require('nodemailer'),
    config = require('./../db/config');

var transporter = nodemailer.createTransport({
    service: '163',
    auth: {
        user: config.emailArr.user,
        pass: config.emailArr.pass,
    }
});


// string.trim() 前台处理

/*
@ 首页 登录页 合并
@ 相关接口： homepost （以页面跳转方式）
*/
exports.index = function(req, res){

    //database.userlist.count({living:1}, function(err, doc){

        //req.session.living = err ? err : doc;

        res.render('index', { 
            title: config.productInfo.index ,
            result:0,//未登录
            //living: err ? err : doc
        });

    //})

};

// 管理员页面
exports.admin = function(req, res){
    res.render('admin', {
        title: config.productInfo.admin,
        result:0,//未登录
        resultREG:0//未注册
    })
}



/*
@ 直接输入 主页
@ 从 session 判断是否登录
@ 以页面跳转方式，无 jsonp 接口
*/
exports.homeget = function(req, res) {
    //判断是否登录
    var name = req.session.username;
    if (name) {
        fun.userinfo(req, res, name, function(d){

            res.render('home', {
                title : name+config.productInfo.home,
                username : name,
                result : req.session.result,
                userlogo :d[0].ulogo,
                usercom: d[0].ucompany,
                userbanner: d[0].ubanner,
                date : new Date()
            });


        })
        
    }else{
        res.redirect('/');
    }
}

/*
@ 判断登录是否成功 首页登录页（合并） 
@ POST 即 首页（登录页）填写用户名密码后 表单 submit 后
@ 以页面跳转方式，无 jsonp 接口
*/
exports.homepost = function(req, res){
    var query = {name: req.body.user, password: req.body.password};
    if(query.name==''||query.password==''){
        var text = config.Code4X[1002];
        fun.friendlyError(req, res, text);
    }else{
        //先查询 是否有此 用户名
        //扩展： 手机号、邮箱、用户名 任意登录
        database.userlist.find(query, function(error, result){   
            if (error) {
                fun.friendlyError(req, res, error);
            }else{
                if (result!='') {
                    req.session.username = query.name;
                    req.session.result = result;
                    //可以避免 刷新页面时提示 是否重复提交（登录数据）
                    res.redirect('/home');

                    //在线状态
                    database.userlist.update(query, {living:1}, function(err, result){
                        //console.log('在线：'+result);//result为更新后的对象
                    });
                }else{

                    var text = config.Code4X[4002];
                    fun.friendlyError(req, res, text);
                }

            }
        });
    }
}


/*
@ 用户登出 离线
@ 清除 session 无对应接口
*/
exports.logout = function(req, res){

    //更新离线
    database.userlist.update({name:req.session.username}, {living:0}, function(err, result){
        console.log('离线：'+result);
    });

    req.session.username = null;
    req.session.result = null;
    res.redirect('/');

};


/*
@  用户注册页面
@  对应接口 adduser 前台新增单用户 | userCount 查重复
@
*/
exports.register = function(req, res){
    res.render('register', {
        title: config.productInfo.register,
        result:0,//未登录
        resultREG:0//未注册
    })
}

/*
@ 新增 create 前台注册用户 （单个）
@ post/query {user:string,password:string,sex:number,email:string,iphone:sting}
@ 2000 发送成功; 注册成功发送邮件
@ 1020 5019 2030 4020 1001
*/

exports.adduser = function(req, res){
    //表纠结 前台是 radio 还是 checkbox 了（支持 radio：该方式传值为 name:on）
    //var sex = req.body.sex1==true?req.body.sex1:req.body.sex2;
    //还是靠 input.type=hidden.name=sexval 解决
    //console.log(sex);
    var query = {
            name: req.body.user, 
            password: req.body.password,
            sex : req.body.sexval,
            email : req.body.email,
            iphone : req.body.iphone,
            type: 2,//前台注册的账户为 普通用户
        };
    //判断请求的域
    //?

    if(query.name==''||query.password==''||query.email==''){
        var text = config.Code4X[1003];
        fun.friendlyError(req, res, text);
    }else{

        database.userlist.create(query, function(error){
            if (error) {
                res.end(error);
            }else{
                //发送邮件
                var mailOptions = {
                    from: 'idacker@163.com', 
                    to: query.email, 
                    subject: '您的'+config.productInfo.name+'的注册信息', 
                    text: '您的'+config.productInfo.name+'的密码是：'+query.password+'用户名是：'+query.name, // plaintext body
                    html: '<h2>Hello '+query.name+'</h2><p>您的'+config.productInfo.name+'的注册信息，密码是：'+query.password+'用户名是：'+query.name+'</p><h5>'+config.productInfo.by+'</h5>' // html body
                };

                transporter.sendMail(mailOptions, function(err, info){
                    if(err){
                        //fun.jsonTips(req, res, 4020, config.Code4X[4020]+email, err);
                        fun.friendlyError(req, res, err);
                        
                    }else{
                        //fun.jsonTips(req, res, 2000, config.Code2X[2000], info.response);
                        res.render('register', {
                            title: "注册页面",
                            result:0,//未登录
                            resultREG:1//注册成功
                        })
                    }
                });

            }
        })
    }
}


/*
@ 符合某条件的数量 count 查询 分类+值 多功能接口（可用户 新建 删除相关分类数据）
@ countname /get/ query.name 数据库字段名称
@ countvalue /get/ query.value 该字段的值
@
*/
exports.userCount = function (req, res){

    var countname = req.query.name,
        countvalue = req.query.value,
        q_count = {countname:countvalue};

    //密码不允许查询 0.0
    if (!countname||!countvalue||countname=='password'||q_count.length>1) {
        fun.jsonTips(req, res, 2013, config.Code2X[2013], {name:'user|age|city|email|type|living|score|fans|follow|content|time|sex', value:'String|Number|Date|Boolean'});

    //}else if(countname=='user'){
    //关键字不允许注册
    //待完善

    }else{
        var coutListArr = {
            'userid': {_id:countvalue},
            'user'  : {name : countvalue},
            'age'   : {age : countvalue},
            'city'  : {city:countvalue},
            'email' : {email:countvalue},
            'type'  : {type:countvalue},
            'living': {living:countvalue},
            'score' : {score:countvalue},
            'fans'  : {fans:countvalue},
            'follow': {follow:countvalue},
            'content': {content:countvalue},
            'time'  : {time:countvalue},
            'sex'   : {sex:countvalue}
        }
        //console.log(coutListArr[countname]);
        database.userlist.count(coutListArr[countname], function(err, doc){

            if (err) {
                fun.jsonTips(req, res, 5019, config.Code5X[5019], err);

            }else{
                if (doc<1) {
                    //没有重复
                    fun.jsonTips(req, res, 2000, config.Code2X[2000], doc);
                }else{
                    //相关数据 已经存在
                    fun.jsonTips(req, res, 3001, config.Code3X[3001], doc);
                }
            }
        })
    }
}



/*
@ 自定义的 错误提示页面
@ text (String)
@ 直接请求 url
*/
exports.friendlyError = function(req, res){
    var text = config.productInfo.friendlyError.text;
    fun.friendlyError(req, res, text);
}


/*
@ get 查找单用户（by name）显示全部字段
@ 需要二次登录 返回 jsonp 或者 跳转友好错误页
*/
exports.userbyname = function(req, res){

    var username = req.query.username;
    if (!username||username=='') {
        fun.jsonTips(req, res, 1022, config.Code1X[1022], '');
    }else{

        fun.login_verify(req, res, function(){
            fun.userinfo (req, res, username, function(d){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], d[0]);
            })
        })
    }
    
}

/*
@ get查找单用户（by id） 显示全部字段
@ 需要二次登录，返回 jsonp [5001 2000]
@ 同类方法： fun.userinfo (req, res, name, cb) 和 userbyname
@ url：oneuser/?name=test&key=123&id=5534bf22810a0d3c2114f5db
*/
exports.oneuser = function (req, res){
    var userid = req.query.id;
    if (!userid||userid=='') {
        fun.jsonTips(req, res, 1021, config.Code1X[1021], '');
    }else{
        fun.login_verify(req, res, function(){

            database.userlist.findById( userid, function(err, doc){
                if (err) {
                    fun.jsonTips(req, res, 5001, err, '');
                }else{
                    fun.jsonTips(req, res, 2000, config.Code2X[2000], doc);
                }
            })
        })
    }


}

/*
@ get查找 全部用户 只显示 id name password type 字段
@ 需要二次登录，返回 jsonp
@ url：getuser/?name=admin&key=123456
*/
exports.getuser = function(req, res){
    //console.log(req.query.name);//key
    fun.login_verify(req, res, function(){
        database.userlist.find({}, {name : 1, type : 1, password : 1}, {}, function(error, doc){
            fun.json_api(req, res, error, doc);
        })
    });
}


var fs = require('fs')
  , formidable = require('formidable')
  , util = require('util')
  , sys = require('sys');

exports.upload = function(req, res){

    var form = new formidable.IncomingForm(); 
    form.uploadDir = '/temp';

    form.parse(req, function(err, fields, files) {  

        console.log(sys.inspect({fields: fields, files: files}));


        fun.jsonTips(req, res, 2000, config.Code2X[2000], form);
        
    });  

}




