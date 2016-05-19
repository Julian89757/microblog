var express = require('express');
var router = express.Router();			//  创建模块化，可挂载的路由句柄

router.get('/', function(req, res) {			
  res.send('respond with a resource');		
});

router.get('/:username',function (req,res,next){		/* 切记这个路径是紧接着路由控制器后面的参数2地址，也就是说这里不需要加上路由控制器的参数1： /user. 不要写成/user/:username */
	// res.send('users:' + req.params.username);
	console.log('all captured ');
	next();												/* 提供路由控制转移，next位于匹配响应的第三个参数*/
});

router.get('/:username',function (req,res){		
	res.send('users:' + req.params.username);
});

var users ={
	'byvoid':{
		age:'25',
		website:'www.baidu.com'
	}
};

router.get('/as/:username',function(req,res,next) {
	if(users[req.params.username])			
		next();
	else
		next(new Error(req.params.username  + ' dose not exist' ));
});

router.get('/as/:username',function(req,res) {
	res.send(JSON.stringify(users[req.params.username]));
});

module.exports = router;
