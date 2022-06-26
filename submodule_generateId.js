function generateVid(){
    var returnData = ''

    var alphaArray = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
    var numArray = ['0','1','2','3','4','5','6','7','8','9']

    function createAlphaString(){
        let alphaString = ''
        for(var i = 0; i < 3; i++){
            alphaString += alphaArray[Math.floor(Math.random() * 26)] //Collect one random element from alphaArray
        }
        return alphaString
    }

    function createNumString(){
        let numString = ''
        for(var i = 0; i < 3; i++){
            numString += numArray[Math.floor(Math.random() * 10)] //Collect one random element from numArray
        }
        return numString
    }

    returnData = `${createAlphaString()}-${createNumString()}-${createAlphaString()}-${createNumString()}`

    //console.log(returnData)
    return returnData
}

module.exports = { generateVid }