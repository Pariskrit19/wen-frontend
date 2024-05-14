import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'

export const getLeaveQuarter = async (year: any = '') => {
  try {
    let response = await API.get(
      `${Apis.Leaves}/quarters?sort=-createdAt&limit=1${
        year ? `&fiscalYear=${year}-01-01T00:00:00.000Z` : ''
      }`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const addLeaveQuarter = async (payload: any) => {
  try {
    let response = await API.post(`${Apis.Leaves}/quarters`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const editLeaveQuarter = async (payload: {
  leaveQuarters: any
  id: string
}) => {
  try {
    let response = await API.patch(
      `${Apis.Leaves}/quarters/${payload?.id}`,
      payload?.leaveQuarters
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const deleteLeaveQuarter = async (payload: {id: string}) => {
  try {
    let response = await API.delete(`${Apis.Leaves}/quarters/${payload.id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
