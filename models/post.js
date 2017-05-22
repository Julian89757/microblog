//   微博模型
var  mongodb  = require('./connection');

function Post(username,post,time){
    this.user = username;
    this.post = post;

    if(time)    {
        this.time= time;
    }else {
        this.time= new Date();
    }
}

module.exports = Post;      //  此模块将返回Post对象，不是基于Post对象的实例

Post.get = function(username,callback){
    mongodb.open(function(err,db){
        if(err) {
            return  callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err) {
                mongodb.close();
                return callback(err);
            }
            var  query = {};
            if(username) {
                query.user =username;
            }
            collection.find(query).sort({time:-1}).toArray(function(err,docs)   {
                mongodb.close();
                if(err) {
                    callback(err);
                }
                var  posts = [];
                docs.forEach(function(doc,index){
                    var  post = new Post(doc.user,doc.post,doc.time.toLocaleString());
                    posts.push(post);
                });
                callback(null,posts);
            })
        });
    })
}

Post.prototype.save = function(callback) {
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