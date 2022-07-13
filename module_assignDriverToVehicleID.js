const db = require('./module_initializeFirebase')

async function assignDriverToVehicle(detailsObject){
    //Sample of parameters received from the request:
    // {
    //     vehicleId: currentVehicleId,
    //     driverPhotoBase64: driverPhotoBase64,
    //     driverFullName: driverFullName,
    //     driverEmail: driverEmail,
    //     driverContact: driverContact,
    //     driverContactVerified: false,
    //   }

    var responseData = {
        driverDetailsUpdated: false
    }

    //Update the details on the DB:
    if(db.collection('vehicles').doc(detailsObject.vehicleId).update({displayPictureBase64: detailsObject.driverPhotoBase64, driverName: detailsObject.driverFullName, driverContact: detailsObject.driverContact, driverEmail: detailsObject.driverEmail})){
        responseData.driverDetailsUpdated = true
    }
    // const vehicleIdData = await vehicleIdRef.get()

    console.log(`Driver details updation status: ${responseData.driverDetailsUpdated}`)
    return responseData
}

module.exports = { assignDriverToVehicle }