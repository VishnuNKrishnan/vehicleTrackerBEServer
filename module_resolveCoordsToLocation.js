const db = require('./module_initializeFirebase')
const { default: fetch } = require('node-fetch')
require('dotenv').config();

async function resolveCoords(coords, timestamp = null, vehicleId){ //Coords accepted as array. eg: [25.20214,55.23652]
//Accepted timestamp parameter needs the timestamp of vehicle presence at the location

    const latitude = coords[0]
    const longitude = coords[1]

    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    console.log(`RESOLVING COORDS FOR VEHICLE ID: ${vehicleId}`)
    console.log(`--------------------------------`)
    const openCageRequestURL = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}%2C%20${longitude}&key=${process.env.NODE_SERVER_OPENCAGEAPI}&language=en&pretty=1`
    const openCageResponse = await fetch(openCageRequestURL)
    var openCageResponseJSON = await openCageResponse.json()

    if(openCageResponseJSON.status.code != 200){
        console.log(`Coordinate Resolution Failed.\nMessage from service provider: ${openCageResponseJSON.status.message}`)
        return
    }else{
        console.log(`Coordinates resolved...`)
        console.log(`SUBURB: ${openCageResponseJSON.results[0].components.suburb}`)
        console.log(`NEIGHBOURHOOD: ${openCageResponseJSON.results[0].components.neighbourhood}`)
        console.log(`CITY: ${openCageResponseJSON.results[0].components.city}`)
        console.log(`STATE: ${openCageResponseJSON.results[0].components.state}`)
        console.log(`COUNTRY: ${openCageResponseJSON.results[0].components.country}`)
        console.log(`ROAD: ${openCageResponseJSON.results[0].components.road}`)
        console.log(`ROAD REFERENCE: ${openCageResponseJSON.results[0].components.road_reference}`)
        console.log(`--------------------------------`)
        console.log(`API LIMIT: ${openCageResponseJSON.rate.limit}`)
        console.log(`API REMAINING: ${openCageResponseJSON.rate.remaining}`)
        console.log(`API RESET: ${openCageResponseJSON.rate.reset} | ${Date(openCageResponseJSON.rate.reset)}`)
    }
    
    console.log(`\n▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇\n`)
    //console.log(process.env)
    //console.log(JSON.stringify(openCageResponseJSON, null, 4))

    if(!timestamp){
        openCageResponseJSON.timestampOfVehiclePresence = Date.now()
    }else{
        openCageResponseJSON.timestampOfVehiclePresence = timestamp
    }

    db.collection('vehicles').doc(vehicleId).collection('identifiedLocations').doc('TODELETE').delete()
    db.collection('vehicles').doc(vehicleId).collection('identifiedLocations').doc(JSON.stringify(Date.now())).set(openCageResponseJSON)
    db.collection('vehicles').doc(vehicleId).update({unresolvedCoordsCount: 0})

    return openCageResponseJSON
}

module.exports = { resolveCoords }

//resolveCoords([49.234757, -123.174800], null, `v2Test3`)