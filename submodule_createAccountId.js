//Function to 7 digit Generate Account ID
var numArray = ['0','1','2','3','4','5','6','7','8','9']
function createAccountID(){
    let numString = ''
    for(var i = 0; i < 7; i++){
        numString += numArray[Math.floor(Math.random() * 10)] //Collect one random element from numArray
    }
    return numString
}

module.exports = { createAccountID }