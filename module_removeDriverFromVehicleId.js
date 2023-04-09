const db = require('./module_initializeFirebase')
const sendDriverRemovedNotification = require('./emailFunctions/sendDriverRemovedNotification_Email')
const sendDriverRemovedConfirmation_SMS = require('./SMSFunctions/sendDriverRemovedConfirmation_SMS')

async function removeDriverFromVehicle(vehicleId){

    var responseData = {
        driverDetailsUpdated: false
    }

    //Collec vehicle details from DB
    const vehicleIdRef = db.collection('vehicles').doc(vehicleId)
    const vehicleIdData = await vehicleIdRef.get()
    const vehicleIdDataObject = vehicleIdData.data()

    //Update the details on the DB:
    if(db.collection('vehicles').doc(vehicleId).update({displayPictureBase64: '', driverName:'',  driverContact: '', driverEmail:'', driverContactVerified: false})){
        responseData.driverDetailsUpdated = true
        sendDriverRemovedNotification.sendDriverRemoved_Email(
            vehicleIdDataObject.vehicleDescription,
            vehicleIdDataObject.driverName,
            'OWNER',
            vehicleIdDataObject.licensePlate,
            vehicleIdDataObject.driverEmail,
            vehicleIdDataObject.displayPictureBase64    
        )
        vehicleIdDataObject.driverContactVerified ? sendDriverRemovedConfirmation_SMS.sendDriverRemovedConfirmation_SMS(vehicleIdDataObject.driverContact, vehicleIdDataObject.vehicleDescription, vehicleIdDataObject.licensePlate, vehicleIdDataObject.driverName) : null
    }

    console.log(`Driver details updation status: ${responseData.driverDetailsUpdated}`)
    return responseData
}

module.exports = { removeDriverFromVehicle }