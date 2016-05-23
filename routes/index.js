/* 下面主要是路由级中间件的应用，这里的路由级中间件有点类似于Controller-Action */

var router = require('express').Router();
var crypto =  require('crypto');			

var User = require('../models/user.js');
var Post = require('../models/post.js');

router.get('/', function(req, res,next) {
	if(req.session.user)
		res.redirect('/u/'+ req.session.user.name);
	else
		next();
});

// 定义网站主页使用的路由
router.get('/', function(req, res) {
	res.render('index', { title:'Express',info:req.flash('info')} );		
});

router.get('/u/:user',function(req,res){			
		User.get(req.params.user,function(err,user){
		if(!user){
			req.flash('error','用户不存在');
			return res.redirect('/');
		}
		Post.get(user.name, function (err,posts) {
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('user',{
				title:user.name,
				posts:posts
			})
		})
	});
});

router.post('/post',checkLogin);
router.post('/post',function(req,res){
	var currentUser = req.session.user;
	var post = new Post(currentUser.name,req.body.post);
	post.save(function(err){
		if(err) {
			req.flash('error',err);
			return res.redirect('/');
		}
		req.flash('success','发表成功');
		res.redirect('/u/'+ currentUser.name);
	});
});

router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res,next){
	res.render('reg',{
		title:'用户注册'
	});
});

router.get('/map',function(req,res,next) {
	res.render('map',{
		title:'地图热点'
	});
});

router.get('/flash',function(req,res){
	req.flash('info', 'Flash is back!');
	res.redirect('/');
});

router.post('/reg',function(req,res){
	if(req.body['password-repeat']!= req.body['password'])	 {
		req.flash('error','两次输入密码不一致');				// flash 是一块用于存储信息的特殊session，被写进flash，呈现给用户之后就消失
		return res.redirect('/reg');
	}
	var  md5 = crypto.createHash('md5');

	var  password = md5.update(req.body.password).digest('base64');
	var  newUser = new  User({
		name:req.body.username,
		password:password
	});
	// 检查用户名是否存在
	User.get(newUser.name,function(err,user){
		if(user)
			err ='Username  already  exists';
		if(err){
			req.flash('error',err);								
			return  res.redirect('/reg');					
		}
		newUser.save(function(err)	{						
		if(err)	{
			req.flash('error',err);
			return res.redirect('/reg');
		}
		req.session.user = newUser;							
		req.flash('success','注册成功');
		res.redirect('/');
	});

	});

});

router.get('/login',function(req,res){
  	res.render('login',{title:'用户登录'});
});

router.post('/login',function(req,res){
	var  md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username,function(err,user) {
		if(!user){
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if(user.password !=password)	{
			req.flash('error','用户口令错误');
			return  res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success','登录成功');
		res.redirect('/');
	});
});


router.get('/logout',checkLogin);

router.get('/logout',function(req,res) {
	req.session.user =null;
	req.flash('success','退出成功');
	res.redirect('/');
});

// 以下为路由中间件，主要用到 next方法

//  用户还没登录， 阻止用户访问该页面 '/loginout'
function  checkLogin(req,res,next){
	if(!req.session.user)	{
		req.flash('error','未登入');
		res.redirect('/');
	}
	// next() 方法提示继续走向下一个中间件
	next();
}

// 用户若已经登录， 阻止用户访问该页面 '/reg'
function  checkNotLogin(req,res,next){
	if(req.session.user)	{
		req.flash('error','已经登入');
		return res.redirect('/');
	}
	next();
}

module.exports = router;

/*
Express 支持的所有的http请求绑定谓词， router.all 将会接受所有的请求绑定

*/
