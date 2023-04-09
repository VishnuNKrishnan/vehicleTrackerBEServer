const db = require('../module_initializeFirebase')

async function removeExpiredOTPs(){
    //Function to remove expired unused OTPs from the DB
    console.log('CRON JOB INITIATED: Unused OTP Removal')

    const currentTimestamp = Date.now()
    var deletedOTPCount = 0 //Number of OTPs Deleted

    const OTPCollectionRef = db.collection('OTPs')
    const OTPCollectionData = await OTPCollectionRef.where('expires', '<=', currentTimestamp).get() //Where 'expires' is less than current time. ie, expiry timestamp falls before current timestamp. ie, expiry time is over, meaning it has to be removed.
    
    OTPCollectionData.forEach(obj=>{
        if(OTPCollectionRef.doc(obj.data().requestId).delete()){
            deletedOTPCount++
        }
    })
    console.log(`CRON JOB ENDED: ${deletedOTPCount} Unused OTPs Removed`);
}

module.exports = { removeExpiredOTPs }