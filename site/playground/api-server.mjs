import http from 'http';

const server = http.createServer((request, response) => {
  if (request.url === '/api/message') {
    response.writeHead(200);
    response.end('Hello from API');
  }
});

server.listen(9000);