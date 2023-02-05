const db = require('./module_initializeFirebase')
const sendEmailNotification = require('./emailFunctions/sendDriverAssignedNotification')
const sendDriverAssignedConfirmation_SMS = require('./SMSFunctions/sendDriverAssignedConfirmation_SMS')

async function assignDriverToVehicle(detailsObject){
    //Sample of parameters received from the request:
    // {
    //     vehicleId: currentVehicleId,
    //     driverPhotoBase64: driverPhotoBase64,
    //     driverFullName: driverFullName,
    //     driverEmail: driverEmail,
    //     driverContact: driverContact,
    //     requestId: false,
    //     otp: false
    //   }

    var responseData = {
        driverDetailsUpdated: false,
        otpValidationSuccess: false,
        message: ''
    }

    //Get vehicle details from DB
    const vehicleDetailsRef = db.collection('vehicles').doc(detailsObject.vehicleId)
    const vehicleDetails = await vehicleDetailsRef.get()
    const vehicleDetailsObject = vehicleDetails.data()

    //console.log(vehicleDetailsObject)

    //If Contact verification OTP has been provided, verify and proceed or reject
    if(detailsObject.otp){
        const otpRef = db.collection('OTPs').doc(detailsObject.requestId)
        const otpObject = await otpRef.get()
        const otp = otpObject.data().OTP
        // console.log(otp)

        //Case 1: Invalid OTP
        if(detailsObject.otp !== otp){
            responseData.message = 'Given OTP is invalid. Please try again.'
            return responseData
        }

        //Case 2: Valid OTP
        if(detailsObject.otp === otp && db.collection('vehicles').doc(detailsObject.vehicleId).update({displayPictureBase64: detailsObject.driverPhotoBase64, driverName: detailsObject.driverFullName, driverContact: detailsObject.driverContact, driverEmail: detailsObject.driverEmail, driverContactVerified: true})){
            //Delete used OTP
            otpRef.delete()
            responseData.driverDetailsUpdated = true
            responseData.message = 'OTP is valid!'
            responseData.otpValidationSuccess = true
    
            //Send Email notification
            sendEmailNotification.sendNewDriverAssigned_Email(
                vehicleDetailsObject.vehicleDescription,
                detailsObject.driverFullName,
                'OWNER',
                vehicleDetailsObject.licensePlate,
                detailsObject.driverEmail,
                detailsObject.driverContact,
                detailsObject.driverPhotoBase64
            )
        }
        console.log(`Driver details updation status: ${responseData.driverDetailsUpdated}`)
        return responseData
    }

    // ============ BELOW CODE IS ONLY FOR CONTACT INVERIFIED ASSIGNMENTS ================

    //Update the details on the DB without driver contact verification:
    if(db.collection('vehicles').doc(detailsObject.vehicleId).update({displayPictureBase64: detailsObject.driverPhotoBase64, driverName: detailsObject.driverFullName, driverContact: detailsObject.driverContact, driverEmail: detailsObject.driverEmail, driverContactVerified: false})){
        responseData.driverDetailsUpdated = true

        //Send Email notification
        sendEmailNotification.sendNewDriverAssigned_Email(
            vehicleDetailsObject.vehicleDescription,
            detailsObject.driverFullName,
            'OWNER',
            vehicleDetailsObject.licensePlate,
            detailsObject.driverEmail,
            detailsObject.driverContact,
            detailsObject.driverPhotoBase64
        )
        vehicleDetailsObject.driverContactVerified == true ? sendDriverAssignedConfirmation_SMS.sendDriverAssignedConfirmation_SMS(detailsObject.driverContact, vehicleDetailsObject.vehicleDescription, vehicleDetailsObject.licensePlate, detailsObject.driverName, detailsObject.driverEmail, detailsObject,driverContact) : null
    }

    console.log(`Driver details updation status: ${responseData.driverDetailsUpdated}`)
    return responseData
}

module.exports = { assignDriverToVehicle }