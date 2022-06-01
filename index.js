const express = require('express')
const app = express()
const server = require('http').createServer(app)
require('dotenv').config()

const cors = require('cors')
app.use(cors())

const WebSocket = require('ws')
const wss = new WebSocket.Server({server: server})

//const appendSTRCoords = require('./module_appendSTRCoords')
const authenticateTracker = require(`./module_authenticateTracker`)
const linkTrackerWithAccount = require(`./module_linkTrackerWithAccount`)
const addWayPointsToDB = require('./module_addWayPointsToDB_v2')
const authenticateWebApp = require('./module_authenticateWebApp')
const getVisitedLocations = require('./module_getVisitedLocations')
const getWaypointCoords = require('./module_getWayPointCoords')
const getDetailedJourneyInformation = require('./module_getDetailedJourneyInformation')
const getAllVehiclesDetailsOnAccount = require('./module_getAllVehiclesIdsOnAccount')
const getVehicleDetails = require('./module_getVehicleDetails.js')

const { request, response } = require('express')
const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Vehicle tracking server activated.\nListening at :${port}...`));

app.use(express.static('public'))
app.use(express.json({ limit: 100000 }))

//------------------------
//WebSocket Communications
//------------------------

wss.on('connection', function connection(ws){
    console.log(`New vehicle connected.`)
    ws.send('Welcome, new vehicle!')

    ws.on('message', function incoming(message){
        console.log(`New message: ${message}`)
        ws.send(`Message received!`)
    })
})

//API Endpoint for monitor app to authenticate accounts.
app.post('/app/authenticateAccount', async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(Date());
    console.log(`New web app authentication request received...\n`);
    const responseForClient = await authenticateWebApp.authenticateWebApp(request.body)
    console.log(responseForClient)
    response.json(responseForClient)
    response.end()
})

//API Endpoint to get the details of all vehicles connected to an account as an array of objects
app.post('/app/getAllVehiclesDetails', async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(`New request to get all vehicles with details from Account No.: ${request.body.accountId}`)
    const responseForClient = await getAllVehiclesDetailsOnAccount.getAllVehiclesDetailsOnAccount(request.body.accountId)
    //console.log(responseForClient)
    console.log(`[`);
    responseForClient.forEach((obj, index)=>{
        console.log(`----${index + 1}-------------------`);
        console.log(`driverName: ${obj.driverName}`)
        console.log(`licensePlate: ${obj.licensePlate}`)
        console.log(`vehicleDescription: ${obj.vehicleDescription}`)
        console.log(`vehicleId: ${obj.vehicleId}`)
    })
    console.log(`]`)
    response.json(responseForClient)
    response.end()
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
})

//API Endpoint to get the visited Locations on a particular date for a particular vehicleId. Used by component VisitedLocationsList.jsx on the frontend.
app.post('/app/getVisitedLocations', async (request, response) => {

    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(`New request to collect visited locations...`)
    console.log(`Vehicle ID: ${request.body.vehicleId}`)
    console.log(`Journey Start Date: ${Date(JSON.stringify(request.body.journeyStartDate))}`)
    console.log(`Journey End Date: ${Date(JSON.stringify(request.body.journeyEndDate))}`)
    const responseForClient = await getVisitedLocations.getVisitedLocations(request.body.vehicleId, request.body.journeyStartDate, request.body.journeyEndDate)
    console.log(`Number of Visited Locations collected and sent: ${responseForClient.length}`)
    response.json(responseForClient)
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    response.end()
})

//API Endpoint to get the coordinates of all the waypoints travelled by a particular vehicleId from a specified start date to end date. Used by component MapHolder.jsx on the front end app.
app.post(`/app/getWayPoints`, async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(`New request to collect Waypoints...`)
    console.log(`Vehicle ID: ${request.body.vehicleId}`)
    console.log(`Journey Start Date: ${Date(JSON.stringify(request.body.journeyStartDate))}`)
    console.log(`Journey End Date: ${Date(JSON.stringify(request.body.journeyEndDate))}`)
    const responseForClient = await getWaypointCoords.getWayPointCoords(request.body.vehicleId, request.body.journeyStartDate, request.body.journeyEndDate)
    console.log(`Number of Waypoints collected and sent: ${responseForClient.length}`)
    response.json(responseForClient)
    response.end()
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
})

//API Endpoint to get details for display on VehicleDetailsBar.jsx on the front end.
app.post('/app/getVehicleDetails', async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(`New request to collect Vehicle Details for Vehicle ID ${request.body.vehicleId}...`)
    const responseForClient = await getVehicleDetails.getVehicleDetails(request.body.vehicleId)
    console.log(responseForClient)
    response.json(responseForClient)
    response.end()
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
})

//API Endpoint to get detailed Journey Information. Used by component JourneyInfoDetailed.jsx on the front end.
app.post('/app/getDetailedJourneyInfo', async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(`New request to collect Detailed Journey Information...`)
    console.log(`Vehicle ID: ${request.body.vehicleId}`)
    console.log(`Journey Start Date: ${Date(JSON.stringify(request.body.journeyStartDate))}`)
    console.log(`Journey End Date: ${Date(JSON.stringify(request.body.journeyEndDate))}`)
    const responseForClient = await getDetailedJourneyInformation.getDetailedJourneyInformation(request.body.vehicleId, request.body.journeyStartDate, request.body.journeyEndDate)
    console.log('Response for client: ', responseForClient)
    response.json(responseForClient)
    response.end()
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
})

//API Endpoint to link tracker/vehicle with AccountId (trackerId and vehicleId are the same. The name has been interchangeably used.)
app.post('/app/linkTrackerWithAccount', (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(Date());
    console.log(`New Tracker-Account-Linking request received...\n`);
    linkTrackerWithAccount.linkTrackerWithAccount(
        request.body.accountId,
        request.body.vehicleId,
        request.body.vehiclePassword,
        request.body.licensePlate,
        request.body.vehicleDescription,
        request.body.vehicleType,
        request.body.vehicleGroup,
        request.body.engineNumber,
        request.body.chassisNumber
    )
    //console.log(`New tracker registration request from: ${request.body.vehicleId}`);
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    response.end()
})

//API Endpoint for onboard device to authenticate.
app.post('/api/authenticate', async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
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
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
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