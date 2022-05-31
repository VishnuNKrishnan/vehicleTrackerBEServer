// This function returns an array of all the vehicle IDs linked to a particular account ID, with their details.
const db = require('./module_initializeFirebase')

async function getAllVehiclesDetailsOnAccount(accountId, searchQuery = null){ //searchQuery is used to return only vehicles that somehow match with the searchQuery.

    var returnData = []

    const vehicleIdRef = db.collection('vehicles')
    const vehicleIdData = await vehicleIdRef.where('registeredAccountId', '==', parseInt(accountId)).get()

    vehicleIdData.forEach(doc => {
        
        //Image to display when DP is unavailable:
        const templateDP = 'data:image/jpg;base64,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'
        
        const vehicleDetailsObject = {
            displayPictureBase64: doc.data().displayPictureBase64 == '' ? templateDP : doc.data().displayPictureBase64,
            driverName: doc.data().driverName == '' ? 'Driver Not Assigned' : doc.data().driverName,
            licensePlate: doc.data().licensePlate,
            vehicleDescription: doc.data().vehicleDescription,
            vehicleId: doc.data().vehicleId,
            displayStyleObject: {display: 'flex'} //Used on the front end to manipulate and show or hide the vehicle card based on user's search query.
        }

        returnData.push(vehicleDetailsObject)
    })

    return returnData
}

module.exports = { getAllVehiclesDetailsOnAccount }
// getAllVehiclesDetailsOnAccount('1212621')