import moment from 'moment'

export const disabledDate = (current) => {
  return new Date(current).getDay() === 0 || new Date(current).getDay() === 6
}

export const disabledAfterToday = (current) => {
  return current && current.valueOf() >= moment().endOf('day')
}

export const disabledBeforeToday = (current) => {
  return current < moment().startOf('day')
}
