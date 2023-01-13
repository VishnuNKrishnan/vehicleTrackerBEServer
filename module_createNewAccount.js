const db = require('./module_initializeFirebase')
const createAccountId = require('./submodule_createAccountId.js')

async function createNewAccount(givenAccountData){
    var responseData = {}

    var accountId = createAccountId.createAccountID()
    var emailId = givenAccountData.emailId
    var mobileNumber = givenAccountData.mobileNumber
    var accountPassword = givenAccountData.accountPassword
    var givenOtp = givenAccountData.givenOtp
    var otpRequestId = givenAccountData.requestId

    const otpRef = db.collection('OTPs').doc(givenAccountData.requestId)
    const otpObject = await otpRef.get()
    const otp = otpObject.data().OTP
    // console.log(otp)

    //Case 1: Invalid OTP
    if(givenAccountData.givenOtp !== otp){
        responseData.otpValidationSuccess = false
        responseData.message = 'Given OTP is invalid. Please try again.'
        return responseData
    }

    //Case 2: Valid OTP
    if(givenAccountData.givenOtp === otp){
        //Delete used OTP
        otpRef.delete()
        responseData.otpValidationSuccess = true
        responseData.message = 'OTP is valid!'

        const newAccountData = {
            accountId: accountId,
            accountPassword: accountPassword,
            connectedVehicleIds: [],
            contactEmails: [emailId],
            contactPhones: [mobileNumber],
            primaryEmail: emailId,
            subscriptionPlanId: 'free'
        }
    
        if(db.collection('registeredAccounts').doc(accountId).set(newAccountData)){
            responseData.otpValidationSuccess = true
            responseData.message = 'New account creation successful'
        }else{
            responseData.otpValidationSuccess = true
            responseData.message = 'New account creation failed'
        }
    }

    return responseData

    //ADD CODE TO ENSURE GENERATED ACCOUNT ID DOES NOT EXIST IN DB
}

// createNewAccount({
//     emailId: 'vishnunavaneet@gmail.com',
//     mobileNumber: '971506738672'
// })

module.exports = { createNewAccount }