const db = require('./module_initializeFirebase')
const { uuid } = require('uuidv4')

//Function to generate a new OTP with number of digits = character count, and create its entry in the DB for utilizing it.
async function generateOTP(characterCount = 6){

    var newOtp = ''
    var responseForClient = {
        success: false,
        requestId: '',
        otp: ''
    }

    const allowedCharsArray = [0,1,2,3,4,5,6,7,8,9]


    for(var i = 1; i <= characterCount; i++){
        newOtp += allowedCharsArray[Math.floor(Math.random() * 10)] //Collect one character from allowedCharsArray and append it to newOtp
    }

    const nowTimestamp = Date.now()
    const otpObject = {
        requestId: uuid(),
        OTP: newOtp,
        created: nowTimestamp,
        expires: nowTimestamp + 600000 //10 Minutes after creation
    }

    //Add OTP to DB
    if(db.collection('OTPs').doc(otpObject.requestId).set(otpObject)){
        responseForClient.success = true
        responseForClient.requestId = otpObject.requestId
        responseForClient.otp = otpObject.OTP //This does not get sent to the client's browser. It only gets sent via SMS
    }

    return responseForClient
}

module.exports = { generateOTP }

//generateOTP(8)