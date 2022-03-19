
const { IpcMessenger } = require('../index')
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
