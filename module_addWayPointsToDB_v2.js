const { recursiveDelete } = require('./module_initializeFirebase')
const db = require('./module_initializeFirebase')
const rctl = require('./module_resolveCoordsToLocation')

// -------------------------------------------------
//  Workflow:
// -------------------------------------------------
// -Create a new document within the providedWaypoints collection for each object sent by the tracker in the request.body array.
// -The title of each new object will be the timestamp of the object creating that file.
// -Each new document will contain the following data sent from the tracker:
//      -vehicleId
//      -timestamp
//      -latitude
//      -longitude
//      -speed
//      -heading
// -Return the timestamp of the last document added as an object in the format: {lastIdAdded: 25632541254}
// -------------------------------------------------

//Function to add the contents of each object in the request.body object as a new document is the database
async function addWayPointsToDB(wayPointsArray){
    var lastIdAdded //To be returned to the client
    var newCoordsCount = 0

    wayPointsArray.map(obj => {
        //console.log(obj)
        db.collection('vehicles').doc(wayPointsArray[0].vehicleId).collection('providedWaypoints').doc(JSON.stringify(obj.timestamp)).set(obj)
        lastIdAdded = obj.timestamp
        newCoordsCount++
    })

    //Resolve Coords to location unresolvedCoordsCount is greater than 150...
    const vehicleRef = db.collection('vehicles').doc(wayPointsArray[0].vehicleId)
    var vehicleData = await vehicleRef.get();

    
    var currentUnresolvedCoordsCount = vehicleData.data().unresolvedCoordsCount
    currentUnresolvedCoordsCount += newCoordsCount
    //console.log(vehicleData.data().unresolvedCoordsCount);
    //console.log(currentUnresolvedCoordsCount);
    db.collection('vehicles').doc(wayPointsArray[0].vehicleId).update({unresolvedCoordsCount: currentUnresolvedCoordsCount, lastOnline: Date.now()})

    if(currentUnresolvedCoordsCount >= 150){
        const lastLatitude = wayPointsArray[wayPointsArray.length - 1].latitude
        const lastLongitude = wayPointsArray[wayPointsArray.length - 1].longitude
        const lastTimestamp = wayPointsArray[wayPointsArray.length - 1].timestamp
        const vehicleId = wayPointsArray[wayPointsArray.length - 1].vehicleId
        rctl.resolveCoords([lastLatitude, lastLongitude], lastTimestamp, vehicleId)
    }

    //console.log(vehicleData);
        

    //Return the id(timestamp) of the last waypoint added. The tracker will erase all the collected coords till this ID from its memory when lasetIdAdded is received
    var returnData = {lastIdAdded: lastIdAdded}
    //console.log(JSON.stringify(wayPointsArray.slice(-1)[0].timestamp))
    return returnData
}

module.exports = { addWayPointsToDB }