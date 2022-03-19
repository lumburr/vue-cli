const net = require('net')
const fs = require('fs')
const EventEmitter = require('events')
module.exports = class Server extends EventEmitter {
  server = {}
  encoding = 'utf-8'

  constructor(option = {}) {
    super()
    this.path = option.id
    this.retry = option.id
  }

  start() {
    fs.unlink(
      this.path,
      () => {
        this.server = net.createServer(this.serverCreated.bind(this))

        if (process.platform ==='win32'){
          this.path = this.path.replace(/^\//, '');
          this.path = this.path.replace(/\//g, '-');
          this.path= `\\\\.\\pipe\\${this.path}`;
        }

        this.server.listen({
          path: this.path
        }, (socket) => {
          this.emit('start', socket)
        });
      }
    );
  }

  send(socket, type, data) {
    socket.write(data);
  }

  broadcast(type, data) {
    this.socket.write(data);
  }

  serverCreated(socket) {
    this.socket = socket
    if (socket.setEncoding) {
      socket.setEncoding(this.encoding);
    }

    socket.on(
      'close',() => {
        this.emit('close', socket)
      }
    );

    socket.on(
      'error',
      function (err) {

      }.bind(this)
    );

    socket.on(
      'data',(data) =>{
        this.emit('message', data)
      }
    );

    socket.on(
      'message',
      (msg, rinfo) => {

      }
    );

    this.emit(
      'connect',
      socket
    );
  }
}
