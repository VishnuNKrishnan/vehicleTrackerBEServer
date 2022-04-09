const fs = require('fs')

//Function to open a new file for a tracker that calls the addWayPoints endpoint (if the file does not already exist), and add the following:
function addWayPointsToFile(wayPointsArray){
    if(!fs.existsSync(`./activeClientRecords/${wayPointsArray[0].vehicleId}.json`)){
        const templateForNewFile = {
            vehicleId: wayPointsArray.vehicleId,
            lastOnline: null, //timestamp of last communication with tracker
            reverseGeoCodingComplete: false,
            lastGeoCodedCoordId: null, //timestamp of the coords sent by the tracker
            snapToRoadComplete: false,
            lastSnappedToRoadId: null, //id(timestamp) of the last coord sent for snap to road service
            providedWayPoints: [], //wayPoints sent by the tracker
            SSRWayPoints: [], //wayPoints given by Snap To Road service
            identifiedLocations: [] //Array of reverse geocoded locations
        }
        fs.writeFileSync(`./activeClientRecords/${wayPointsArray[0].vehicleId}.json`, JSON.stringify(templateForNewFile, null, 4))
            //New blank file created successfully
    }
    var existingWayPointDetails = JSON.parse(fs.readFileSync(`./activeClientRecords/${wayPointsArray[0].vehicleId}.json`))

    //Spread the existing array. The spread the provided array.
    //CONSIDER REMOVING PROCESSED ELEMENTS FROM THE ARRAY TO KEEP THE ARRAY SIZE MANAGEABLE BY THE SERVER.
    existingWayPointDetails.providedWayPoints = [...existingWayPointDetails.providedWayPoints, ...wayPointsArray]
    existingWayPointDetails.lastOnline = existingWayPointDetails.providedWayPoints[existingWayPointDetails.providedWayPoints.length-1].timestamp

    fs.writeFileSync(`./activeClientRecords/${wayPointsArray[0].vehicleId}.json`, JSON.stringify(existingWayPointDetails, null, 4))

    //Return the id(timestamp) of the last waypoint added
    const lastIdAdded = existingWayPointDetails.providedWayPoints[existingWayPointDetails.providedWayPoints.length-1].timestamp
    const returnData = {lastIdAdded: lastIdAdded}

    console.log(`lastAddedId: ${returnData.lastIdAdded}`)
    return returnData;
}

module.exports = { addWayPointsToFile }