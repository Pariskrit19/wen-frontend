import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'

export const getLeaveTypes = async () => {
  try {
    let response = await API.get(`${Apis.Leaves}/types?sort=name`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const addLeaveType = async (payload: {name: string}) => {
  try {
    let response = await API.post(`${Apis.Leaves}/types`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const editLeaveType = async (payload: {
  leave: {name: string; leaveDays: string}
  id: string
}) => {
  try {
    let response = await API.patch(
      `${Apis.Leaves}/types/${payload?.id}`,
      payload?.leave
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const deleteLeaveType = async (payload: {id: string}) => {
  try {
    let response = await API.delete(`${Apis.Leaves}/types/${payload.id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
