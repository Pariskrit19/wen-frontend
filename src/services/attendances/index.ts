import axios from 'axios'
import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'
import {ATTENDANCE_KEY, decrypt} from 'util/crypto'

const getAllAttendances = async ({
  page = '',
  sort = '',
  limit = '',
  fields = '',
  userId = '',
  fromDate = '',
  toDate = '',
}) => {
  try {
    let response = await API.get(
      `${Apis.Attendances}?page=${page}&sort=${sort}&limit=${limit}&fields=${fields}&user=${userId}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getAttendance = async (attendanceId: any) => {
  try {
    let response = await API.get(`${Apis.Attendances}/${attendanceId}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const addAttendance = async (attendance: any) => {
  try {
    let response = await API.post(`${Apis.Attendances}`, attendance)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const updateAttendance = async (id: any, attendance: any) => {
  try {
    let response = await API.patch(`${Apis.Attendances}/${id}`, attendance)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const deleteAttendance = async (id: any) => {
  try {
    let response = await API.delete(`${Apis.Attendances}/${id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const updatePunchout = async (userId: any, payload: any) => {
  try {
    let response = await API.patch(
      `${Apis.Attendances}/${userId}/punchout`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const addUserAttendance = async (userId: any, payload: any) => {
  try {
    let response = await API.post(
      `${Apis.Users}/${userId}/attendances`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getAttendacentOfUser = async (userId: any) => {
  try {
    let response = await API.get(`${Apis.Attendances}?user=${userId}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const searchAttendacentOfUser = async ({
  userId = '',
  fromDate = '',
  toDate = '',
  page = '',
  sort = '',
  limit = '',
  fields = '',
  officehourop = '',
  officehourValue = '',
}: {
  userId?: any
  fromDate?: any
  toDate?: any
  page?: number | any
  sort?: any
  limit?: number | any
  fields?: any
  officehourop?: any
  officehourValue?: any
}) => {
  try {
    let response
    if (officehourop && officehourValue >= 0) {
      response = await API.get(
        `${Apis.Attendances}/search?user=${userId}&fromDate=${fromDate}&toDate=${toDate}&page=${page}&sort=${sort}&limit=${limit}&fields=${fields}&officehour[${officehourop}]=${officehourValue}`
      )
    } else {
      response = await API.get(
        `${Apis.Attendances}/search?user=${userId}&fromDate=${fromDate}&toDate=${toDate}&page=${page}&sort=${sort}&limit=${limit}&fields=${fields}`
      )
    }

    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, ATTENDANCE_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const UserTotalofficehour = async ({
  userId = '',
  fromDate = '',
  toDate = '',
  officehourop = '',
  officehourValue = '',
}: {
  userId?: any
  fromDate?: any
  toDate?: any
  officehourop?: any
  officehourValue?: number | string
}) => {
  try {
    let response = await API.get(
      `${
        Apis.Attendances
      }/totalofficehour?user=${userId}&fromDate=${fromDate}&toDate=${toDate}${
        officehourop &&
        officehourValue >= 0 &&
        `&officehour[${officehourop}]=${officehourValue}`
      }`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const searchLateAttendacentOfUser = async ({
  userId = '',
  fromDate = '',
  toDate = '',
  page = '',
  sort = '',
  limit = '',
  fields = '',
  lateArrivalLeaveCut = '',
}) => {
  try {
    let response = await API.get(
      `${Apis.Attendances}/lateArrival?user=${userId}&fromDate=${fromDate}&toDate=${toDate}&page=${page}&sort=${sort}&limit=${limit}&fields=${fields}&lateArrivalLeaveCut=${lateArrivalLeaveCut}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const updatePunchReqestCount = async (userId: any) => {
  try {
    let response = await API.patch(
      `${Apis.Attendances}/${userId}/updatepunchinrequestcount`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getTodaysUserAttendanceCount = async (userId: any) => {
  try {
    let response = await API.get(`${Apis.Attendances}/today/count`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const updateLateAttendance = async (attendance: any) => {
  try {
    let response = await API.post(
      `${Apis.Attendances}/updateLateAttendace`,
      attendance
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getIpAddres = async () => {
  try {
    let response = await axios.get(
      'https://geolocation-db.com/json/187c4d90-701f-11ed-8f13-95359090f479'
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export {
  getAllAttendances,
  UserTotalofficehour,
  getAttendance,
  deleteAttendance,
  addAttendance,
  updateAttendance,
  addUserAttendance,
  updatePunchout,
  getAttendacentOfUser,
  searchAttendacentOfUser,
  updatePunchReqestCount,
  getTodaysUserAttendanceCount,
  searchLateAttendacentOfUser,
  updateLateAttendance,
  getIpAddres,
}
