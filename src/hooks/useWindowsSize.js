import {useEffect, useState} from 'react'

function useWindowsSize() {
  const getWindowsSize = () => {
    const {innerWidth, innerHeight} = window
    return {innerWidth, innerHeight}
  }
  const [windowSize, setWindowSize] = useState(getWindowsSize())

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize(getWindowsSize())
    }

    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])
  return windowSize
}

export default useWindowsSize
