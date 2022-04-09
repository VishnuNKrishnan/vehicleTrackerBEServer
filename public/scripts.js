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

    //console.log('done')
})



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



 function deviceCompatibilityCheck(){
    const connectivityDot = document.getElementById('connectivityDot')

    var geolocationObj
    var compatibility = false
    
    var GPSAccuracy = false

    navigator.geolocation.getCurrentPosition(position=>{
        GPSAccuracy = position.coords.accuracy
    })

    setTimeout(()=>{
        console.log(`GPSAccuracy: ${GPSAccuracy}`)
        if(GPSAccuracy != false && GPSAccuracy <= 30){
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
deviceCompatibilityCheck()

document.getElementById('authenticateBtn').addEventListener('click', ()=>{
    storeAuthCredentials()
    authenticateTracker()
})



async function authenticateTracker(){
    const authenticationDot = document.getElementById('authenticationDot')
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
    authResponse = await fetch(`./api/authenticate`, options)
    authResponseData = await authResponse.json()
    authStatus = await authResponseData.status

    //console.log(`Auth Status: ${authStatus}`)

    setTimeout(()=>{
        if(authStatus == 'success'){
            authenticationDot.classList.remove('statusDotWaiting');
            authenticationDot.classList.add('statusDotSuccess');
        }else{
            authenticationDot.classList.remove('statusDotWaiting');
            authenticationDot.classList.add('statusDotFailure');
        }
    },2000)
}
authenticateTracker()

var trackingStatus = false

function checkTrackingStatus(){
    const trackingDot = document.getElementById('trackingDot')
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
            navigator.geolocation.getCurrentPosition(position => {
                UILat.textContent = `${position.coords.latitude}`
                UILon.textContent = `${position.coords.longitude}`
            })
        },5000)
    }
}
setTimeout(updateCoordsOnUI,20000)