function sendOTP_SMS(phoneNumber, transactionName, OTP){
    const sid = process.env.NODE_SERVER_TWILIO_SID
    const authToken = process.env.NODE_SERVER_TWILIO_AUTH_TOKEN

    const twilio = require('twilio')(sid, authToken)

    twilio.messages.create({
        from:'+19379091818',
        to: phoneNumber,
        body:`Hi, your OTP for ${transactionName} is ${OTP}. Please use this OTP to complete your tansaction within the next 10 minutes.`
    }).then(res=>{console.log(`New OTP for ${transactionName} - SMS Sent!`)}).catch(err=>{log(err)})
}

module.exports = { sendOTP_SMS }