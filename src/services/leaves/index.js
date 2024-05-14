import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'

const getLeaveDaysOfAllUsers = async (fromDate, toDate, quarter) => {
  try {
    let response = await API.get(
      `${Apis.Leaves}/users/leavedays?fromDate=${fromDate}&toDate=${toDate}&quarter=${quarter}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getTakenAndRemainingLeaveDaysOfUser = async (id) => {
  try {
    let response = await API.get(`${Apis.Leaves}/${id}/leavedays`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getQuarterTakenAndRemainingLeaveDaysOfUser = async (id) => {
  try {
    let response = await API.get(`${Apis.Leaves}/${id}/quarterleavedays`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getLeavesOfAllUsers = async (
  status = '',
  user = '',
  date = '',
  page = '',
  limit = '',
  sort = '-leaveDates',
  type = '',
  fromDate = '',
  toDate = '',
  halfDay = undefined
) => {
  try {
    let response = await API.get(
      `${
        Apis.Leaves
      }?leaveStatus=${status}&sort=${sort}&user=${user}&leaveDates=${date}&page=${page}&limit=${limit}&leaveType=${type}&fromDate=${fromDate}&toDate=${toDate}${
        halfDay === undefined ? '' : `&halfDay=${halfDay}`
      }`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getLeavesOfUser = async (
  id,
  status = '',
  date,
  page = 1,
  limit = 30,
  fromDate = '',
  toDate = '',
  sort = '-leaveDates,_id',
  type = ''
) => {
  try {
    let response = await API.get(
      `${
        Apis.Leaves
      }?user=${id}&page=${page}&sort=${sort}&limit=${limit}&leaveStatus=${status}&leaveDates=${
        date ?? ''
      }&fromDate=${fromDate}&toDate=${toDate}&leaveType=${type}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getLeaveTypes = async (id) => {
  try {
    let response = await API.get(`${Apis.Leaves}/types`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const changeLeaveStatus = async (
  id,
  statusType,
  reason = '',
  reapplyreason = '',
  leaveStatus = ''
) => {
  try {
    let response = await API.patch(
      `${Apis.Leaves}/${id}/status/${statusType}`,
      {reason, reapplyreason, leaveStatus}
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const createLeave = async (payload) => {
  try {
    let response = await API.post(`${Apis.Leaves}`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const createLeaveOfUser = async (payload) => {
  try {
    let response = await API.post(
      `${Apis.Users}/${payload.id}/leaves`,
      payload.data
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const updateLeave = async (payload) => {
  try {
    let response = await API.patch(`${Apis.Leaves}/${payload.id}`, payload.data)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getPendingLeavesCount = async () => {
  try {
    let response = await API.get(`${Apis.Leaves}/pending/count`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getTodaysUserLeaveCount = async () => {
  try {
    let response = await API.get(`${Apis.Leaves}/users/today/count`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getFiscalYearLeaves = async () => {
  try {
    let response = await API.get(`${Apis.Leaves}/users/fiscalYearLeaves`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getFutureLeaves = async () => {
  try {
    let response = await API.get(`${Apis.Leaves}/users/futureLeaves`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
const getQuarters = async () => {
  try {
    let response = await API.get(
      `${Apis.Leaves}/quarters?sort=-createdAt&limit=1`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const sendEmailforLeave = async (payload) => {
  try {
    let response = await API.post(`${Apis.Leaves}/users/sendEmail`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getTodayLeaves = async () => {
  try {
    let response = await API.get(`${Apis.Leaves}/today`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getUserLeavesSummary = async ({
  userId = '',
  fiscalYear = '',
  quarterId = '',
}) => {
  try {
    let response = await API.get(
      `${Apis.Leaves}/userLeaves?userId=${userId}&fiscalYear=${fiscalYear}&quarterId=${quarterId}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

export {
  getLeaveDaysOfAllUsers,
  getLeavesOfUser,
  getLeavesOfAllUsers,
  getTakenAndRemainingLeaveDaysOfUser,
  getQuarterTakenAndRemainingLeaveDaysOfUser,
  getLeaveTypes,
  changeLeaveStatus,
  createLeave,
  createLeaveOfUser,
  updateLeave,
  getPendingLeavesCount,
  getTodaysUserLeaveCount,
  getFiscalYearLeaves,
  getFutureLeaves,
  getQuarters,
  sendEmailforLeave,
  getTodayLeaves,
  getUserLeavesSummary,
}
