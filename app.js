var fs = require('fs');
var accessLogStream = fs.createWriteStream('access.log',{flags:'a'});
var errorLogStream = fs.createWriteStream('error.log',{flags:'a'});

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');             // 日志中间件

var cookieParser = require('cookie-parser');
var session = require('express-session');

var bodyParser = require('body-parser');

var MongoStore = require('connect-mongostore')(session);
var settings = require('./Settings.js');

var routes = require('./routes/index');
var users = require('./routes/users');

var flash = require('connect-flash');
var app = express();
var minify = require('express-minify');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('env','production');                      


app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({                               
    secret:settings.cookieSecret,
    name:'SessionId',
    store: new MongoStore({db:settings.dataBaseName }),
    cookie:{ httpOnly:false}
}));
app.use(flash());
app.use(function(req,res,next) {             
    res.locals.user = req.session.user;      
    res.locals.post =  req.session.post;
    var error  = req.flash('error');
    res.locals.error = error.length?error:null;

    var success = req.flash('success');
    res.locals.success = success.length ? success:null;
    next();
});


app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

// catch 404 and forward to error handler,  //  使用app.use定义的中间件的顺序非常重要，use的先后顺序决定了中间件的优先级
app.use('/',function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);              
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use('/',function(err, req, res, next) {
        res.status(err.status || 403);
        res.render('error', {
            message: err.message,
            error: err                                  
        });
    });
}

//  在其他app.use 和路由调用之后，最后定义错误处理中间件
app.use(function(err, req, res, next) {
    var time = '['+new  Date()+']';
    errorLogStream.write( time + err.stack+'\n');          

    res.status(500).render('error',{
        message:err.message,
        error:{}
    })
});

if(!module.parent){
   app.listen(3000);
   console.log('Express server listening on port 3000 in %s mode',app.settings.env);
}

 module.exports = app;
