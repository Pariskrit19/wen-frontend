import React, {useEffect, useState} from 'react'
import moment from 'moment'

function LiveTime() {
  const [time, setTime] = useState<string>(moment().format('h:mm:ss A'))

  useEffect(() => {
    const realTIme = setInterval(() => {
      setTime(moment().format('h:mm:ss A'))
    }, 1000)
    return () => clearInterval(realTIme)
  }, [])
  return <span>&nbsp;{time}</span>
}

export default LiveTime
