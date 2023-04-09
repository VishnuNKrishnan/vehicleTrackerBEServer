function sendSMS(newVehicleId){
    const sid = 'AC6b6fcd30bcd39c170c5b1356ab48bf1c'
    const authToken = '8f911b1470b7d6e477e5a894950776e8'

    const twilio = require('twilio')(sid, authToken)

    twilio.messages.create({
        from:'+19379091818',
        to:'+971506738672',
        body:`Hi, your new vehicle ID is ${newVehicleId}. Please use this ID to link your new vehicle within the next 10 minutes.`
    }).then(res=>{console.log(`New Vehicle ID - ${newVehicleId} - SMS Sent!`)}).catch(err=>{log(err)})
}

module.exports = { sendSMS }