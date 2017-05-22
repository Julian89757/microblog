// 集成多核CPU
var cluster  = require('cluster');
var os= require('os');

var  numCPUs =os.cpus().length;

var  workers ={};

if(cluster.isMaster) {
    console.log('master process start...  '+ process.pid );

    cluster.on('death',function(worker){
        delete   workers[worker.pid];
        worker =cluster.fork();
        workers[worker.pid] =worker;
    });

    for(var  i=0;i<numCPUs;i++){
        var worker = cluster.fork();
        console.log('process ' + worker.process.pid +'   has  start \n');
        workers[worker.pid] =worker;
    }
}else{
    var app = require('./app');
    app.listen(3000);          // 工作进程产生之后，会重现执行该程序，读取配置启动服务,所有工作进程共享3000端口
}

process.on('SIGTERM',function() {
    for(var pid in workers) {
        process.kill(pid);
    }
    process.exit(0);
})