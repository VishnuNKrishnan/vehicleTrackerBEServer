const db = require('./module_initializeFirebase')
const getFormattedLocation = require('./submodule_getFormattedLocation')

async function getVisitedLocations(vehicleId, journeyStartDateTimestamp, journeyEndDateTimestamp = null){
    returnData = [] //Array of visited location objects as received from db.

    journeyEndDateTimestamp == null ? journeyEndDateTimestamp = journeyStartDateTimestamp : null ;

    const vehicleIdRef = db.collection('vehicles').doc(vehicleId).collection('identifiedLocations')
    const vehicleIdData = await vehicleIdRef.where('timestampOfVehiclePresence', '>=', journeyStartDateTimestamp).where('timestampOfVehiclePresence', '<=', journeyEndDateTimestamp).get()
    vehicleIdData.forEach(doc => {
        //console.log(doc.id, '=>', doc.data());
        if(returnData.length == 0){
            returnData.push(doc.data())
        }else{
            if(getFormattedLocation.getFormattedLocation(returnData[returnData.length-1]).mainLocation != getFormattedLocation.getFormattedLocation(doc.data()).mainLocation){
                returnData.push(doc.data())
            }
        }
      })

    //console.log(vehicleIdData)

    console.log(`Collecting visited locations for Vehicle ID '${vehicleId}' from ${journeyStartDateTimestamp} to ${journeyEndDateTimestamp}...`)
    return returnData
}

module.exports = { getVisitedLocations }