function sendDriverAssignedConfirmation_SMS(phoneNumber, vehicleDescription, licensePlate, driverName, driverEmail, driverContact){
    const sid = process.env.NODE_SERVER_TWILIO_SID
    const authToken = process.env.NODE_SERVER_TWILIO_AUTH_TOKEN

    const twilio = require('twilio')(sid, authToken)

    twilio.messages.create({
        from:'+19379091818',
        to: phoneNumber,
        body:`Dear ${driverName}, the ${vehicleDescription} (${licensePlate}) has been successfully assigned to you. Please verify your details below:\n\nFullName: ${driverName}\n\nEmail ID: ${driverEmail}\n\nContact: ${driverContact}`
    }).then(res=>{console.log(`Driver Assignment Confirmation - SMS Sent!`)}).catch(err=>{log(err)})
}

module.exports = { sendDriverAssignedConfirmation_SMS }