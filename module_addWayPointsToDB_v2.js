const db = require('./module_initializeFirebase')

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

    //Collect the document for the specific vehicleId from the vehicles db.
    const vehicleRef = db.collection('vehicles').doc(wayPointsArray[0].vehicleId).collection('providedWaypoints');
    var vehicleData = await vehicleRef.get();
    console.log(vehicleData);

    wayPointsArray.map(obj => {
        //console.log(obj)
        db.collection('vehicles').doc(wayPointsArray[0].vehicleId).collection('providedWaypoints').doc(JSON.stringify(obj.timestamp)).set(obj)
        lastIdAdded = obj.timestamp
    })

        

        //Return the id(timestamp) of the last waypoint added. The tracker will erase all the collected coords till this ID from its memory when lasetIdAdded is received
        var returnData = {lastIdAdded: lastIdAdded}
        //console.log(JSON.stringify(wayPointsArray.slice(-1)[0].timestamp))
        return returnData
}

module.exports = { addWayPointsToDB }