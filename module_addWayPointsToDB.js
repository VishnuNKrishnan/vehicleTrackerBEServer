//GoogleFirestore Initialization
//Refer: https://www.youtube.com/watch?v=Z87OZtIYC_0

const admin = require('firebase-admin')
const serviceAccount = require('./firestoreServiceAccountKey.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const db = admin.firestore()

//---------------------

const fs = require('fs')

//Function to open a new document for a tracker that calls the addWayPoints endpoint (if the document does not already exist), and add the following:
async function addWayPointsToDB(wayPointsArray){
    
    const vehicleRef = db.collection('vehicles').doc(wayPointsArray[0].vehicleId);
    var vehicleData = await vehicleRef.get();

    if(!vehicleData.exists){
        var templateForNewFile = {
            vehicleId: wayPointsArray[0].vehicleId,
            lastOnline: wayPointsArray[wayPointsArray.length - 1].timestamp, //timestamp of last communication with tracker
            reverseGeoCodingComplete: false,
            lastGeoCodedCoordId: null, //timestamp of the coords sent by the tracker
            snapToRoadComplete: false,
            lastSnappedToRoadId: null, //id(timestamp) of the last coord sent for snap to road service
            providedWayPoints: [], //wayPoints sent by the tracker. Saved in the format as required by the STR service - {latitude: 12.25411, longitude: 45.36258}
            SSRWayPoints: [], //wayPoints given by Snap To Road service
            identifiedLocations: [] //Array of reverse geocoded locations
        }

        wayPointsArray.map(obj=>{
            templateForNewFile.providedWayPoints.push({latitude: obj.latitude, longitude: obj.longitude})
        })
        db.collection('vehicles').doc(wayPointsArray[0].vehicleId).set(templateForNewFile)
        //New blank document created successfully
        
        
    }else{
        
        var vehicleDataObject = vehicleData.data()
        vehicleDataObject.lastOnline = wayPointsArray[wayPointsArray.length - 1].timestamp
        vehicleDataObject.snapToRoadComplete = false
        reverseGeoCodingComplete = false
        
        wayPointsArray.map(obj=>{
            vehicleDataObject.providedWayPoints.push({latitude: obj.latitude, longitude: obj.longitude})
        })  
        db.collection('vehicles').doc(wayPointsArray[0].vehicleId).update(vehicleDataObject)
        //Document updated successfully

        //Return the id(timestamp) of the last waypoint added. The tracker will erase all the collected coords till this ID from its memory when lasetIdAdded is received
        var indexOfLastCoords = wayPointsArray.length-1
        var returnData = {lastIdAdded: wayPointsArray[indexOfLastCoords].timestamp}
        //console.log(JSON.stringify(wayPointsArray.slice(-1)[0].timestamp))
        return returnData
    }
}

module.exports = { addWayPointsToDB }