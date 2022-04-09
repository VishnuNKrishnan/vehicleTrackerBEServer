const express = require('express');
app = express();
require('dotenv').config();

var cors = require('cors')
app.use(cors())

const fs = require('fs');
const appendSTRCoords = require('./module_appendSTRCoords')

const addWayPointsToFile = require('./module_addWayPointsToFile')
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Vehicle tracking server activated.\nListening at :${port}...`));

app.use(express.static('public'));
app.use(express.json())

//API Endpoint for onboard device to authenticate. ADD CODE TO CHECK WITH DATABASE
app.post('/api/authenticate', (request, response) => {
    
    console.log(`\n\n\n\nNew authentication request from vehicleId: ${request.body.vehicleId}\n\n\n\n`)
    var responseForClient = {request: request.body, status: 'success'}
    response.json(responseForClient)
    response.end()


    appendSTRCoords.appendSTRCoords(request.body[0].vehicleId)
});

//API Endpoint for onboard device to add waypoint
app.post('/api/addWayPoints', (request, response) => {
    console.log(`\n\n\n\nNew wayPoints given by vehicleId: ${request.body.vehicleId}`)
    console.log(request.body)
    console.log(`\n\n\n\n`)
    var responseForClient = addWayPointsToFile.addWayPointsToFile(request.body)
    response.json(responseForClient)
    response.end()


    appendSTRCoords.appendSTRCoords(request.body[0].vehicleId)
});