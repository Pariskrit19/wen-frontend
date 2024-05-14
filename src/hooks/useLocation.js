import {useState, useEffect} from 'react'

function useLocation() {
  const [location, setLocation] = useState([])

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          setLocation([position.coords.latitude, position.coords.longitude])
        },
        () => {
          setLocation([])
        },
        {maximumAge: 60000, timeout: 5000, enableHighAccuracy: true}
      )
    } else {
      return
    }
  }, [])

  return location
}

export default useLocation
