const db = require('./module_initializeFirebase')
const timestampToHHMM = require('./submodule_timestampToHHMM')

async function getDetailedJourneyInformation(vehicleId, journeyStartDateTimestamp, journeyEndDateTimestamp = null){
    var returnData = {
        vehicleId: vehicleId,
        journeyStartDateTimestamp: journeyStartDateTimestamp,
        journeyEndDateTimestamp: journeyEndDateTimestamp,
        driverNames: [],
        averageSpeed: 0,
        maxRecordedSpeed: 0,
        yAxisLabels:[],
        xAxisLabels:[]
    }

    var wayPointsCount = 0 //Used to calculate average
    var speedSum = 0 //Used to calculate average

    const vehicleIdRef = db.collection('vehicles').doc(vehicleId).collection('providedWaypoints')
    const vehicleIdData = await vehicleIdRef.where('timestamp', '>=', journeyStartDateTimestamp).where('timestamp', '<=', journeyEndDateTimestamp).get()
    
    vehicleIdData.forEach(doc => {
        //console.log(doc.id, '=>', doc.data());
        wayPointsCount++
        if(doc.data().driverName){ //Add drivername to array
            if(!returnData.driverNames.includes(doc.data().driverName)){
                returnData.driverNames.push(doc.data().driverName)
            }
        }

        if(doc.data().speed){ // add speed to array
            if(doc.data().speed * 3.6 > returnData.maxRecordedSpeed){
                returnData.maxRecordedSpeed = Math.round(doc.data().speed * 3.6)
            }
            returnData.yAxisLabels.push(Math.round(doc.data().speed * 3.6))

            speedSum += doc.data().speed * 3.6
        }

        returnData.xAxisLabels.push(timestampToHHMM.timestampToHHMM(doc.data().timestamp))
    })

    //returnData.averageSpeed = Math.round(speedSum/wayPointsCount)
    if(!isNaN(Math.round(speedSum/wayPointsCount))){
        returnData.averageSpeed = Math.round(speedSum/wayPointsCount)
    }
    
    //console.log(returnData)
    return returnData
}

//getDetailedJourneyInformation('484-lng-52q-452', 1653337528000, 1653337764000)

module.exports = { getDetailedJourneyInformation }