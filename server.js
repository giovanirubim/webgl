const http = require("http");
const server = http.createServer();
const fs = require('fs');
const mime = require('mime-types');
http.createServer((request, response)=>{
	let url = request.url;
	try{
		const file = fs.readFileSync("."+url);
		response.setHeader('Content-Type', mime.lookup(url));
		response.write(file);
		response.end();
	}catch(e){
		console.log(e);
		 response.statusCode = 400;
		 response.end();
	}
}).listen(8000);