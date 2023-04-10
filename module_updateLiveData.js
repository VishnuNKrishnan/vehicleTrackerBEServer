const db = require('./module_initializeFirebase')
require('dotenv').config()

async function updateLiveData(liveData){

    var returnData = {updated: false}

    const updatedLiveData = {
        vehicleId : liveData.vehicleId,
        newCoords : [liveData.latitude, liveData.longitude],
        latitude : liveData.latitude,
        longitude : liveData.longitude,
        speed : liveData.speed,
        heading : liveData.heading,
        accuracy : liveData.accuracy
    }
    //console.log(updatedLiveData)
    db.collection('vehicles').doc(liveData.vehicleId).update({liveData: updatedLiveData})
    returnData.updated = true
    return returnData
}

// updateLiveData({
//     "vehicleId" : "WCQ-975-BCQ-080",
//     "newCoords" : [22, 55],
//     "latitude" : 22,
//     "longitude" : 55,
//     "speed" : 4,
//     "heading" : 42,
//     "accuracy" : 7
// })

module.exports = { updateLiveData }