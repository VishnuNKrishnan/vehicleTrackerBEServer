const express = require('express');
const app = express();
require('dotenv').config();

var cors = require('cors')
app.use(cors())



//const appendSTRCoords = require('./module_appendSTRCoords')
const authenticateTracker = require(`./module_authenticateTracker`)
const linkTrackerWithAccount = require(`./module_linkTrackerWithAccount`)
const addWayPointsToDB = require('./module_addWayPointsToDB_v2');
const authenticateWebApp = require('./module_authenticateWebApp')
const { request } = require('express');
//const { app } = require('firebase-admin');
const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Vehicle tracking server activated.\nListening at :${port}...`));

app.use(express.static('public'));
app.use(express.json({ limit: 100000 }))

//API Endpoint for monitor app to authenticate accounts.
app.post('/app/authenticateAccount', async (request, response) => {
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(Date());
    console.log(`New web app authentication request received...\n`);
    const responseForClient = await authenticateWebApp.authenticateWebApp(request.body)
    console.log(responseForClient);
    response.json(responseForClient)
    response.end()
})

//API Endpoint to register new tracker/vehicle (trackerId and vehicleId are the same. The name has been interchangeably used.)
app.get('/api/registerNewTracker', (request, response) => {
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(Date());
    console.log(`New Tracker-Account-Linking request received...\n`);
    linkTrackerWithAccount.linkTrackerWithAccount(1212621,`222-111-232-220`)
    //console.log(`New tracker registration request from: ${request.body.vehicleId}`);
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    response.end()
})

//API Endpoint for onboard device to authenticate.
app.post('/api/authenticate', async (request, response) => {
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(Date());
    console.log(`New authentication request from vehicleId: ${request.body.vehicleId}`)
    var responseForClient = await authenticateTracker.authenticateTracker(request.body)
    console.log(`Authentication Status for ${request.body.vehicleId}: ${responseForClient.status}`)
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    response.json(responseForClient)
    response.end()
});

//API Endpoint for onboard device to add waypoint
app.post('/api/addWayPoints', async (request, response) => {
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(Date());
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