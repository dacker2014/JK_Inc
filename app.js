/**
 * 依赖、路由、app
 * github: https://github.com/highsea/JK_Inc
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')

  , project = require('./routes/project')
  , http = require('http')
  , path = require('path')
  , ejs = require('ejs')
  , SessionStore = require("session-mongoose")(express);

var store = new SessionStore({
	url: "mongodb://60.191.125.156:27018/session",
	interval: 120000
});

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.methodOverride());


app.use(express.cookieParser());
app.use(express.cookieSession({secret : 'jk.idacker.com'}));
app.use(express.session({
	secret : 'jk.idacker.com',
	store: store,
	cookie: { maxAge: 900000 }
}));
app.use(function(req, res, next){
	res.locals.user = req.session.user;
	next();
});


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        result: err.resultlogin,
	    title: err.message,
        error: {},
        //textStatus : err.navText
    });
});
/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('找不到这个页面');
    err.status = 404;
    err.resultlogin = 0;//未登录
    next(err);
});
// development only
if ('development' == app.get('env')) {
  	//app.use(express.errorHandler());
	app.use(function(err, req, res, next) {
	    res.render('error', {
	        message: err.message,
	        title: err.message,
	        result: err.resultlogin,
	        error: err
	    });
	});
}

app.get('/', routes.index);
app.get('/users', user.list);

// H5 调查问卷项目路由
app.get('/logout', routes.logout);//
app.post('/home', routes.homepost);//post
app.get('/home', routes.homeget);//
app.post('/adduser',routes.adduser);

app.get('/register', routes.register);//
app.get('/admin', routes.admin);

//登录查找单用户全字段
app.get('/getuser', routes.getuser);//by id 二次登陆
app.get('/userbyname', routes.userbyname);// name 二次登陆
app.get('/userCount', routes.userCount);
app.get('/oneuser', routes.oneuser);
app.get('/up1user', routes.up1user);


//项目
app.get('/subject', project.subject);
app.get('/subjectsave', project.subjectsave);
app.get('/company', project.company);
app.post('/companyadd', project.companyadd);
app.get('/comdelete', project.comdelete);

//其他
app.get('/friendly-error', routes.friendlyError);
app.post('/upload', routes.upload);
app.get ('/upload', routes.upload);

app.get('/getpic', routes.getpic);




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
