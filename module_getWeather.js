const { default: fetch } = require('node-fetch')
require('dotenv').config()

async function getWeather(latitude, longitude) {
    var returnData = {error: true}

    const apiKey = process.env.NODE_SERVER_OPENWEATHERMAP_API_KEY
    const OpenWeatherMapURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
    
    const openWeatherMapResponse = await fetch(OpenWeatherMapURL)
    const openWeatherMapResponseJSON = await openWeatherMapResponse.json()

    returnData.error = false
    returnData.main = openWeatherMapResponseJSON.weather[0].main
    returnData.description = openWeatherMapResponseJSON.weather[0].description
    returnData.icon = openWeatherMapResponseJSON.weather[0].icon
    returnData.visibility = openWeatherMapResponseJSON.visibility
    returnData.windSpeed = openWeatherMapResponseJSON.wind.speed
    returnData.windDirection = openWeatherMapResponseJSON.wind.deg
    returnData.location = openWeatherMapResponseJSON.name

    return returnData
}

module.exports = { getWeather }