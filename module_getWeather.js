const axios = require('axios')
require('dotenv').config()

async function getWeather(latitude, longitude) {
    const apiKey = process.env.NODE_SERVER_OPENWEATHERMAP_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
    
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
}


async function callGetWeather(latitude, longitude){
    var returnData = {error: true}
    getWeather(latitude, longitude)
    .then(response => {
  
      returnData.error = false
      returnData.main = response.weather[0].main
      returnData.description = response.weather[0].description
      returnData.icon = response.weather[0].icon
      returnData.visibility = response.visibility
      returnData.windSpeed = response.wind.speed
      returnData.windDirection = response.wind.deg
      returnData.location = response.name
  
      console.log(returnData)
      return returnData
    })
    .catch(error => {
      console.error(error)
  })
}

module.exports = { callGetWeather }