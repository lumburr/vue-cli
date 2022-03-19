const Server = require('../lib/ipc/server')

const ipc = new Server({
  id: process.env.VUE_CLI_IPC || '/tmp/app.vue-cli',
  retry: 1500
})

const listeners = []

const dumpObject = (obj) => {
  if (!process.env.VUE_APP_CLI_UI_DEBUG) return
  const result = {}
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    const type = typeof value
    if (simpleTypes.includes(type)) {
      result[key] = value
    } else {
      result[key] = type
    }
  })
  return JSON.stringify(result)
}

ipc.on('start', (socket)=> {
  ipc.on('message', (data, socket) => {
    console.log('IPC message', dumpObject(data))
    for (const listener of listeners) {
      listener({
        data,
        emit: data => {
          ipc.server.emit(socket, 'message', data)
        }
      })
    }
  })
})
// ipc.serve(() => {
//   ipc.server.on('message', (data, socket) => {
//     log('IPC message', dumpObject(data))
//     for (const listener of listeners) {
//       listener({
//         data,
//         emit: data => {
//           ipc.server.emit(socket, 'message', data)
//         }
//       })
//     }
//   })

//   ipc.server.on('ack', (data, socket) => {
//     log('IPC ack', dumpObject(data))
//     if (data.done) {
//       ipc.server.emit(socket, 'ack', { ok: true })
//     }
//   })
// })

ipc.start()

function on (cb) {
  listeners.push(cb)
  return () => off(cb)
}

function off (cb) {
  const index = listeners.indexOf(cb)
  if (index !== -1) listeners.splice(index, 1)
}

function send (data) {
  console.log('IPC send', dumpObject(data))
  ipc.broadcast('message', data)
}


function ipcOn (cb) {
  const handler = cb._handler = ({ data, emit }) => {
    if (data._projectId) {
      if (data._projectId === this.project.id) {
        data = data._data
      } else {
        return
      }
    }
    // eslint-disable-next-line node/no-callback-literal
    cb({ data, emit })
  }
  return on(handler)
}

ipcOn(({ data, emit }) => {
  console.log(emit)
  send(data)
})

module.exports = {
  on,
  off,
  send
}
