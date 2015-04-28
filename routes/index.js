/**
 * Routes for 会员增删改查登录注册
 * github: https://github.com/highsea/JK_Inc
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */
var database = require('./../db/userlist_comment_article'),
    fun = require('./function'),
    nodemailer = require('nodemailer'),
    formidable = require('formidable'),
    fs = require('fs'),
    config = require('./../db/config');

var appsetFile = ['./db/appset-', '.json'].join('');// new Date()-0,


var transporter = nodemailer.createTransport({
    service: '163',
    auth: {
        user: config.emailArr.user,
        pass: config.emailArr.pass,
    }
});

var picPATH = config.productInfo.picupload;
// string.trim() 前台处理

/*
@ 首页 登录页 合并
@ 相关接口： homepost （以页面跳转方式）
*/
exports.index = function(req, res){

    var inviteCode = req.query.code,
        doc = {
            name:inviteCode,
        };

    if (inviteCode&&inviteCode!='') {

        database.userlist.find(doc, function(error, result){

            if (error) {
                console.log('userlist:')
                console.log(error);
                fun.friendlyError(req, res, config.Code1X[5019]);

            } else{

                console.log(result);
                //邀请码存在

                if (result!=''||inviteCode=='hs001') {

                    if (inviteCode=='hs001'||result[0].type!=0) {

                        database.company.find({}, function(error, result){
                            if (error) {
                                console.log('company:');
                                console.log(error);
                                fun.friendlyError(req, res, config.Code5X[5019]);
                            }else{
                                //项目设置信息
                                var JsonObj = JSON.parse(fs.readFileSync(appsetFile));

                                res.render('index', { 
                                    title: config.productInfo.index,
                                    username :inviteCode,
                                    comlist : result,
                                    project : JsonObj,
                                });

                            }
                        })
                        
                        //不删除 remove 邀请码 更新 update type 即可
                        var updoc = {
                            type : 0,
                        };

                        database.userlist.update(doc, updoc, {}, function(error){
                            if (error) {
                                //扩展： 保存 json 文件
                                console.log('更新邀请码 出现了错误：');
                                console.log(error);


                            } else{

                                if (inviteCode!='hs001') {

                                    //发送邮件 通知邀请码已被使用
                                    var mailOptions = {
                                        from: 'idacker@163.com', 
                                        to: 'admin@highsea90.com', 
                                        subject: '[金控项目]邀请码：'+inviteCode+'已被使用！', 
                                        text: '[金控项目]邀请码：'+inviteCode+'已被使用！', // plaintext body
                                        html: '<h2>［金控项目］管理员：</h2><p>您设置的邀请码'+inviteCode+'已被使用！请记得检查，添加。'+'</p><h5>'+config.productInfo.by+'</h5>' // html body
                                    };

                                    transporter.sendMail(mailOptions, function(err, info){
                                        if(err){
                                            //扩展： 保存 json 文件
                                            console.log('更新邀请码的通知邮件出现了错误：');
                                            console.log(err);
                                            
                                        }else{
                                            //console.log(info);
                                        }
                                    });
                                }else{
                                    console.log(inviteCode);
                                }

                            };

                        })
                        //更新结束

                    } else{
                        fun.friendlyError(req, res, config.Code1X[1024]);

                    };

                } else{
                    fun.friendlyError(req, res, config.Code1X[1026]);

                };

            };

            //req.session.living = err ? err : doc;

            

        }) 

    } else{
        fun.friendlyError(req, res, config.Code1X[1023]);
    };

    

};

// 管理员页面
exports.admin = function(req, res){
    if (req.session.username) {
        res.redirect('/home');

    } else{
        res.render('admin', {
            title: config.productInfo.admin,
            result:0,//未登录
            resultREG:0//未注册
        })

    };
    
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

        //该项目进入此页面的必定是 管理员 type：1
        fun.userinfo(req, res, name, function(d){

            console.log(d);
            console.log(d[0].type);
            if (d[0].type=='1') {

                database.userlist.find({}, function(err, doc){

                    if (err) {
                        fun.friendlyError(req, res, err);
                    }else{
                        res.render('home', {
                            title : name+config.productInfo.home,
                            username : name,
                            result : req.session.result,
                            type : d[0].type,
                            userlist : doc,
                            date : new Date(),
                        });
                    }
                })

                

            }else{
                fun.friendlyError(req, res, config.Code1X[1025]);
            }


            


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
        database.userlist.find({}, {name : 1, type : 1, password : 1, email : 1}, {}, function(error, doc){
            fun.json_api(req, res, error, doc);
        })
    });
}


//get 删除 remove 用户
exports.remove1user = function(req, res){
    //客户端登陆
    if (req.session.username==req.query.username) {
        //二次登陆验证
        fun.login_verify(req, res, function (){

            database.userlist.count({_id:req.query.id}, function(err, doc){
                if (err) {
                    fun.jsonTips(req, res, 5001, config.Code5X[5001], err);
                }else{
                    if (doc) {
                        database.userlist.remove({_id: req.query.id}, function(error){
                            fun.jsonTips(req, res, 2000, config.Code2X[2000], null);
                        });
                    }else{
                        fun.jsonTips(req, res, 2014, config.Code2X[2014], null);
                    }
                }
            });
        });       

    }else{
        res.redirect('/home');
    }

    
}

//更新 update 单个用户信息 get
exports.up1user = function(req, res){
    //客户端登陆
    if (req.session.username==req.query.username) {
        //二次登陆验证
        fun.login_verify(req, res, function (){

            fun.add_update_verify(req, res,function(){
                var r = req.query,
                    doc = {
                        name:r.user, 
                        password:r.password, 
                        type:r.type,
                        email:r.email,
                    };
                //检查重名
                //database.userlist.count({name:r.user}, function(error, result){
                    //if (error) {
                        //fun.jsonTips(req, res, 5019, config.Code2X[5019], error);
                    //}else{
                        //if (result!='') {
                            //fun.jsonTips(req, res, 2012, config.Code2X[2012], result);
                        //}else{

                            database.userlist.update({_id:r.id}, doc, {}, function(error){

                                fun.json_api(req, res, error, {id:r.id, now:doc});

                            });
                        //}
                    //}
                    

                //})
                    
            });
        });

    }else{
        res.redirect('/home');
    }

}




/*
@ get 新增 后台管理员添加 create 用户
@
*/
exports.adduserget = function(req, res){
    //客户端登陆
    if (req.session.username==req.query.username) {
        //二次登陆验证
        fun.login_verify(req, res, function(){

            fun.add_update_verify(req, res,function(){
                var r = req.query;
                var doc = {
                    name        : r.user,
                    password    : r.password,
                    
                    email       : r.email,
                    type        : r.type
                };
                //console.log(doc);

                database.userlist.count({name:r.user}, function(err, result){
                    if (err) {
                        fun.jsonTips(req, res, 5001, err, '');
                    }else{
                        
                        if (result) {
                            fun.jsonTips(req, res, '2014', 'user exist', '用户已经存在');
                        }else{
                            //插入数据库
                            database.userlist.create(doc, function(error){
                                fun.json_api(req, res, error, {id:r.id, now:doc});
                            })
                        }
                    }
                })

            })
        })
    }else{
        res.redirect('/home');
    }
}


/*
@ 上传页面 需要登录
@
*/
exports.upload = function(req, res) {

    var q = req.body?req.body:req.query,
        username = req.query.username,
        picname = q.picname;
        

/*    console.log(q);
    console.log(picname);
    typeof(req.body);*/
    if (!username) {
        //文件上传
        console.log('文件上传');
        console.log(q);

        var form=new formidable.IncomingForm();
        form.encoding = 'utf-8';        //设置编辑
        form.uploadDir = picPATH;     //设置上传目录
        form.keepExtensions = true;     //保留后缀
        form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

        form.parse(req,function(err,fields,files){

            console.log(files);

            if (files.files.name=='') {
                //没有上传文件
                fun.friendlyError(req, res, config.Code4X[4031]);
                //fun.uploadHtml(req, res, resultPic, username);

            } else{

                var extName = 'gif';  //后缀名
                switch (files.files.type) {
                    case 'image/jpg':
                        extName = 'jpg';
                        break;
                    case 'image/jpeg':
                        extName = 'jpeg';
                        break;         
                    case 'image/png':
                        extName = 'png';
                        break;
                    case 'image/x-png':
                        extName = 'png';
                        break; 
                    case 'image/gif':
                        extName = 'gif'        
                }

                var resultPic = req.session.username+'-'+Date.now()+'.'+extName;

                try{
                    fs.renameSync(files.files.path, picPATH+resultPic);
                    fun.uploadHtml(req, res, resultPic, username);
                    //fun.jsonTips(req, res, 2000, config.Code2X[2000], resultPic);
                }catch(e){
                    fun.jsonTips(req, res, 5021, config.Code2X[5021], e);
                }

            };

            

            
            
        });


    } else{
        //get上传页面 req.query
        console.log('上传页面');


        if (req.session.username==username) {
            fun.uploadHtml(req, res, '1', username);
        

        } else{
            res.redirect('/home');

        };
    };


    


    
};        
// { files: 
//    { domain: null,
//      _events: {},
//      _maxListeners: 10,
//      size: 2825427,
//      path: 'tmp/609d14418e2c26f657f26f92531cc4f4',
//      name: '2868d770410292d70dd51634e90cc02c.jpg',
//      type: 'image/jpeg',
//      hash: false,
//      lastModifiedDate: Fri Apr 24 2015 21:03:55 GMT+0800 (CST),
//      _writeStream: 
//       { _writableState: [Object],
//         writable: true,
//         domain: null,
//         _events: {},
//         _maxListeners: 10,
//         path: 'tmp/609d14418e2c26f657f26f92531cc4f4',
//         fd: null,
//         flags: 'w',
//         mode: 438,
//         start: undefined,
//         pos: undefined,
//         bytesWritten: 2825427,
//         closed: true 
//       } 
//     } 
// }
        // 同步操作文件，需要try catch

 




exports.getpic = function(req, response){
    var q = req.query,
        picname = q.picname;
    var extName = picname.split('.')[1];
    console.log(extName);
    
    fs.readFile(picPATH+picname,'binary',function(err,file){
        if(err){
            response.writeHead(500,{'Content-Type':'text/plain'});
            response.write(err+'\n');
            response.end();
        }else{
            response.writeHead(200,{'Content-Type':'image/'+extName});
            response.write(file,'binary');
            response.end();
        }
    });
}




