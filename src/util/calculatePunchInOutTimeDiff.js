import moment from 'moment'

const calculateTimeDifference = (latestPunchInTime, threshhold = 10) => {
  if (typeof threshhold !== 'number') {
    throw new Error('Threshhold must be a number.')
  }
  // Calculate the difference between the current time and the latest punch in time
  const diff = moment().diff(moment(latestPunchInTime))
  const duration = moment.duration(diff)

  const totalSeconds = duration.asSeconds()
  const remainingSeconds = threshhold * 60 - totalSeconds
  const remainingMinutes = Math.max(0, Math.ceil(remainingSeconds / 60))
  const remainingSecs = parseInt(Math.max(0, remainingSeconds % 60))
  return {
    minutes: remainingMinutes,
    seconds: remainingSecs,
    isLessthanMinute: remainingMinutes === 0,
  }
}

export default calculateTimeDifference
