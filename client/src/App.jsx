import { useState, useEffect } from 'react'
import Dash from './components/Dash'
import Laps from './components/Laps'
import LoginPage from './components/LoginPage'
import { formatLapTime, generateRandomID } from './helpers'

function App() {
  const [rpms, setRpms] = useState(0)
  const [gear, setGear] = useState('N')
  const [gauge, setGauge] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [currentLap, setCurrentLap] = useState('--:--:--')
  const [bestLap, setBestLap] = useState('--:--:--')
  const [loggedIn, setLoggedIn] = useState(false)
  const [currentCar, setCurrentCar] = useState('')
  var HOST = location.origin.replace(/^http/, 'ws')
  // const API_URL = 'ws://asseto-corsa-dashboard-api-b61e575ec14b.herokuapp.com'
  // // const API_URL = 'ws://192.168.31.162:5000'

  let socket = null
  let maxRpm = 0
  let startTime = 0

  const gearsList = {
    0: 'R',
    1: 'N',
    2: '1',
    3: '2',
    4: '3',
    5: '4',
    6: '5',
    7: '6',
    8: '7',
    9: '8',
  }

  // useEffect hook to watch for changes in currentCar and update startTime
  useEffect(() => {
    // Check if currentCar is not null
    if (currentCar !== null) {
      // Update startTime to the current timestamp
      startTime = Date.now()
      console.log('Start time updated:', startTime)
    }
  }, [currentCar]) // Run this effect whenever currentCar changes

  const mapRange = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  }

  // document.documentElement.style.setProperty('--background-color', 'yellowgreen');

  const updateValues = (data) => {
    //lastLap
    const currentLap = formatLapTime(data.data.lapTime)
    const bestLap = formatLapTime(data.data.bestLap)
    const rpms = parseInt(data.data.engineRPM)

    // Set up highest rpm it seen only in first 10 seconds
    if (Date.now() - startTime < 10000) {
      // Collects and sets highest rpm value for the last 10 seconds
      maxRpm = rpms > maxRpm ? rpms : maxRpm
      // Only logs it at the last second of these 10 seconds
      if (Date.now() - startTime > 9900) {
        console.log(`Max RPM set to: ${maxRpm}`)
      }
    }

    const gear = gearsList[data.data.gear]
    const speed = parseInt(data.data.speedKmh)
    const gauge = parseInt(mapRange(rpms, 0, maxRpm, 0, 100))
    // console.log(rpms,gear,speed, gauge);

    //update state for each data
    setRpms(rpms)
    setGear(gear)
    setGauge(gauge)
    setSpeed(speed)
    setCurrentLap(currentLap)
    setBestLap(bestLap)
  }

  const connectToAc = () => {
    // This IP is where the asseto corsa running (getting from user)
    const ip = document.querySelector('.login-ip-form').value
    if (!ip) return

    // this IP is where this server will be running
    socket = new WebSocket(HOST)

    socket.onopen = () => {
      // Once socket is open send initial ID and pass IP to try to connect to AC
      socket.send(
        JSON.stringify({ id: generateRandomID(), method: 'connection', ip: location.origin })
      )

      // Add listeners to newly opened socket
      socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data)

        switch (parsedData.method) {
          case 'handshake':
            // Set new starting timer by updating car
            setCurrentCar(parsedData.data.carName)
            // Set Flag to render actual display instead of 'login' stuff
            setLoggedIn(true)
            break
          case 'data':
            updateValues(parsedData)
            break
          case 'error':
            // Display error
            console.log(parsedData.message)
            // Then clear socket
            socket = null
            // Reset login trigger to see 'Enter IP screen'
            setLoggedIn(false)
          default:
            break
        }
      }

      // Not sure if its working and how to test it
      socket.onerror = (error) => {
        console.error(error)
      }
    }
  }

  window.addEventListener('beforeunload', function (event) {
    // send ws request to close udp server
    socket &&
      socket.send(
        JSON.stringify({
          method: 'disconnect',
        })
      )
  })

  return !loggedIn ? (
    <LoginPage connectToAc={connectToAc} />
  ) : (
    <div className="app">
      <Dash rpms={rpms} gear={gear} gauge={gauge} speed={speed} />
      <Laps currentLap={currentLap} bestLap={bestLap} />
    </div>
  )
}

export default App
