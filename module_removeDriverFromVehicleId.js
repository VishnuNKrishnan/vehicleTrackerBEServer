const db = require('./module_initializeFirebase')
const sendDriverRemovedNotification = require('./emailFunctions/sendDriverRemovedNotification_Email')

async function removeDriverFromVehicle(vehicleId){

    var responseData = {
        driverDetailsUpdated: false
    }

    //Collec vehicle details from DB
    const vehicleIdRef = db.collection('vehicles').doc(vehicleId)
    const vehicleIdData = await vehicleIdRef.get()
    const vehicleIdDataObject = vehicleIdData.data()

    //Update the details on the DB:
    if(db.collection('vehicles').doc(vehicleId).update({displayPictureBase64: '', driverName:'',  driverContact: '', driverEmail:''})){
        responseData.driverDetailsUpdated = true
        sendDriverRemovedNotification.sendDriverRemoved_Email(
            vehicleIdDataObject.vehicleDescription,
            vehicleIdDataObject.driverName,
            'OWNER',
            vehicleIdDataObject.licensePlate,
            vehicleIdDataObject.driverEmail,
            vehicleIdDataObject.displayPictureBase64    
        )
    }

    console.log(`Driver details updation status: ${responseData.driverDetailsUpdated}`)
    return responseData
}

module.exports = { removeDriverFromVehicle }