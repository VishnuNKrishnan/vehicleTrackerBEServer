function sendSpeedingAlert_SMS(phoneNumber, vehicleDescription, licensePlate, recordedSpeed, recordedTime, locationMain, locationSub, driverName){
    const sid = process.env.NODE_SERVER_TWILIO_SID
    const authToken = process.env.NODE_SERVER_TWILIO_AUTH_TOKEN

    const twilio = require('twilio')(sid, authToken)

    const date = new Date(recordedTime);
    const dateOptions = { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = date.toLocaleString('en-US', dateOptions);
    //console.log(dateInDubai); // Output: "25-09-2022"

    const timeOptions = { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit' };
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    //console.log(timeInDubai); // Output: "08:00"

    const recordedTimeFormatted = formattedTime
    const recordedDateFormatted = formattedDate
    const legalSpeedLimit = 'NA'

    twilio.messages.create({
        from:'+19379091818',
        to: phoneNumber,
        body:`Hi, your ${vehicleDescription} (${licensePlate}) has exceeded the allowed speed limit.\n\nRecorded Speed: ${recordedSpeed.toFixed()} km/h\nLocation: ${locationMain}, ${locationSub}\nTime: ${recordedTimeFormatted}, ${recordedDateFormatted}\nAssigned to: ${driverName}\n\nPlease abide by and encourage safe driving practices so that everyone reaches home safe and sound.\nThanks,\nknoWhere`
    }).then(res=>{console.log(`Speeding Alert - SMS Sent!`)}).catch(err=>{log(err)})
}

module.exports = { sendSpeedingAlert_SMS }