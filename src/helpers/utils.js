import {notification} from './notification'
import moment from 'moment'

export const handleSort = (
  currentState,
  stateSetter,
  sortField,
  sortMethod
) => {
  let sorted = [...currentState]

  if (sortMethod === 'asc') {
    sorted.sort((a, b) =>
      a[sortField]?.toString().localeCompare(b[sortField]?.toString())
    )
  }

  if (sortMethod === 'desc') {
    sorted.sort((a, b) =>
      b[sortField]?.toString().localeCompare(a[sortField]?.toString())
    )
  }

  stateSetter(sorted)

  return true
}

export const sortData = (data, sortField, sortMethod) => {
  let sorted = [...data]

  sorted.sort((a, b) =>
    a[sortField]?.toString().localeCompare(b[sortField]?.toString())
  )

  if (sortMethod === 'desc') sorted = sorted.reverse()

  return sorted
}

export const handleLocalValidate = (schema, checkField, checkData) => {
  return schema
    .validateAt(checkField, {[checkField]: checkData})
    .then(() => {
      // Passes validation
      return {valid: true}
    })
    .catch((err) => {
      // Failed validation
      if (err.name === 'ValidationError') {
        return {valid: false, error: err.errors}
      }

      return {valid: true}
    })
}

export const handleValidateObj = async (schema, inputObj) => {
  const getValids = async (items) => {
    return Promise.all(
      items.map((item) => {
        return handleLocalValidate(schema, item, inputObj[item]).then((res) => {
          return {...res, input: item}
        })
      })
    )
  }

  return await getValids(Object.keys(inputObj))
}

export const generateErrorState = (localValidationArr) => {
  let newErrors = {}

  localValidationArr.forEach((validated) => {
    if (validated.valid) {
      newErrors[validated.input] = null
    } else {
      newErrors[validated.input] = validated.error
    }
  })

  return newErrors
}

export const checkIsFileImageType = (fileName) => {
  const splittedFile = fileName?.split('.')
  const fileType = splittedFile[splittedFile?.length - 1]
  const imageTypes = ['gif', 'jpeg', 'png', 'jpg']
  return imageTypes.includes(fileType)
}

export const changeDateFormat = (date) => {
  const oldFormat = date.split('T')
  const newDate = oldFormat[0].split('-')
  const time = oldFormat[1].split('.')
  return `${newDate[1]}/${newDate[2]}/${newDate[0]} ${time[0]}`
}

export function formatAMPM(date) {
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  let strTime = hours + ':' + minutes + ' ' + ampm
  return strTime
}

export const isoDateWithoutTimeZone = (date) => {
  if (date == null) return date
  date = new Date(date)

  const localDateAndTime = `${changeDate(date)} ${formatAMPM(date)}`
  return localDateAndTime
}

export const checkIfVisibleInViewPort = (el) => {
  const rect = el?.getBoundingClientRect()
  if (rect) {
    const viewHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight
    )
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0)
  }
  return false
}

export const getFormattedLink = (link) => {
  let formattedlink = link?.trim()
  if (!/^https?:\/\//i.test(link)) {
    formattedlink = 'https://' + link
  }
  return formattedlink
}

export const sortFromDate = (data = [], sortField) => {
  return data?.sort(function (a, b) {
    return new Date(a[sortField]) - new Date(b[sortField])
  })
}

export const arraySortFromDate = (data = [], sortField) => {
  return data?.sort(function (a, b) {
    return new Date(b[0]?.[sortField]) - new Date(a[0]?.[sortField])
  })
}

export const csvFileToArray = (string) => {
  var lines = string.split('\n')
  var result = []
  var headers
  headers = lines[0]?.split(',')?.map((item) => item.split(' ').join(''))
  for (var i = 1; i < lines.length; i++) {
    var obj = {}
    if (lines[i] === undefined || lines[i].trim() === '') {
      continue
    }
    //filtering with index as an extra id is present which is not necessary
    var words = lines[i].split(',')
    for (var j = 0; j < words.length; j++) {
      obj[headers[j]?.trim()?.toLowerCase().replaceAll('"', '')] = words[
        j
      ].replaceAll('"', '')
    }
    result.push(obj)
  }
  return result
}

export const convertDateToUTC = (date) => {
  return new Date(date.getTime()).toJSON()
}

export const debounce = (func, delay = 2000) => {
  let timer
  return function () {
    let self = this
    let args = arguments
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(self, args)
    }, delay)
  }
}

export function roundedToFixed(input, digits) {
  var rounded = Math.pow(10, digits)
  return Math.round(input * rounded) / rounded
}

export function currentUTCDateTime() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  now.setSeconds(0)
  now.setMilliseconds(0)
  return now.toISOString().slice(0, -1)
}

export function MuiFormatDate(d) {
  const date = new Date(d)
  let dd = date.getDate()
  let mm = date.getMonth() + 1
  const yyyy = date.getFullYear()
  if (dd < 10) {
    dd = `0${dd}`
  }
  if (mm < 10) {
    mm = `0${mm}`
  }
  return `${yyyy}-${mm}-${dd}`
}

export const getLocalStorageData = (type) => {
  let storage = sessionStorage.getItem(type) || localStorage.getItem(type)

  try {
    return JSON.parse(storage)
  } catch (error) {
    storage = JSON.stringify(
      sessionStorage.getItem(type) || localStorage.getItem(type)
    )
    return JSON.parse(storage)
  }
}

export const dateDifference = (end, start) => {
  if (end === null || start === null) return ''
  // get total seconds between the times
  let delta = Math.abs(new Date(end) - new Date(start)) / 1000

  // calculate (and subtract)  days
  let days = Math.floor(delta / 86400)
  delta -= days * 86400

  // calculate (and subtract)  hours
  let hours = Math.floor(delta / 3600) % 24
  delta -= hours * 3600

  // calculate (and subtract)  minutes
  let minutes = Math.floor(delta / 60) % 60

  return `${days === 0 ? '' : days === 1 ? `${days} day` : `${days} days`} ${
    hours === 0 ? '' : hours === 1 ? `${hours} hr` : `${hours} hrs`
  } ${
    minutes === 0
      ? '0 mins'
      : minutes === 1
      ? `${minutes} min`
      : `${minutes} mins`
  } `
}

export function convertMsToHM(milliSec) {
  let delta = Math.abs(milliSec) / 1000

  let hours = Math.floor(delta / 3600)
  delta -= hours * 3600

  let minutes = Math.floor(delta / 60) % 60

  return `${hours === 0 ? '' : hours === 1 ? `${hours} hr` : `${hours} hrs`} ${
    minutes === 0 ? '' : minutes === 1 ? `${minutes} min` : `${minutes} mins`
  } `
}

export const milliSecondIntoHours = (milliSec) => {
  let delta = Math.abs(milliSec) / 1000

  // calculate (and subtract)  days
  let days = Math.floor(delta / 86400)
  delta -= days * 86400

  // calculate (and subtract)  hours
  let hours = Math.floor(delta / 3600) % 24
  delta -= hours * 3600

  // calculate (and subtract)  minutes
  let minutes = Math.floor(delta / 60) % 60

  return `${days === 0 ? '' : days === 1 ? `${days} day` : `${days} days`} ${
    hours === 0 ? '' : hours === 1 ? `${hours} hr` : `${hours} hrs`
  } ${
    minutes === 0 ? '' : minutes === 1 ? `${minutes} min` : `${minutes} mins`
  } `
}

export const hourIntoMilliSecond = (hour) => {
  return hour * 60 * 60 * 1000
}

export function toRoundoff(number) {
  const toSingle = Number.isInteger(number) ? number : +number.toFixed(1)
  return toSingle
}

export function formatBytes(bytes, decimals = 2) {
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function changeDate(d) {
  const date = new Date(d)
  let dd = date.getDate()
  let mm = date.getMonth() + 1
  const yyyy = date.getFullYear()
  if (dd < 10) {
    dd = `0${dd}`
  }
  if (mm < 10) {
    mm = `0${mm}`
  }
  return `${dd}/${mm}/${yyyy}`
}

export function removeDash(param) {
  return param
    .split('-')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ')
}

export const filterOptions = (input, option) =>
  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0

export const projectFilterOptions = (input, option) => {
  return (
    option.props.children?.[1]?.props?.children
      ?.toLowerCase()
      .indexOf(input.toLowerCase()) >= 0
  )
}

export const filterSortOptions = (optionA, optionB) =>
  (optionA?.children ?? '')
    .toLowerCase()
    .localeCompare((optionB?.children ?? '').toLowerCase())

export const handleResponse = (
  response,
  successMessage,
  errorMessage,
  queries
) => {
  if (response.status) {
    queries.forEach((query) => {
      query()
    })

    notification({
      message: `${successMessage}!`,
      type: 'success',
    })
  } else {
    queries[queries.length - 1]()
    notification({
      message: response?.data?.message || `${errorMessage}!`,
      type: 'error',
    })
  }
}

export const formatToUtc = (date) => {
  const m = moment(date._d)
  m.set({h: 5, m: 45, s: 0})
  return m
}

export const filterHalfDayLeaves = (leaves) => {
  const approvedLeaves = leaves.filter(
    (leave) => leave.leaveStatus === 'approved'
  )
  //i.e full day leave applied
  if (approvedLeaves.length === 1 && approvedLeaves[0]?.isHalfDay === '') {
    return true
  }
  // 2 half days applied or more than 2 leaves on the same day  due to special leaves inclusion
  if (approvedLeaves.length >= 2) {
    return true
  }

  return false
}

export const pendingLeaves = (leaves) => {
  const pendingLeaves = leaves.filter(
    (leave) => leave.leaveStatus === 'pending'
  )
  if (pendingLeaves.length === 1 && pendingLeaves[0]?.isHalfDay === '') {
    return true
  }
  if (pendingLeaves.length === 2) {
    return true
  }
}

export const specifyParticularHalf = (leaves) => {
  const approvedLeaves = leaves.filter(
    (leave) => leave.leaveStatus === 'approved'
  )
  if (approvedLeaves.length === 1 && approvedLeaves[0]?.isHalfDay !== '') {
    return {specificHalf: approvedLeaves[0]?.isHalfDay, halfLeaveApproved: true}
  }
  const pendingLeaves = leaves.filter(
    (leave) => leave.leaveStatus === 'pending'
  )
  if (pendingLeaves.length === 1 && pendingLeaves[0]?.isHalfDay !== '') {
    return {specificHalf: pendingLeaves[0]?.isHalfDay, halfLeavePending: true}
  }
}

export function dayCheck(date) {
  var thisYear = moment(date).year()
  var mom = moment(date).year(thisYear)
  return mom.calendar(null, {
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastDay: '[Yesterday]',
    lastWeek: '[Last] dddd',
    sameElse: 'DD/MM/YYYY',
  })
}

export const oneWeekFilterCheck = (x) => {
  const todayStartDate = new Date()
  todayStartDate.setUTCHours(0, 0, 0, 0)
  return (
    new Date(x.date) >= new Date(todayStartDate) &&
    new Date(x.date) <=
      new Date(
        new Date(new Date(todayStartDate).getTime() + 8 * 24 * 60 * 60 * 1000)
      )
  )
}
export const checkIfTimeISBetweenOfficeHour = (
  officeStartTime = '09:10:00',
  officeEndTime = '18:00:00'
) => {
  const now = new Date()

  const startTime = officeStartTime
  const endTime = officeEndTime

  const s = startTime.split(':')
  const startTime1 = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    parseInt(s[0]),
    parseInt(s[1]),
    parseInt(s[2])
  )

  const e = endTime.split(':')
  const endTime2 = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    parseInt(e[0]),
    parseInt(e[1]),
    parseInt(e[2])
  )
  return now > startTime1 && now < endTime2
}

export function capitalizeInput(input) {
  input = input
    .toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  input = input.join(' ')
  return input
}

export const isNotValidTimeZone = () => {
  return (
    Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1] !==
      'Katmandu' &&
    Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1] !==
      'Kathmandu'
  )
}

export const compare = (a, b) => {
  if (new Date(a?.date) < new Date(b?.date)) {
    return -1
  } else if (new Date(a?.date) > new Date(b?.date)) {
    return 1
  }
  return 0
}

// dd/mm/yyyy to yyyy-mm-dd
export const dateToDateFormat = (date) => {
  return date.toString().split('/').reverse().join('-')
}

export const getIsAdmin = () => {
  return !!getLocalStorageData('admin')
}

//sorting through day
export const daySorter = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
}

//scrolling the form to the part that shows error
export const scrollForm = (form, name) => {
  form.scrollToField(name, {
    behavior: 'smooth',
    block: 'end',
  })
}

export const isLeavesBeforeToday = (leaveDates) => {
  let firstDayofLeave
  if (leaveDates.length === 1) {
    firstDayofLeave = new Date(leaveDates[0]).setUTCHours(0, 0, 0, 0)
  } else {
    const ascSortedDate = leaveDates.sort(
      (date1, date2) => new Date(date1) - new Date(date2)
    )
    firstDayofLeave = new Date(ascSortedDate[0])?.setUTCHours(0, 0, 0, 0)
  }
  const todayDate = new Date()
  todayDate.setUTCHours(0, 0, 0, 0)

  return new Date(todayDate) < new Date(firstDayofLeave)
}

//filter specific User
export const filterSpecificUser = (group, name) => {
  return group?.filter((user) => user.name !== name)
}

//get date range from a start date to end date
export const getDateRangeArray = function (s, e) {
  let a = []
  for (const d = new Date(s); d <= new Date(e); d.setDate(d.getDate() + 1)) {
    a.push(`${MuiFormatDate(new Date(d))}`)
  }
  return a
}

//sorting array of objects
export const compareString = (a, b) => {
  let comparison = 0

  if (a?.leaveStatus > b?.leaveStatus) {
    comparison = 1
  } else if (a?.leaveStatus < b?.leaveStatus) {
    comparison = -1
  }
  return comparison
}

export const getCurrentFiscalYear = () => {
  return new Date(new Date().getFullYear(), 0, 1)
}

export const momentRangeofDates = (startd, leaveDays) => {
  let Initdates = []
  let start = moment(startd)
  const endDate = moment(startd).add(Number(leaveDays), 'days')

  for (
    let InitialDate = start;
    InitialDate.isBefore(endDate);
    InitialDate.add(1, 'days')
  ) {
    Initdates = [...Initdates, moment(InitialDate)]
  }
  return Initdates
}

export const getRangeofDates = (startDate, leaveDays) => {
  let newDate = new Date(startDate)
  let endDate = new Date(newDate)
  endDate.setDate(newDate.getDate() + parseInt(leaveDays))
  let ArrayofDates = []

  let currentDate = new Date(newDate)

  while (currentDate < endDate) {
    ArrayofDates.push(`${MuiFormatDate(new Date(currentDate))}T00:00:00Z`)
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return ArrayofDates
}

export const convertMsToDay = (num) => num / (1000 * 60 * 60 * 24)

export const timeToMilisecond = (date) => {
  const dateArr = date.split(':')
  const milisecond =
    dateArr[0] * 60 * 60 * 1000 + dateArr[1] * 60 * 1000 + dateArr[2] * 1000
  return milisecond
}

export const subtractHourTime = ({
  userOfficeTime,
  lateArrivalThreshold,
  userPunchIn,
}) => {
  const officeTime = moment(userOfficeTime).format('LTS')
  const punchInTime = moment(userPunchIn).format('LTS')
  const timeInMilliSeconds =
    timeToMilisecond(punchInTime) - timeToMilisecond(officeTime)
  const lateTime = convertMsToHM(timeInMilliSeconds)
  return {lateTime, timeInMilliSeconds}
}

//sort function with date and created at
export const sortTableDatas = (order, column, field) => {
  return order === undefined || column === undefined
    ? '-logDate,-createdAt'
    : order === 'ascend'
    ? field === 'logDate'
      ? `${field},createdAt`
      : field
    : field === 'logDate'
    ? `-${field},-createdAt`
    : `-${field}`
}

export const getAllDatesInBetween = (startDate, endDate) => {
  const allDatesInTheInterval = []

  while (startDate <= endDate) {
    allDatesInTheInterval.push(new Date(startDate))
    startDate.setDate(startDate.getDate() + 1)
  }

  return allDatesInTheInterval
}

export const MmDdYyyyValidator = (date) => {
  // Validates that the input string is a valid date formatted as "mm/dd/yyyy"

  const dateString = date.replace(/(\r\n|\n|\r)/gm, '') // replacing line breaks
  // First check for the pattern
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) return false

  // Parse the date parts to integers
  var parts = dateString.split('/')
  var day = parseInt(parts[1], 10)
  var month = parseInt(parts[0], 10)
  var year = parseInt(parts[2], 10)

  // Check the ranges of month and year
  if (month === 0 || month > 12) return false

  var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  // Adjust for leap years
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
    monthLength[1] = 29
  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1]
}
