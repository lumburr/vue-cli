const net = require('net')
const EventEmitter = require('events')

module.exports = class Client extends EventEmitter {
  constructor() {
  }
  config = {}

  options = {}

  socket = {}

  connect() {
    if (process.platform === 'win32' && !client.path.startsWith('\\\\.\\pipe\\')) {
      options.path = options.path.replace(/^\//, '');
      options.path = options.path.replace(/\//g, '-');
      options.path = `\\\\.\\pipe\\${options.path}`;
    }
    this.socket = net.createConnection(this.options)
    this.socket.setEncoding(this.config.encoding);

    this.socket.on(
      'error',
      function (err) {
      }
    );

    this.socket.on(
      'connect',
      function connectionMade() {
      }
    );

    this.socket.on(
      'close',
      function connectionClosed() {
      }
    );

    this.socket.on(
      'data',
      function (data) {

      }
    );
  }

  emit(message) {
    this.socket.write(message);
  }
}
