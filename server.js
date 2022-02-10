const { createServer } = require('http');

exports.run = () =>{
  createServer((req, res) =>{
    if (req.method == 'POST'){
      var data = '';
      req.on('data', chunk =>{
        data += chunk;
      });
      req.on('end', () =>{
        if(!data){
          res.end('No post data');
          return;
        }
        var searchParams = new URLSearchParams(data);
        var dataType = searchParams.get('type');
        console.log('post:' + dataType);
        if(dataType == 'wake'){
          console.log('Woke up in post');
          res.end();
          return;
        }
        res.end();
      });
    }
    else if (req.method == 'GET'){
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Discord Bot is active now\n');
    }
  }).listen(3000);
}
