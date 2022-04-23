const db = require('./module_initializeFirebase')

async function authenticateWebApp(requestBody){
    var responseForClient = {
        status: 'failure',
        message: '',
        authExpiry: ''
    }

    console.log(requestBody)
    
    const providedAccountId = requestBody.accountId
    const providedPassword = requestBody.password

    //console.log(providedAccountId);

    const accountIdRef = db.collection('registeredAccounts').doc(providedAccountId) //providedAccountId
    const accountIdData = await accountIdRef.get();

    if(!accountIdData.data()){
        responseForClient.message = 'Account not found. Please retry with correct account number.'
        console.log(responseForClient);
        return responseForClient
    }

    if(providedPassword == accountIdData.data().accountPassword){
        responseForClient.status = 'success'
        responseForClient.message = 'Authentication Successful!'
        responseForClient.authExpiry = Date.now() + (60 * 60 * 24 * 30 * 1000) //30 days from now.
        return responseForClient
    }else{
        responseForClient.status = 'failure'
        responseForClient.message = 'Invalid Password. Please retry.'
        responseForClient.authExpiry = Date.now() //now.
        return responseForClient
    }

    console.log(accountIdData.data());
    console.log(responseForClient);
}

module.exports = { authenticateWebApp }

//authenticateWebApp({accountId: '1212621', password: ''})