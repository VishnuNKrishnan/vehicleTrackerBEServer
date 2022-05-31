//Function to create a VehicleID entry in the unregistereVehicleIds collection.

async function createNewUnregisteredVehicleId(vehicleId){
    const db = require('./module_initializeFirebase')
    const uuid = require('./module_generateUUID')

    //ReturnData
    var returnData = {
        newVehicleId: ''
    }

    //Object to add to DB
    const unregisteredVehicleIdObject = {
        vehicleId: vehicleId,
        vehiclePassword: 'puthiyakaavu',
        timeCreated: Date.now()
    }

    //Create the record in the DB
    db.collection('unregisteredVehicleIds').doc(unregisteredVehicleIdObject.vehicleId).set(unregisteredVehicleIdObject)

    returnData.newVehicleId = unregisteredVehicleIdObject.vehicleId

    return returnData
}

createNewUnregisteredVehicleId('526-854-896-789').then(obj=>{
    console.log(obj)
})

module.exports = { createNewUnregisteredVehicleId }