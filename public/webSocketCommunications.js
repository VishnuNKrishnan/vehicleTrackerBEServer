function liveCommunication(){
    // Create WebSocket connection.
    const socket = new WebSocket('wss://localhost:3001')

    // Connection opened
    socket.addEventListener('open', function (event) {
        console.log('Live Communication Connection Established!')
    })

    // Listen for messages
    socket.addEventListener('message', function (event) {
        console.log('Message from server ', event.data)
    })
    
    function sendToServer(gpsData){
        socket.send(gpsData)
    }
    
    navigator.geolocation.watchPosition(position => {
        sendToServer(JSON.stringify(position))
    })
}

liveCommunication()