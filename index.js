const express = require('express');
app = express();
require('dotenv').config();

var cors = require('cors')
app.use(cors())

const fs = require('fs');
const appendSTRCoords = require('./module_appendSTRCoords')

const addWayPointsToDB = require('./module_addWayPointsToDB')
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Vehicle tracking server activated.\nListening at :${port}...`));

app.use(express.static('public'));
app.use(express.json({ limit: 100000 }))

//API Endpoint for onboard device to authenticate. ADD CODE TO CHECK WITH DATABASE
app.post('/api/authenticate', (request, response) => {
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(`New authentication request from vehicleId: ${request.body.vehicleId}`)
    var responseForClient = {request: request.body, status: 'success'}
    console.log(`Authentication Status for ${request.body.vehicleId}: ${responseForClient.status}`)
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    response.json(responseForClient)
    response.end()
});

//API Endpoint for onboard device to add waypoint
app.post('/api/addWayPoints', async (request, response) => {
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(`New wayPoints given by vehicleId: ${request.body[0].vehicleId}`)
    console.log(`Number of coords in the request: ${request.body.length}`)
    var responseForClientObject = await addWayPointsToDB.addWayPointsToDB(request.body)
    console.log(`responseForClientObject:`)
    console.log(responseForClientObject)
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(`\n\n\n`)
    response.json(responseForClientObject)
    response.end()


    //appendSTRCoords.appendSTRCoords(request.body[0].vehicleId)
});