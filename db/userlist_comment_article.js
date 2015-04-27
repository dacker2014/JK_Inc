/**
 * mongoose Schema 会员集合；评论；文章；栏目（菜单）；权限KEY
 * github: https://github.com/highsea/JK_Inc
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */
var mongoose = require('mongoose'),
    config = require('./../db/config');

db = mongoose.createConnection();

//设置用户名密码端口数据库
db.openSet(config.dbLogin);
// 链接错误
db.on('error', function(error) {
    console.log(error);
});
var Schema = mongoose.Schema;

//用户信息表// 邀请码KEY
var userSchema =new Schema({
    //_id     : Schema.Types.ObjectId,  //主键
    name    : {type:String,required:true},
    password: {type:String,required:true},
    interest: [String],//companyid Array
    disinterest:[String],//companyid Array
    general : [String],//companyid Array
    email   : String,
    sex     : {type:Number,default:1}, //男1 女0 未知2
    type    : {type:Number,default:2}, 
    //注销 0 管理员 1 普通用户 2 订阅者 3 游客（禁言禁文）
    // 4 被禁评论的用户 5 被禁发表文章的用户 6  邀请码 7
    time    : {type : Date, default: Date.now},
    content : {type:String,default:config.dbtext['dd']}, //简介
    age     : {type:Number,min:0,max:110},
    iphone  : String,
    city    : {type:String,default:config.dbtext['whsh']},
    //comment : {type:Boolean,default:1}, //启用评论 1 禁止灌水 0
    //article : {type:Boolean,default:1}, // 启用文章 1 禁言 0
    //enable  : {type : Boolean, default: 1}, // 用户启用 1 注销 0
    living  : {type:Number,default:0}, //在线 1 离线 0 隐身 2
    score   : {type:Number,default:0}, //积分
    follow  : {type:Number,default:0}, // 关注
    fans    : {type:Number,default:0}, //粉丝
});

var companySchema = new Schema({

    name    : {type:String,required:true},//名称
    operate : {type:String,default:config.dbtext['wz']},//运营情况
    future  : {type:String,default:config.dbtext['wz']},//未来发展
    financing:{type:String,default:config.dbtext['wz']},//融资需求
    content : {type:String,default:config.dbtext['wz']},//简评
    logo : {type:String,default:config.dbtext['error-logo']},

    interest: [String],//userid Array
    disinterest:[String],//userid Array
    general : [String],//userid Array
})

// 二次登陆KEY 
var apiKeySchema = new Schema({
    name    : {type:String,required:true}, // Key 的名称
    content : String, //key的具体 value
    time    : {type : Date, default: Date.now},
    type    : {type : Number, default: 1} 
    // 默认启用 1 禁用 0 初步限制 2
})


/*var appsetSchema = new Schema({
    name    : {type:String,required:true},
    title   : {type:String,required:true},
    content : {type : String, default:config.dbtext['wz']},
}) */

exports.userlist    = db.model('users', userSchema);
exports.apiKey      = db.model('apiKeys', apiKeySchema);
exports.company     = db.model('subjects', companySchema);
//exports.appset      = db.model('appsets', appsetSchema)


