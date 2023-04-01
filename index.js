const express = require('express')
const app = express()
const server = require('http').createServer(app)
require('dotenv').config()

const cors = require('cors')
app.use(cors())

const WebSocket = require('ws')

//const appendSTRCoords = require('./module_appendSTRCoords')
const cron = require('node-cron')
const removeExpiredOTPs_CRON = require('./cronJobs/removeExpiredOTPs')
const authenticateTracker = require(`./module_authenticateTracker`)
const linkTrackerWithAccount = require(`./module_linkTrackerWithAccount`)
const createNewAccount = require(`./module_createNewAccount`)
const addWayPointsToDB = require('./module_addWayPointsToDB_v2')
const authenticateWebApp = require('./module_authenticateWebApp')
const getVisitedLocations = require('./module_getVisitedLocations')
const getWaypointCoords = require('./module_getWayPointCoords')
const getDetailedJourneyInformation = require('./module_getDetailedJourneyInformation')
const getAllVehiclesDetailsOnAccount = require('./module_getAllVehiclesIdsOnAccount')
const getVehicleDetails = require('./module_getVehicleDetails.js')
const createNewUnregisteredVehicleId = require('./module_createNewUnregisteredVehicleId')
const sendNewVehicleId = require('./emailFunctions/sendNewVehicleId')
const sendLimitReachedEmail = require('./emailFunctions/sendLimitReached')
const sendSpeedingAlert_Email = require('./emailFunctions/sendSpeedingAlert')
const generateId = require('./submodule_generateId')
const generateOTP = require('./submodule_generateOTP')
const sendOTP_SMS = require('./SMSFunctions/sendOTP')
const sendVehicleIdSMS = require('./temp_SMSTest')
const assignDriverToVehicle = require('./module_assignDriverToVehicleID')
const removeDriverFromVehicle = require('./module_removeDriverFromVehicleId')

const { request, response, json } = require('express')
const { uuid } = require('./module_generateUUID')
const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Vehicle tracking server activated.\nListening at :${port}...`));

app.use(express.static('public'))
app.use(express.json({ limit: 100000 }))

//------------------------
//CRON Jobs
//------------------------
cron.schedule('1 * * * * *', removeExpiredOTPs_CRON.removeExpiredOTPs)

//------------------------
//WebSocket Communications
//------------------------


//API Endpoint to create new account
app.post('/app/createNewAccount', async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(Date());
    console.log(`New web app account creation request received...\n`);
    const responseForClient = await createNewAccount.createNewAccount(request.body)
    console.log(responseForClient)
    response.json(responseForClient)
    response.end()
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

//API Endpoint to create and send a new vehicle id to add new vehicle on the front end
app.post('/app/getNewVehicleId', async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(Date());
    console.log(`New vehicleId request received...\n`);

    let newVehicleId = generateId.generateVid()
    
    createNewUnregisteredVehicleId.createNewUnregisteredVehicleId(newVehicleId) //Create the new Vehicle ID

    sendNewVehicleId.sendNewVehicleId_Email(newVehicleId, 'vishnunavaneet@gmail.com') //Send Vehicle ID as Email
    //sendLimitReachedEmail.sendLimitReached()
    //sendSpeedingAlert_Email.sendSpeedingAlert_Email('DXB J 51340', 'Land Rover LR4', 'E66', 'Dubai Al Ain Road', 'Dubai', '145', 'km/h', 'Vishnu Navaneeth', '+971506738672')
    sendVehicleIdSMS.sendSMS(newVehicleId) //Send Vehicle ID as SMS
    
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

//API Endpoint to assign a driver to a vehicle ID
app.post('/app/assignDriverToVehicleID', async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(`New request to assign driver to vehicleID ${request.body.vehicleId}`)
    const responseData = await assignDriverToVehicle.assignDriverToVehicle(request.body)
    // console.log(request.body)
    response.json(responseData)
    response.end()
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(`\n\n\n`)

})

//API Endpoint to remove a driver from a vehicle ID
app.post('/app/removeDriverFromVehicle', async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(`New request to remove driver from vehicleID ${request.body.vehicleId}`)
    const responseData = await removeDriverFromVehicle.removeDriverFromVehicle(request.body.vehicleId)
    // console.log(request.body)
    response.json(responseData)
    response.end()
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(`\n\n\n`)
})

//API Endpoint to generate OTP and send to phone number
app.post('/app/getOTP', async (request, response) => {
    console.log(`\n▇▇▇▇ ${Date()} ▇▇▇▇\n`)
    console.log(`New request to generate and send OTP SMS ${request.body.phoneNumber}`)
    const responseData = await generateOTP.generateOTP()
    // Sample responseData
    // responseForClient = {
    //     success: true,
    //     requestId: 'aaa-bbb-ccc-ddd',
    //     otp: '125634'
    // }
    
    //Send OTP SMS
    sendOTP_SMS.sendOTP_SMS(request.body.phoneNumber, request.body.transactionName, responseData.otp)
    
    //Remove OTP from object so that OTP does not get sent to the broswer of the client
    delete responseData.otp
    console.log(responseData)
    response.json(responseData)
    response.end()


    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(`\n\n\n`)
})

//Live Tracking - WebSocket Server
const WebSocketServer = new WebSocket.Server({ port: process.env.WS_PORT || 4001 })
const db = require('./module_initializeFirebase')

console.log(`Websocket Server running on port ${process.env.WS_PORT || 4001}`)

WebSocketServer.on('connection', (socket) => {
    console.log('Web Socket Client connected');
    socket.send('Web Socket Connection Successful!')

    let unsub
  
    socket.on('message', (message) => {

      const receivedData = JSON.parse(message)
      //Send data to client as and when data changes on firestore
      if(receivedData.type == 'liveTrackingDataRequest'){
        const vehicleId = receivedData.vehicleId
        console.log(vehicleId)

        doc = db.collection('vehicles').doc(vehicleId)
        unsub = doc.onSnapshot(docSnapshot => {
        //console.log(`Received doc snapshot: ${docSnapshot.data().liveData}`)

        const returnData = docSnapshot.data()
        socket.send(JSON.stringify(returnData))
        
        }, err => {
            console.log(`Encountered error: ${err}`);
        });

      }
    })
  
    socket.on('close', () => {
        console.log('Client disconnected. Aborting firebase connection.')
        unsub() //Unsubscribe from Firestore connection
        console.log('WebSocket Client disconnected')
    })
})