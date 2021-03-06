window.addEventListener('load', function(){
    if(window.localStorage.getItem('authData') == null || window.localStorage.getItem('authData') == undefined){
        return
    }

    const accountIdInput = document.getElementById('accountIdInput')
    const vehicleIdInput = document.getElementById('vehicleIdInput')
    const passwordInput = document.getElementById('passwordInput')

    const storedCredentials = JSON.parse(window.localStorage.getItem('authData'))
    accountIdInput.value = storedCredentials.accountId
    vehicleIdInput.value = storedCredentials.vehicleId
    passwordInput.value = storedCredentials.password

    toggleAuthenticateBtn()
    if(!emptyAuthenticationFieldsExist()){
        authenticateTracker()
    }
    //console.log('done')
    deviceAccuracyCheck()
})

document.getElementById('accountIdInput').addEventListener('keyup', function(){
    toggleAuthenticateBtn()
})
document.getElementById('vehicleIdInput').addEventListener('keyup', function(){
    toggleAuthenticateBtn()
})
document.getElementById('passwordInput').addEventListener('keyup', function(){
    toggleAuthenticateBtn()
})



function emptyAuthenticationFieldsExist(){
    const accountIdInput = document.getElementById('accountIdInput')
    const vehicleIdInput = document.getElementById('vehicleIdInput')
    const passwordInput = document.getElementById('passwordInput')

    if(accountIdInput.value == "" || vehicleIdInput.value == "" || passwordInput.value == ""){
        return true
    }else{
        return false
    }
}




function toggleAuthenticateBtn(){
    const authenticateBtn = document.getElementById('authenticateBtn')
    if(emptyAuthenticationFieldsExist()){
        authenticateBtn.setAttribute('disabled', true)
    }else{
        authenticateBtn.removeAttribute('disabled')
    }
}



function storeAuthCredentials(){
    const accountIdInput = document.getElementById('accountIdInput')
    const vehicleIdInput = document.getElementById('vehicleIdInput')
    const passwordInput = document.getElementById('passwordInput')

    if(!window.localStorage.getItem('authData')){
        const authData = {
            accountId: '',
            vehicleId: '',
            password: '',
            timestamp: null
        }
        window.localStorage.setItem('authData', JSON.stringify(authData))
    }
    
    var storedCredentials
    storedCredentials = JSON.parse(window.localStorage.getItem('authData'))
    storedCredentials.accountId = accountIdInput.value
    storedCredentials.vehicleId = vehicleIdInput.value
    storedCredentials.password = passwordInput.value

    window.localStorage.setItem('authData', JSON.stringify(storedCredentials))
}



 function deviceAccuracyCheck(){
    const connectivityDot = document.getElementById('connectivityDot')

    var compatibility = false
    var GPSAccuracy = false

    navigator.geolocation.getCurrentPosition(position=>{
        GPSAccuracy = position.coords.accuracy
    })

    setTimeout(()=>{
        console.log(`GPSAccuracy: ${GPSAccuracy}`)
        if(GPSAccuracy != false && GPSAccuracy <= 15){
            compatibility = true
        }
        if(!compatibility){
            connectivityDot.classList.remove('statusDotWaiting');
            connectivityDot.classList.add('statusDotFailure');
        }else{
            connectivityDot.classList.remove('statusDotWaiting');
            connectivityDot.classList.add('statusDotSuccess');
        }
    },3000)
}

setInterval(deviceAccuracyCheck(),10000)

document.getElementById('authenticateBtn').addEventListener('click', ()=>{
    storeAuthCredentials()
    authenticateTracker(true) //Parameter: manual. Set to true if authentication is manually triggered. When true, localStorage CoordsArray will be emptied upon authentication.
})



async function authenticateTracker(manual = false){
    const authenticationDot = document.getElementById('authenticationDot')
    const storedAuthData = (JSON.parse(window.localStorage.getItem('authData')))
    if(storedAuthData.accountId == "" || storedAuthData.vehicleId == "" || storedAuthData.password == ""){
        authenticationDot.classList.add('statusDotFailure');
        var storedCoordsArray = JSON.parse(window.localStorage.getItem('coordsArray'))
        if(storedCoordsArray){
            storedCoordsArray = []
            window.localStorage.setItem('coordsArray', (JSON.stringify(storedCoordsArray, null, 4)))
        }
        console.log('Authentication aborted: Please fill in all the fields')
        updateWaypointsAPI()
        return
    }

    authenticationDot.classList.add('statusDotWaiting');

    const data = window.localStorage.getItem('authData')
    const options = {
        method: 'POST',
        body: data, //Do not use JSON.stringify, as data loaded from local storage is already a string
        mode: 'cors',
        headers: {
            'Access-Control-Allow-Origin':'*',
            'Content-Type': 'application/json'
        }
    }
    const authResponse = await fetch(`./api/authenticate`, options).catch(err=>console.log(err))
    const authResponseData = await authResponse.json()
    const authStatus = authResponseData.status
    const authMessage = authResponseData.message

    console.log(`Auth Status: ${authStatus}`)
    console.log(`Auth Message: ${authMessage}`)

    checkTrackingStatus(manual)
    setTimeout(()=>{
        if(authStatus == 'success'){
            authenticationDot.classList.remove('statusDotWaiting');
            authenticationDot.classList.remove('statusDotFailure');
            authenticationDot.classList.add('statusDotSuccess');
            if(manual){
                const emptyCoordsArrayForLocalStorage = []
                window.localStorage.setItem('coordsArray', JSON.stringify(emptyCoordsArrayForLocalStorage, null, 4))
            }
        }else{
            authenticationDot.classList.remove('statusDotWaiting');
            authenticationDot.classList.add('statusDotFailure');
        }
    },2000)
}

var trackingStatus = false

function checkTrackingStatus(manual=false){
    const trackingDot = document.getElementById('trackingDot')
    if(manual){
        trackingDot.classList.contains('statusDotFailure') ? trackingDot.classList.remove('statusDotFailure') : trackingDot.classList.remove('statusDotSuccess')
        trackingDot.classList.add('statusDotWaiting');
    }
    var existingCoords
    if(window.localStorage.getItem('coordsArray') != null && window.localStorage.getItem('coordsArray') != undefined){
        existingCoords = window.localStorage.getItem('coordsArray')
    }

    setTimeout(()=>{
        if(existingCoords != window.localStorage.getItem('coordsArray')){
            trackingDot.classList.remove('statusDotWaiting');
            trackingDot.classList.add('statusDotSuccess');
            trackingStatus = true
        }else{
            trackingDot.classList.remove('statusDotWaiting');
            trackingDot.classList.add('statusDotFailure');
        }
    },15000)
}
checkTrackingStatus()




function updateCoordsOnUI(){
    var UILat = document.getElementById('collectedLatitude')
    var UILon = document.getElementById('collectedLongitude')
    if(trackingStatus = true){
        setInterval(async ()=>{
            navigator.geolocation.watchPosition(position => {
                UILat.textContent = `${position.coords.latitude}`
                UILon.textContent = `${position.coords.longitude}`
            })
        },5000)
    }
}
setTimeout(updateCoordsOnUI,20000)