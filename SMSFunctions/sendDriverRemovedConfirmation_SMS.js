function sendDriverRemovedConfirmation_SMS(phoneNumber, vehicleDescription, licensePlate, driverName){
    const sid = process.env.NODE_SERVER_TWILIO_SID
    const authToken = process.env.NODE_SERVER_TWILIO_AUTH_TOKEN

    const twilio = require('twilio')(sid, authToken)

    twilio.messages.create({
        from:'+19379091818',
        to: phoneNumber,
        body:`Dear ${driverName}, you have successfully returned the ${vehicleDescription} (${licensePlate}) to the owner, and your association with this vehicle has ended.`
    }).then(res=>{console.log(`Driver Removal Confirmation - SMS Sent!`)}).catch(err=>{log(err)})
}

module.exports = { sendDriverRemovedConfirmation_SMS }