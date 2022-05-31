const db = require('./module_initializeFirebase')
const uuid = require('./module_generateUUID')

async function linkTrackerWithAccount(accountId, vehicleId, vehiclePassword, licensePlate, vehicleDescription, vehicleType, vehicleGroup, engineNumber, chassisNumber){
    console.log(`Attempting to add vehicle id '${vehicleId}' to account id '${accountId}'...`);

    //Checking if provided vehicleId exists in unregisteredVehicleIds collection in the database
    const vehicleIdRef = db.collection('unregisteredVehicleIds').doc(vehicleId)
    const vehicleIdData = await vehicleIdRef.get();

    if(!vehicleIdData.data()){
        console.log(`Invalid vehicle id provided. Please retry with the correct vehicle id.`);
        return
    }else{
        console.log(`Vehicle ID '${vehicleId}' found!`);
        console.log(vehicleIdData.data())

        if(vehicleIdData.data().vehiclePassword != vehiclePassword){
            console.log(`Invalid Vehicle Password provided. Operation aborted.`);
            return
        }
    }

    //Checking if provided accountId exists in registeredAccounts collection in the database
    const accountIdRef = db.collection('registeredAccounts').doc(JSON.stringify(accountId))
    const accountIdData = await accountIdRef.get()

    if(!accountIdData.data()){
        console.log(`Invalid account id provided. Please retry with the correct account id.`);
        return
    }else{
        console.log(`Account ID '${accountId}' found!`);
        console.log(accountIdData.data())

        //1) . Add vehicleId to connectedVehicleIds array in account document
        //2) . Remove vehicleId document from unregisteredVehicleIds collection
        //3) . Create new document for vehicle with all required fields and subcollections if it does not already exist. If it exists, update the connectedAccountId field
        console.log(`\n\nAdding vehicle to account...`);
        var newVehicleDocumentTemplate = {
            vehicleId: vehicleId,
            vehiclePassword: vehiclePassword,
            licensePlate: licensePlate,
            vehicleDescription: vehicleDescription,
            vehicleType: vehicleType,
            vehicleGroup: vehicleGroup,
            engineNumber: engineNumber,
            chassisNumber: chassisNumber,
            driverName: "",
            driverContact: "",
            displayPictureBase64: "",
            lastRecordedSpeed: null,
            registeredAccountId: accountId,
            unresolvedCoordsCount: 0,
            lastOnline: null,
        }
        db.collection('vehicles').doc(vehicleId).set(newVehicleDocumentTemplate)
        db.collection('vehicles').doc(vehicleId).collection('providedWaypoints').doc('TODELETE').set({remarks: `This is an auto generated file. This file will be deleted when the first coordinate is received`})
        db.collection('vehicles').doc(vehicleId).collection('STRWaypoints').doc('TODELETE').set({remarks: `This is an auto generated file. This file will be deleted when the first coordinate is received`})
        db.collection('vehicles').doc(vehicleId).collection('identifiedLocations').doc('TODELETE').set({remarks: `This is an auto generated file. This file will be deleted when the first location object is received`})
        console.log(`\n\nVehicle ID ${vehicleId} added to vehicles collection as follows:`)
        console.log(newVehicleDocumentTemplate);
    
        console.log(`\n\nRemoving vehicle ID '${vehicleId}' from unregisteredVehicleIds collection...`);
        db.collection('unregisteredVehicleIds').doc(vehicleId).delete()
        console.log(`Removed vehicle ID '${vehicleId}' from unregisteredVehicleIds collection.`);

        console.log(`\n\nAdding vehicle ID to connectedVehicleIds array in registeredAccounts collection...`);
        var currentConnectedVehiclesArray = accountIdData.data().connectedVehicleIds //Stored as an array in the db
        var newConnectedVehiclesArray = [...currentConnectedVehiclesArray, vehicleId]
        db.collection('registeredAccounts').doc(JSON.stringify(accountId)).update({connectedVehicleIds: newConnectedVehiclesArray})
        console.log(`Added vehicle ID to connectedVehicleIds array in registeredAccounts collection as follows:`);

        const accountIdRef2 = db.collection('registeredAccounts').doc(JSON.stringify(accountId))
        const accountIdData2 = await accountIdRef2.get()
        
        console.log(accountIdData2.data());
    }
    return
}

//linkTrackerWithAccount(1212621, '785-965-854-855')
//Meaning: If vehicle id 555-999-444-333 exists in unregisteredVehicleIds collection in the db, register it with account id 1212621.

module.exports = { linkTrackerWithAccount }