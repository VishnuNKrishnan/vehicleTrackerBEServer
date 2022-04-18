const db = require('./module_initializeFirebase')

//Function to authenticate tracking device
async function authenticateTracker(requestBody){

    var responseForClient = {
        status: 'failure'
    }

    console.log(requestBody)
    
    const providedAccountId = requestBody.accountId
    const providedVehicleId = requestBody.vehicleId
    const providedPassword = requestBody.password

    const vehicleIdRef = db.collection('vehicles').doc(providedVehicleId)
    const vehicleIdData = await vehicleIdRef.get();

    if(!vehicleIdData.data()){
        responseForClient = {
            request: requestBody,
            status: 'failure',
            message: 'Invalid credentials provided.'
        }
        console.log(`Data not found`);
        return responseForClient
    }

    //AccountId comparison
    const accountIdOnDb = vehicleIdData.data().registeredAccountId
    if(providedAccountId != accountIdOnDb){
        responseForClient = {
            request: requestBody,
            status: 'failure',
            message: 'Invalid credentials provided.'
        }
        console.log(`Account not found`);
        return responseForClient
    }

    //Password comparison
    const passwordOnDb = vehicleIdData.data().vehiclePassword
    if(providedPassword != passwordOnDb){
        responseForClient = {
            request: requestBody,
            status: 'failure',
            message: 'Invalid credentials provided.'
        }
        console.log(`Wrong password`);
        return responseForClient
    }

    // console.log(`providedAccountId: ${providedAccountId}`)
    // console.log(`requestBody.accountId: ${requestBody.accountId}`)
    // console.log(`accountIdOnDb: ${accountIdOnDb}`)
    // console.log(`providedVehicleId: ${providedVehicleId}`)
    // console.log(`requestBody.vehicleId: ${requestBody.vehicleId}`)
    // console.log(`vehicleIdData.data().vehicleId: ${vehicleIdData.data().vehicleId}`)
    // console.log(`providedPassword: ${providedPassword}`)
    // console.log(`requestBody.password: ${requestBody.password}`)
    // console.log(`passwordOnDb: ${passwordOnDb}`)

    if(providedAccountId == accountIdOnDb && providedVehicleId == vehicleIdData.data().vehicleId && providedPassword == passwordOnDb){
        responseForClient = {
            request: requestBody,
            status: 'success',
            message: 'Authentication successful.'
        }
        return responseForClient
    }
}

module.exports = { authenticateTracker }