const ACRemoteTelemetryClient = require('ac-remote-telemetry-client')
const express = require('express')
const http = require('http')
const WebSocket = require('ws')
require('dotenv').config()




// Sending broadcast data handler
// function broadcastPhysics(data) {
//   // Sends values to everyone connected to WS
//   wss.clients.forEach((ws) => {
//     if (ws.ACClient != null) {
//       ws.send(JSON.stringify({method: 'data', data: data}))
//     }
//   })
// }


function connectToAC(ip, ws) {
  // Connect to UDP
  ws.ACClient = new ACRemoteTelemetryClient(ip)

  // If something wrong with UDP (wrong IP etc)
  ws.ACClient.client.on('error', (error) => {
    const errorMsg = `Error trying to connect to AC UDP, most likely, bad IP. ${error}`
    // Send back message to client
    ws.send(JSON.stringify({method: 'error', message: errorMsg}))
    // Destroy WS
    console.log(`${ws.id} couldn't conect to AC, killing WS`);
    ws.terminate()
  }) 

  // Implement desired listeners only when recieved handshake responce (OK)
  ws.ACClient.on('HANDSHAKER_RESPONSE', (data) => {
    data && console.log(`ID ${ws.id} successfully connected to AC UDP`)
    ws.send(JSON.stringify({method: 'handshake', data: data}))

    // Only when its handshaked, apply another listener
    ws.ACClient.on('RT_CAR_INFO', (data) => ws.send(JSON.stringify({method: 'data', data: data})))
    
  })

  // Start listening
  ws.ACClient.start()

  // Send initial handshake
  ws.ACClient.handshake()

    // Subscribe to desired updates
    // ws.ACClient.subscribeSpot()
    ws.ACClient.subscribeUpdate()
}

const app = express()
app.use(express.static('public'))
const server = http.createServer(app)

server.listen(3000, () => {
  console.log('Server is listening on port 3000.')
})

const wss = new WebSocket.Server({ server })

wss.on('connection', (ws) => {
  
  ws.on('message', (message) => {
    // Parse data 
    const data = JSON.parse(message)
    switch (data.method) {
      case 'connection':
        // Upon connection ws gets unique ID 
        ws.id = data.id
        console.log(`Client connected to WebSocket, id: ${ws.id}`)
        console.log(`Trying to connect to AC UPD at ${data.ip}`)
        // And attaches AC Client to ws
        connectToAC(data.ip, ws)
        break
      case 'disconnect':
        console.log(`${ws.id} requested disconnect...`)
        // First kill UDP connection from WS (maybe useless)
        ws.ACClient && ws.ACClient.dismiss()
        // Then kill WS
        ws.terminate()
        console.log(`${ws.id} disconnected`);
        break
      default:
        break
    }
  })

  ws.on('error', (error) => {
    console.log('WebSocket error:', error.message)
  })

  
})

// When i stop the app, close conenctions etc
process.on('SIGINT', () => {
  console.log('Received SIGINT. Killing websockets...')

  // Remove Asseto Corsa UDP connection from every ws that is connected
  wss.clients.forEach((ws) => {
    ws.ACClient && ws.ACClient.dismiss()
    ws.terminate()
  })
  
  process.exit()
})

