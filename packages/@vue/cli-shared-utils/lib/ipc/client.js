const net = require('net')
const EventEmitter = require('events')
const { Buffer } = require('buffer')

module.exports = class Client extends EventEmitter {
  constructor(options = {}) {
    super()
    this.path = options.id
    this.options = options.retry
  }
  encoding = 'utf-8'
  socket = {}

  connectTo(callback) {
    if (process.platform === 'win32' && !this.path.startsWith('\\\\.\\pipe\\')) {
      this.path = this.path.replace(/^\//, '');
      this.path = this.path.replace(/\//g, '-');
      this.path = `\\\\.\\pipe\\${this.path}`;
    }
    this.socket = net.createConnection({path: this.path})
    this.socket.setEncoding(this.encoding);

    this.socket.on(
      'error',
      function (err) {
        console.log(err)
      }
    );

    this.socket.on(
      'connect',
      function connectionMade() {
        console.log('connect')
      }
    );

    this.socket.on(
      'close',
      function connectionClosed() {
        console.log('close')
      }
    );

    this.socket.on(
      'data',
      function (data) {
        this.emit('message',data)
      }
    );

    callback()
  }

  send(type,data) {
    const jsonstr = JSON.stringify(data)
    const message = Buffer.from(jsonstr)
    this.socket.write(message);
  }
}
