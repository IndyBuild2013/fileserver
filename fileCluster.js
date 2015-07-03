var cluster = require("cluster");
var numCPUs = require("os").cpus().length;
var serverCount = 0;
var http = require("http");
var https = require("https");
var FileServerModule = require('./fileServer');
var port = process.argv[2]?process.argv[2]:8080;

if(cluster.isMaster){

	console.log("master server");
	console.log("Creating " + numCPUs + " child servers");
	for (var i=0; i <numCPUs; i++) var worker = cluster.fork();
	cluster.on("exit", function(worker, code, signal){
		console.log("Worker: " + worker.process.pid + " has died");
	});
}
else{

	console.log("creating child server");
	var fileServer = new FileServerModule().app;
	http.createServer(fileServer).listen(port);
	process.on("error",function(err){
		console.log(err);
	});
}
