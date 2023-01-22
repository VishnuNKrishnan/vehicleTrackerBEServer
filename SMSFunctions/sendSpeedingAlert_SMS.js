function sendSpeedingAlert_SMS(phoneNumber, vehicleDescription, licensePlate, recordedSpeed, recordedTime, locationMain, locationSub, driverName){
    const sid = process.env.NODE_SERVER_TWILIO_SID
    const authToken = process.env.NODE_SERVER_TWILIO_AUTH_TOKEN

    const twilio = require('twilio')(sid, authToken)

    twilio.messages.create({
        from:'+19379091818',
        to: phoneNumber,
        body:`Hi, your ${vehicleDescription} (${licensePlate}) has exceeded the allowed speed limit. \nRecorded Speed: ${recordedSpeed} km/h\nLocation: ${locationMain}, ${locationSub}\nTime: ${recordedTime}\nAssigned to: ${driverName}\nPlease abide by and encourage safe driving practices so that everyone reaches home safe and sound.\nThanks,\nknoWhere`
    }).then(res=>{console.log(`Speeding Alert - SMS Sent!`)}).catch(err=>{log(err)})
}

module.exports = { sendSpeedingAlert_SMS }