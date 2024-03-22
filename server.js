const http = require('http');
const mongoose = require('mongoose'); 
const Post = require('./models/post');
const dotenv = require("dotenv");

const headers = require('./headers');
const errorHandle = require('./errorHandle');
const successHandle = require('./successHandle');

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)

mongoose.connect(DB) 
  .then(() => console.log('資料庫連接成功'))
  .catch((error) => console.log(error));

const requestListener = async(req, res) => {
  let body = "";
  req.on('data', chunk=>{
    body+=chunk;
  })

  if(req.url === "/posts" && req.method === "GET"){
    const posts = await Post.find(); 
    successHandle(res, posts);
  } else if(req.url === "/posts" && req.method === "POST"){
    req.on('end', async() => {
      try{
        const data = JSON.parse(body); 
        if(data.content !== undefined){          
          const newPost = await Post.create({
            name: data.name,
            image: data.image,
            content: data.content,
            type: data.type,
            tags: data.tags
          });
          successHandle(res, newPost);
        } else {
          errorHandle(res);
        }
      } catch(error) {
        errorHandle(res, error);
      }
    })
  } else if(req.url.startsWith("/posts/") && req.method === "PATCH") {
    req.on('end', async() => {
      try{
        const data = JSON.parse(body); 
        const id = req.url.split('/').pop();
        if(data.content !== undefined){     
          const editContent = {
            name: data.name,
            image: data.image,
            content: data.content,
            type: data.type,
            tags: data.tags
          };     
          const editPost = await Post.findByIdAndUpdate(id, editContent);
          successHandle(res, editPost);
        } else {
          errorHandle(res);
        }
      } catch(error) {
        errorHandle(res, error);
      }
    })
  } else if(req.url.startsWith("/posts/") && req.method ==="DELETE"){
    const id = req.url.split('/').pop();
    await Post.findByIdAndDelete(id);
    successHandle(res, null);
  } else if(req.url === "/posts" && req.method ==="DELETE") {
    const posts = await Post.deleteMany({}); 
    successHandle(res, posts);
  }
  else if(req.method === "OPTIONS"){
    res.writeHead(200, headers);
    res.end();
  }else{
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      "status": "false",
      "message": "無此網站路由"
    }));
    res.end();
  }
}
const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);