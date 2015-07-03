var 
	http = require("http"),
	express = require("express")
	fs = require("fs"),
	mime = require("mime");

module.exports = function(){

	this.app = express()
	.param("location",function(req,res,next,location){
		req.location = location;
		next();
	}).param("mediaentity",function(req,res,next,mediaentity){
		req.file = mediaentity;
		next();
	}).get("/:location/:mediaentity",function(req,res,next){
		fs.stat(req.location,function(err,stats){
			if(err){
				res.status(404).json(err).end();
			}else{
				if(stats.isDirectory())next();
				else res.status(404).json({error:req.location + " is not a directory"});
			}
		});
	}).get("/:location",function(req,res,next){

		fs.readdir(req.location,function(err,files){
			if(err)res.status(500).json(err).end();
			else res.json(files).end();
		})

	}).get("/:location/:mediaentity",function(req,res,next){

		var path = req.location + "/" + req.file;
		var mimeType = mime.lookup(path);
		console.log(mimeType);
		console.log(req.headers);
		res.set("content-type",mimeType);
		fs.createReadStream(path)
		.on("error",function(err){
			res.status(404).json(err).end();
		}).pipe(res);

	}).put("/:location/:mediaentity",function(req,res,next){

		fs.stat(req.location,function(err,stats){
			if(err){
				//create directory here;
				fs.mkdir(req.location,function(err,result){
					if(err){
						res.status(500).json({error:"couldn't create directory " + req.location});
					}else{
						next();
					}
				})
			}else{
				if(stats.isDirectory())next();
				else res.status(404).json({error:req.location + " is not a directory"});
			}
		});
	}).put("/:location/:mediaentity",function(req,res,next){

		var path = req.location + "/" + req.file;
		console.log("writing to path " + path);
		var ws = fs.createWriteStream(path);
		ws.on("close",function(){
			var host = req.headers["host"];
			var url = req.url;
			var path = "http://" + host + url;
			res.json({
				url:path
			}).end();
		});
		req.pipe(ws);
	});
}