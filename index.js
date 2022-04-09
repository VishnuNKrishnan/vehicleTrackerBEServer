const express = require('express');
app = express();
require('dotenv').config();

var cors = require('cors')
app.use(cors())

const fs = require('fs');
const appendSTRCoords = require('./module_appendSTRCoords')

const addWayPointsToFile = require('./module_addWayPointsToFile')

app.listen(3000, () => console.log('Vehicle tracking server activated.\nListening at :3000...'));

app.use(express.static('public'));
app.use(express.json())

//API Endpoint for onboard device to authenticate. ADD CODE TO CHECK WITH DATABASE
app.post('/api/authenticate', (request, response) => {
    console.log(`New authentication request`)
    var responseForClient = {request: request.body, status: 'success'}
    response.json(responseForClient)
    response.end()


    //appendSTRCoords.appendSTRCoords(request.body[0].vehicleId)
});

//API Endpoint for onboard device to add waypoint
app.post('/api/addWayPoints', (request, response) => {
    console.log(request.body)
    var responseForClient = addWayPointsToFile.addWayPointsToFile(request.body)
    response.json(responseForClient)
    response.end()


    //appendSTRCoords.appendSTRCoords(request.body[0].vehicleId)
});