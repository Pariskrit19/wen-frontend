import {useState} from 'react'
import moment from 'moment'

export const useCleanCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(moment())
  const thisMonthsStartDate = moment(currentMonth).startOf('month')
  const thisMonthsEndDate = moment(currentMonth).endOf('month')
  const monthChangeHandler = (newDate) => {
    setCurrentMonth(moment(newDate))
  }
  return {
    currentMonth,
    thisMonthsStartDate,
    thisMonthsEndDate,
    monthChangeHandler,
  }
}
