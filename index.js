const http = require('http');
const port = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.end("ValentePro Apps - Finalmente riesco a deployare ");
});

server.listen(port);
console.log("Server in ascolto su " + port);
