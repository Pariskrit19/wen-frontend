import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'
import {
  decrypt,
  LOG_KEY,
  LOG_TYPE_KEY,
  WEEKLY_REPORT_KEY,
  WORK_LOG_REPORT_KEY,
} from 'util/crypto'

const getAllTimeLogs = async ({
  page = '',
  sort = '',
  limit = '',
  fields = '',
  project = '',
  user = '',
  logType = '',
  isOt = '',
  otStatus = '',
  fromDate = '',
  toDate = '',
}) => {
  try {
    let response = await API.get(
      `${
        Apis.TimeLogs
      }?page=${page}&sort=${sort}&limit=${limit}&fields=${fields}&project=${project}&user=${user}&logType=${logType}&otStatus=${otStatus}&isOt=${isOt}${
        fromDate && toDate && `&logDate[gte]=${fromDate}&logDate[lte]=${toDate}`
      }`
    )
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, LOG_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}
const getTotalLogHoursOfAProject = async (
  project = '',
  user = '',
  logType = '',
  notSelectedIds = [],
  selectedIds = [],
  isSelectAll = false
) => {
  try {
    let response = await API.post(
      `${Apis.TimeLogs}/totalhours?project=${project}&user=${user}&logType=${logType}`,
      {
        notSelectedIds,
        selectedIds,
        isSelectAll,
      }
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}
const getLogTypes = async () => {
  try {
    let response = await API.get(`${Apis.TimeLogs}/types?sort=name`)
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, LOG_TYPE_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const addLogTime = async (payload) => {
  try {
    let response = await API.post(
      `${Apis.Projects}/${payload.id}/timelogs`,
      payload.details
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getWeeklyTimeLogSummary = async (userId) => {
  try {
    let response = await API.get(
      `${Apis.TimeLogs}/users/weeklytime?userId=${userId}`
    )
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, LOG_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getTodayTimeLogSummary = async (userId) => {
  try {
    let response = await API.get(
      `${Apis.TimeLogs}/users/todaytime?userId=${userId}`
    )
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, LOG_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getOtherWeeklyTimeLogSummary = async () => {
  try {
    let response = await API.get(`${Apis.TimeLogs}/other/weeklytime`)
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, LOG_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getOtherTodayTimeLogSummary = async () => {
  try {
    let response = await API.get(`${Apis.TimeLogs}/other/todaytime`)
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, LOG_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getOtherTimeLogTotal = async ({
  user = '',
  logType = '',
  otStatus = '',
  fromDate = '',
  toDate = '',
  project = '',
}) => {
  try {
    let response = await API.get(
      `${
        Apis.TimeLogs
      }/other/totalhour?project=${project}&user=${user}&logType=${logType}&otStatus=${otStatus}${
        fromDate && toDate && `&logDate[gte]=${fromDate}&logDate[lte]=${toDate}`
      }`
    )
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, LOG_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const deleteTimeLog = async (logId) => {
  try {
    let response = await API.delete(`${Apis.TimeLogs}/${logId}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const updateTimeLog = async (payload) => {
  try {
    let response = await API.patch(
      `${Apis.TimeLogs}/${payload.id}`,
      payload.details
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const addUserTimeLog = async (payload) => {
  try {
    let response = await API.post(`${Apis.TimeLogs}`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getWeeklyReport = async ({
  fromDate = '',
  toDate = '',
  logType = '',
  projectStatus = '',
  client = '',
  project = '',
}) => {
  try {
    let response = await API.post(
      `${Apis.TimeLogs}/weeklyreport/?fromDate=${fromDate}&toDate=${toDate}&logType=${logType}&projectStatus=${projectStatus}&client=${client}&project=${project}`
    )
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, WEEKLY_REPORT_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getTimeLogChart = async ({project = '', logType = ''}) => {
  try {
    let response = await API.post(
      `${Apis.TimeLogs}/chart?project=${project}&logType=${logType}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getWeeklyTimeLogs = async ({
  page = '',
  sort = '',
  limit = '',
  fields = '',
  project = '',
  user = '',
  logType = '',
}) => {
  try {
    let response = await API.get(
      `${Apis.TimeLogs}/users/weeklyLogs?page=${page}&sort=${sort}&limit=${limit}&fields=${fields}&project=${project}&user=${user}&logType=${logType}`
    )
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, LOG_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getWorkLogReport = async ({
  project = '',
  user = '',
  logType = '',
  fromDate = '',
  toDate = '',
}) => {
  try {
    let response = await API.post(
      `${Apis.TimeLogs}/worklogs?project=${project}&user=${user}&logType=${logType}&fromDate=${fromDate}&toDate=${toDate}`
    )
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, WORK_LOG_REPORT_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const WeeklyProjectTimeLogSummary = async (projectId) => {
  try {
    let response = await API.get(
      `${Apis.TimeLogs}/users/weeklytimeproject/?projectId=${projectId}`
    )
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, LOG_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getTimelogAuthors = async (projectId) => {
  try {
    let response = await API.get(
      `${Apis.TimeLogs}/authors/?project=${projectId}`
    )
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, LOG_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

export {
  getAllTimeLogs,
  getLogTypes,
  deleteTimeLog,
  getWeeklyTimeLogSummary,
  getTodayTimeLogSummary,
  addLogTime,
  updateTimeLog,
  addUserTimeLog,
  getWeeklyReport,
  getTimeLogChart,
  getWeeklyTimeLogs,
  getWorkLogReport,
  WeeklyProjectTimeLogSummary,
  getOtherTodayTimeLogSummary,
  getOtherWeeklyTimeLogSummary,
  getOtherTimeLogTotal,
  getTimelogAuthors,
  getTotalLogHoursOfAProject,
}
