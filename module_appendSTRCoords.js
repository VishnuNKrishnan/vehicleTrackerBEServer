// //GoogleFirestore Initialization
// //Refer: https://www.youtube.com/watch?v=Z87OZtIYC_0

// const admin = require('firebase-admin')
// const serviceAccount = require('./firestoreServiceAccountKey.json')
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// })
// const db = admin.firestore()

// //---------------------

const fs = require('fs')
const { default: fetch } = require('node-fetch');

//Function: If active records file has 50 or more new way points that are not snapped to road, send them for STR service.
async function appendSTRCoords(vehicleId){
    //Abort function if client record does not exist
    if(!fs.existsSync(`./activeClientRecords/${vehicleId}.json`)){
        return
    }

    if(!fs.existsSync(`./activeClientRecords/activeClientSTRRecords/${vehicleId}.json`)){
        const templateForNewFile = {
            vehicleId: vehicleId,
            collectedCoords: [], //Coords provided by the GPS tracker
            STRCoords: [] //Array of coords Snapped to road. Received from Bing STR API.
        }
        //fs.writeFileSync(`./activeClientRecords/activeClientSTRRecords/${vehicleId}.json`, JSON.stringify(templateForNewFile, null, 4))
        db.collection('vehicles').doc(vehicleId).set(templateForNewFile)
        //New blank file created successfully
    }

    //const vehicleDataObject = JSON.parse(fs.readFileSync(`./activeClientRecords/${vehicleId}.json`))
    const vehicleDataObject = await db.collection('vehicles').doc(vehicleId).get()
    const lastSnappedToRoadId = vehicleDataObject.lastSnappedToRoadId

    //Find the index of the object with the last snapped id in the coordsArray object in the main file. Search backwards to find element faster.
    var lastSnappedToRoadIdIndex = null

    for(var i=vehicleDataObject.providedWayPoints.length - 1; i >= 0; i--){
        if(vehicleDataObject.providedWayPoints[i].timestamp == lastSnappedToRoadId){
            lastSnappedToRoadIdIndex = i;
            break
        }
    } //Found the index...

    //Creating a new array containing only the coords that are not yet snapped to road. Done by slicing the original array using the lastSnappedToRoadIdIndex in the previous step.
    const coordsObjectArrayForSTRURL = vehicleDataObject.providedWayPoints.slice(lastSnappedToRoadIdIndex, vehicleDataObject.providedWayPoints.length-lastSnappedToRoadIdIndex-1)
    //console.log(coordsArrayForSTRURL)
    var coordsArrayForSTRURL = []
    const lastSnappedToRoadCoordId = vehicleDataObject.providedWayPoints[vehicleDataObject.providedWayPoints.length-1].timestamp //to update lastId sent for STR
    coordsObjectArrayForSTRURL.map(obj=>{
        coordsArrayForSTRURL.push({latitude: obj.latitude, longitude: obj.longitude})
    })

    //console.log(coordsArrayForSTRURL)
    //return


    // const tempCoords = [

    //     {latitude: 9.9618077, longitude: 76.3086379},
    //     {latitude: 9.9618303, longitude: 76.3087898},
    //     {latitude: 9.9618381, longitude: 76.3088086},
    //     {latitude: 9.9618584, longitude: 76.3088294},
    //     {latitude: 9.9618584, longitude: 76.3088294},
    //     {latitude: 9.9618654, longitude: 76.3088343},
    //     {latitude: 9.9618858, longitude: 76.3088418},
    //     {latitude: 9.9620176, longitude: 76.3088516}
                        
    // ]

    //Bing API Work Flow:
    //Send the POST request with the collected coords.
    //From the result get the "resultURL" key's value.
    //After the number of seconds mentioned, call the result URL for snapped coords.
    //Refer: https://docs.microsoft.com/en-us/bingmaps/rest-services/routes/snap-points-to-roads

    var snappedCoords

    const dataForURL = {
        points: coordsArrayForSTRURL, //coordsArrayForSTRURL,
        interpolate: true,
        includeSpeedLimit: true,
        includeTruckSpeedLimit: true,
        speedUnit: 'KPH',
        travelMode: 'driving'
    }
        
    const options = {
        method: 'POST',
        body: JSON.stringify(dataForURL),
        headers: {
            'Content-Length': JSON.stringify(dataForURL).length,
            'Content-Type': 'application/json'
        }
    }

    const URLResponse = await fetch(`https://dev.virtualearth.net/REST/v1/Routes/SnapToRoadAsync?key=${process.env.NODE_SERVER_BING_MAPS_API_KEY}`, options)
    const URLData = await URLResponse.json()

    console.log(`Coords being sent to API`)
    console.log(coordsArrayForSTRURL)
    console.log(`\n\n\n\n`)

    if(coordsArrayForSTRURL.length < 1){
        return  //Error handling
    }

    const callBackWaitPeriod = await URLData.resourceSets[0].resources[0].callbackInSeconds
    const callbackUrl = await URLData.resourceSets[0].resources[0].callbackUrl
    //Received callbackUrl. now, fetch callbackUrl to receive resultUrl

    var resultUrl
    var isCompleted = false
    while(!isCompleted){
        console.log(`Attempting to get result URL...`)
        const callbackUrlResponse = await fetch(callbackUrl)
        const callbackUrlData = await callbackUrlResponse.json()
        resultUrl = await callbackUrlData.resourceSets[0].resources[0].resultUrl
        if(resultUrl != undefined){
            isCompleted = true
            console.log(`Result URL:\n${resultUrl}\n\nContinuing to fetch result URL...`)
            
            //Wait...
            const now = Date.now()
            while((Date.now() - now) < callBackWaitPeriod * 1000){
                ;
            }

            const resultUrlResponse = await fetch(resultUrl)
            const resultUrlData = await resultUrlResponse.json()
            const statusCode = await resultUrlData.statusCode
            if(statusCode != 200){
                return
            }
            snappedCoords = await resultUrlData.resourceSets[0].resources[0].snappedPoints
            console.log(`Result Url Data: ${statusCode}`)
        }
    }
    //console.log(`Snapped Coords: ${JSON.stringify(snappedCoords)}`)
    //Received Snapped Coords from API
    
    var snappedCoordsForatted = []
    snappedCoords.map(obj=>{
        var formattedCoordinateArray = [obj.coordinate.latitude, obj.coordinate.longitude]
        snappedCoordsForatted.push(formattedCoordinateArray)
    })
    console.log(`snappedCoordsForatted: ${JSON.stringify(snappedCoordsForatted)}`)
    
    //Append snapped coords to file
    var STRRecordObject = JSON.parse(fs.readFileSync(`./activeClientRecords/activeClientSTRRecords/${vehicleId}.json`))
    STRRecordObject.STRCoords = [...STRRecordObject.STRCoords, ...snappedCoordsForatted]
    fs.writeFileSync(`./activeClientRecords/activeClientSTRRecords/${vehicleId}.json`, JSON.stringify(STRRecordObject, null, 4))


    //Update lastSnappedId on main file
    vehicleDataObject.lastSnappedToRoadId = lastSnappedToRoadCoordId
    fs.writeFileSync(`./activeClientRecords/${vehicleId}.json`, JSON.stringify(vehicleDataObject, null, 4))
}

module.exports = { appendSTRCoords }