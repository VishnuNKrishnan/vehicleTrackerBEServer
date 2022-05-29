// This function returns an array of all the vehicle IDs linked to a particular account ID, with their details.
const db = require('./module_initializeFirebase')

async function getAllVehiclesDetailsOnAccount(accountId, searchQuery = null){ //searchQuery is used to return only vehicles that somehow match with the searchQuery.

    var returnData = []

    const vehicleIdRef = db.collection('vehicles')
    const vehicleIdData = await vehicleIdRef.where('registeredAccountId', '==', parseInt(accountId)).get()

    vehicleIdData.forEach(doc => {
        
        const vehicleDetailsObject = {
            displayPictureBase64: doc.data().displayPictureBase64,
            driverName: doc.data().driverName,
            licensePlate: doc.data().licensePlate,
            vehicleDescription: doc.data().vehicleDescription,
        }

        returnData.push(vehicleDetailsObject)
    })

    return returnData
}

module.exports = { getAllVehiclesDetailsOnAccount }
// getAllVehiclesDetailsOnAccount('1212621')