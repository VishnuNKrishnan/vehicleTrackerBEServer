const db = require('./module_initializeFirebase')

async function getWayPointCoords(vehicleId, journeyStartDateTimestamp, journeyEndDateTimestamp = null){
    var returnData = []
    const vehicleIdRef = db.collection('vehicles').doc(vehicleId).collection('providedWaypoints')
    const vehicleIdData = await vehicleIdRef.where('timestamp', '>=', journeyStartDateTimestamp).where('timestamp', '<=', journeyEndDateTimestamp).get()
    
    vehicleIdData.forEach(doc => {
        //console.log(doc.id, '=>', doc.data());
        if(returnData.length == 0){
            let coord = [doc.data().latitude, doc.data().longitude]
            //console.log([doc.data().latitude, doc.data().longitude])
            returnData.push(coord)
        }else{
            if(returnData[returnData.length-1].latitude != doc.data().latitude || returnData[returnData.length-1].latitude != doc.data().latitude){ //If this coord is not equal to last coord in array
                let coord = [doc.data().latitude, doc.data().longitude]
                //console.log([doc.data().latitude, doc.data().longitude])
                returnData.push(coord)
            }
        }
    })
    
    return returnData
}

module.exports = { getWayPointCoords }