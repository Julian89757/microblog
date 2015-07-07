
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {			/* 该请求绑定get 谓词*/
  res.send('respond with a resource');			/* 这里没有调用视图引擎呈现视图，而是直接输出*/
});



router.get('/:username',function (req,res,next){		/* 切记这个路径是紧接着路由控制器后面的参数2地址，也就是说这里不需要加上路由控制器的参数1： /user. 不要写成/user/:username */
	// res.send('users:' + req.params.username);
	console.log('all captured ');
	next();												/* 提供路由控制转移，next位于匹配响应的第三个参数*/
});

/* 支持同一路径绑定多个处理路由响应，但是只会匹配前面一条路由规则 ，使用next 转移控制权*/
router.get('/:username',function (req,res){		
	res.send('users:' + req.params.username);
	//res.send('users:' + req.params.username);		/* 怎么向响应流中追加?? */
});

var users ={
	'byvoid':{
		age:'25',
		website:'www.baidu.com'
	}
};

router.get('/as/:username',function(req,res,next) {
	if(users[req.params.username])				/* 输入   http://localhost:8200/users/as/byvoid  */
		next();
	else
		next(new  Error(req.params.username  + ' dose not exist' ));
});

router.get('/as/:username',function(req,res) {
	res.send(JSON.stringify(users[req.params.username]));
});



module.exports = router;
