const db = require('./module_initializeFirebase')
const { default: fetch } = require('node-fetch')
require('dotenv').config();
const rctl = require('./module_resolveCoordsToLocation')
const sendSpeedingAlertMail = require('./emailFunctions/sendSpeedingAlert')

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
//      -driverName (Used to display who was driving when viewing the tracker front end app in history mode)
// -Return the timestamp of the last document added as an object in the format: {lastIdAdded: 25632541254}
// -------------------------------------------------

//Function to add the contents of each object in the request.body object as a new document is the database
async function addWayPointsToDB(wayPointsArray){
    var lastIdAdded //To be returned to the client
    var newCoordsCount = 0
    var speedArray = [] //To send speeding alert email if request objects contain speed value greater than the allowed speed

    const vehicleRef = db.collection('vehicles').doc(wayPointsArray[0].vehicleId)
    var vehicleData = await vehicleRef.get()
    const driverName = vehicleData.data().driverName

    const allowedSpeedLimit = vehicleData.data().speedLimit
    const lastAlertEmailSentAt = vehicleData.data().lastAlertEmailSentAt ? vehicleData.data().lastAlertEmailSentAt : null

    //To return single object from speedArray which has the maximum speed
    function findFastest(arr) {
        return arr.reduce((fastest, current) => {
            return (current.speed > fastest.speed) ? current : fastest;
        });
    }
    

    wayPointsArray.map(obj => {
        //console.log(obj)
        //Remove autogenerated TODELETE file if it exists.
        db.collection('vehicles').doc(wayPointsArray[0].vehicleId).collection('providedWaypoints').doc('TODELETE').delete()
        
        //Add earlier collected driverName to the object, and create a new wayPoint object on the db.
        obj.driverName = driverName
        db.collection('vehicles').doc(wayPointsArray[0].vehicleId).collection('providedWaypoints').doc(JSON.stringify(obj.timestamp)).set(obj)
        lastIdAdded = obj.timestamp
        newCoordsCount++
        speedArray.push({timestamp: obj.timestamp, speed: obj.speed * 3.6, latitude: obj.latitude, longitude: obj.longitude})
    })

    //Resolve Coords to location unresolvedCoordsCount is greater than 150...
    var currentUnresolvedCoordsCount = vehicleData.data().unresolvedCoordsCount
    currentUnresolvedCoordsCount += newCoordsCount
    //console.log(vehicleData.data().unresolvedCoordsCount);
    //console.log(currentUnresolvedCoordsCount);
    db.collection('vehicles').doc(wayPointsArray[0].vehicleId).update({unresolvedCoordsCount: currentUnresolvedCoordsCount, lastOnline: Date.now(), lastRecordedSpeed: wayPointsArray[wayPointsArray.length - 1].speed})

    if(currentUnresolvedCoordsCount >= 150){
        const lastLatitude = wayPointsArray[wayPointsArray.length - 1].latitude
        const lastLongitude = wayPointsArray[wayPointsArray.length - 1].longitude
        const lastTimestamp = wayPointsArray[wayPointsArray.length - 1].timestamp
        const vehicleId = wayPointsArray[wayPointsArray.length - 1].vehicleId
        rctl.resolveCoords([lastLatitude, lastLongitude], lastTimestamp, vehicleId)
    }

    //console.log(vehicleData);

    //Speeding Email Alert if required
    const highestSpeed = findFastest(speedArray)
    if(highestSpeed.speed > allowedSpeedLimit){
        if(vehicleData.data().alertDriverMethods.includes('email')){
            //Add Code to send mail only 15 minutes after last sent mail
            const lastEmailSentAtTimestamp = vehicleData.data().lastAlertEmailSentAt ? vehicleData.data().lastAlertEmailSentAt : null
            const timePassedAfterLastEmail = Date.now() - lastEmailSentAtTimestamp
            if(lastEmailSentAtTimestamp != null && timePassedAfterLastEmail > 60*15*1000){
                //Resolve location data where speeding occured
                const openCageRequestURL = `https://api.opencagedata.com/geocode/v1/json?q=${highestSpeed.latitude}%2C%20${highestSpeed.longitude}&key=${process.env.NODE_SERVER_OPENCAGEAPI}&language=en&pretty=1`
                const openCageResponse = await fetch(openCageRequestURL)
                var openCageResponseJSON = await openCageResponse.json()

                const city = openCageResponseJSON.results[0].components.city
                const roadName = openCageResponseJSON.results[0].components.road
                const suburb = openCageResponseJSON.results[0].components.suburb ? openCageResponseJSON.results[0].components.suburb : ''

                console.log("Initiating speeding email alert");
                sendSpeedingAlertMail.sendSpeedingAlert_Email(
                    vehicleData.data().licensePlate,
                    vehicleData.data().vehicleDescription,
                    suburb,
                    roadName,
                    city,
                    highestSpeed.speed,
                    'km/h',
                    allowedSpeedLimit,
                    vehicleData.data().driverName,
                    vehicleData.data().driverContact,
                    vehicleData.data().driverEmail,
                    highestSpeed.timestamp
                )
                db.collection('vehicles').doc(wayPointsArray[0].vehicleId).update({lastAlertEmailSentAt: Date.now()})
                console.log('Speeding email triggered');
            }
        }
    }
        

    //Return the id(timestamp) of the last waypoint added. The tracker will erase all the collected coords till this ID from its memory when lasetIdAdded is received
    var returnData = {lastIdAdded: lastIdAdded}
    //console.log(JSON.stringify(wayPointsArray.slice(-1)[0].timestamp))
    return returnData
}

module.exports = { addWayPointsToDB }