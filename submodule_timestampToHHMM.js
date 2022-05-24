function timestampToHHMM(timestamp){
    var timestampFromObject = new Date(timestamp)
          var timestampHours = timestampFromObject.getHours()
          if (timestampHours < 10) {
            timestampHours = `0${timestampFromObject.getHours()}`
          }
          var timestampMinutes = timestampFromObject.getMinutes()
          if (timestampMinutes < 10) {
            timestampMinutes = `0${timestampFromObject.getMinutes()}`
          }
          var returnValue = `${timestampHours}:${timestampMinutes}`

          return returnValue
}

module.exports = { timestampToHHMM }