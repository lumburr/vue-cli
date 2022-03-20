const DEFAULT_ID = process.env.VUE_CLI_IPC || 'vue-cli'
const DEFAULT_IDLE_TIMEOUT = 3000
const DEFAULT_OPTIONS = {
  networkId: DEFAULT_ID,
  autoConnect: true,
  disconnectOnIdle: false,
  idleTimeout: DEFAULT_IDLE_TIMEOUT,
  namespaceOnProject: true
}

const PROJECT_ID = process.env.VUE_CLI_PROJECT_ID

const Client = require('../lib/ipc/client')
const ipc = new Client({
  id: '/tmp/app.vue-cli',
  retry: 1500
})
class IpcMessenger {
  constructor (options = {}) {
    options = Object.assign({}, DEFAULT_OPTIONS, options)

    this.connected = false
    this.connecting = false
    this.disconnecting = false
    this.queue = null
    this.options = options

    this.listeners = []
    this.client = {}

    this.disconnectTimeout = 15000
    this.idleTimer = null

    // Prevent forced process exit
    // (or else ipc messages may not be sent before kill)
    process.exit = code => {
      process.exitCode = code
    }

    this._reset()
  }

  checkConnection () {
    if (!this.client[this.id]) {
      this.client[this.id] = true
      this.connected = false
    }
  }

  send (data, type = 'message') {
    this.checkConnection()
    if (this.connected) {
      if (this.options.namespaceOnProject && PROJECT_ID) {
        data = {
          _projectId: PROJECT_ID,
          _data: data
        }
      }

      ipc.send(type, data)

      clearTimeout(this.idleTimer)
      if (this.options.disconnectOnIdle) {
        this.idleTimer = setTimeout(() => {
          this.disconnect()
        }, this.options.idleTimeout)
      }
    } else {
      this.queue.push(data)
      if (this.options.autoConnect && !this.connecting) {
        this.connect()
      }
    }
  }

  connect () {
    this.checkConnection()
    if (this.connected || this.connecting) return
    this.connecting = true
    this.disconnecting = false
    ipc.connectTo(() => {
      this.connected = true
      this.connecting = false
      this.queue && this.queue.forEach(data => this.send(data))
      this.queue = null

      ipc.on('message', this._onMessage.bind(this))
    })
  }

  disconnect () {
    this.checkConnection()
    if (!this.connected || this.disconnecting) return
    this.disconnecting = true
    this.connecting = false

    const ipcTimer = setTimeout(() => {
      this._disconnect()
    }, this.disconnectTimeout)

    this.send({ done: true }, 'ack')

    ipc.of[this.id].on('ack', data => {
      if (data.ok) {
        clearTimeout(ipcTimer)
        this._disconnect()
      }
    })
  }

  on (listener) {
    this.listeners.push(listener)
  }

  off (listener) {
    const index = this.listeners.indexOf(listener)
    if (index !== -1) this.listeners.splice(index, 1)
  }

  _reset () {
    this.queue = []
    this.connected = false
  }

  _disconnect () {
    this.connected = false
    this.disconnecting = false
    ipc.disconnect(this.id)
    this._reset()
  }

  _onMessage (data) {
    this.listeners.forEach(fn => {
      if (this.options.namespaceOnProject && data._projectId) {
        if (data._projectId === PROJECT_ID) {
          data = data._data
        } else {
          return
        }
      }
      fn(data)
    })
  }
}





//const { IpcMessenger } = require('../index')
// 创建一个新的 IpcMessenger 实例
const ipc2 = new IpcMessenger()
ipc2.send({
  'com.my-name.some-data': {
    type: 'build',
    value: 'hahah'
  }
})

function messageHandler (data) {
  console.log(data)
}

// 监听消息
ipc2.on(messageHandler)

// 不再监听
//ipc.off(messageHandler)

function cleanup () {
  // 从 IPC 网络断开连接
  ipc2.disconnect()
}


//sendMessage('hahah1233')



