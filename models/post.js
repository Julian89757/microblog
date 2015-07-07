//   微博模型

var  mongodb  = require('./db');

// 构造函数方式定义微博
function Post(username,post,time){
    this.user = username;
    this.post = post;

    if(time)    {
        this.time= time;
    }else {
        this.time =new Date();
    }
}

module.exports = Post;      //  此模块就爱你过返回 Post 构造函数

// 获取微博。按照用户或者获取全部的内容
Post.get= function(username,callback){
    mongodb.open(function(err,db){
        if(err) {
            return  callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err) {
                mongodb.close();
                return callback(err);
            }
            var  query  ={};
            if(username) {
                query.user =username;
            }
            collection.find(query).sort({time:-1}).toArray(function(err,docs)   {
                mongodb.close();

                console.log(docs);

                if(err) {
                    callback(err);
                }
                var  posts =[];
                docs.forEach(function(doc,index){
                    var  post = new Post(doc.user,doc.post,doc.time);
                    posts.push(post);
                });
                callback(null,posts);
            })
        });
    })
}

Post.prototype.save= function(callback) {
    var  post = new Post(this.user,this.post,new  Date());

    mongodb.open(function(err,db){
        if(err){
            mongodb.close();
            return  callback(err);
        };

        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return  callback(err);
            };
            collection.ensureIndex('user');
            collection.insert(post,{safe:true},function(err,post){
                mongodb.close();
                return  callback(err,post);
            });
        })
    });
}