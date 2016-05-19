var fs =require('fs');
var  accessLogStream =fs.createWriteStream('access.log',{flags:'a'});
var  errorLogStream =fs.createWriteStream('error.log',{flags:'a'});

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');             // 日志中间件

var cookieParser = require('cookie-parser');
var session = require('express-session');

var bodyParser = require('body-parser');

var MongoStore =require('connect-mongo')(session);
var settings = require('./Settings.js');

var routes = require('./routes/index');
var users = require('./routes/users');

var flash =require('connect-flash');
var app = express();

// 能够set的属性是 app settings table 里面指定的配置项
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('env','production');                

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

//  为参数1添加指定的中间件功能，参数1是path，没有指定的话默认是'/'
app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({                               
    secret:settings.cookieSecret,
    name:'testapp',         // 这里的name 是cookie 的name，默认cookie的name是 connect.sid 
    store: new  MongoStore({                    
        db:settings.db
    }),
    cookie:{ httpOnly:false}
}));
app.use(flash());

app.use(function(req,res,next) {             
    res.locals.user = req.session.user;      
    res.locals.post =  req.session.post;
    var  error  = req.flash('error');
    res.locals.error =error.length?error:null;

    var  success = req.flash('success');
    res.locals.success =success.length ? success:null;
    next();

});


// 配置静态文件请求路由控制器, 提供静态文件服务，如果有静态文件请求，则到此目录下寻找
// GET /javascripts/jquery.js
// GET /style.css
// GET /favicon.icon   app.use([path],function) path默认为 '/'
app.use(express.static(path.join(__dirname, 'public')));

// 挂载中间件，只要请求路径匹配我们的path，将会引起中间件执行，默认路径是'/'
app.use('/', routes);

// catch 404 and forward to error handler,  //  使用app.use定义的中间件的顺序非常重要，use的先后顺序决定了中间件的优先级
app.use('/',function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;       // 这个地方体现了闭包，err将会 传入到下面的错误响应路由
    next(err);              // 路由控制权转移，如果此次请求出错，将路由响应传递到下面一个规则
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use('/',function(err, req, res, next) {
        res.status(err.status || 500);                  // 要注意Javsscript中 || 的用法，一般用法是做默认值。
        res.render('error', {
            message: err.message,
            error: err                                  // 这里打印堆栈
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    var meta = '['+new  Date()+']';
    errorLogStream.write(meta+err.stack+'\n');          // 生产环境，将堆栈写进文件

    res.render('error',{
        message:err.message,
        error:{}
    })
});





if(!module.parent){
   app.listen(3000);
   console.log('Express server  listening on port 3000 in %s mode',app.settings.env);
  
}
 module.exports = app;
