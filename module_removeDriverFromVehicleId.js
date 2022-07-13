const db = require('./module_initializeFirebase')

async function removeDriverFromVehicle(vehicleId){

    var responseData = {
        driverDetailsUpdated: false
    }

    //Update the details on the DB:
    if(db.collection('vehicles').doc(vehicleId).update({displayPictureBase64: '', driverName:'',  driverContact: '', driverEmail:''})){
        responseData.driverDetailsUpdated = true
    }
    // const vehicleIdData = await vehicleIdRef.get()

    console.log(`Driver details updation status: ${responseData.driverDetailsUpdated}`)
    return responseData
}

module.exports = { removeDriverFromVehicle }