import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'

export const getLogtypes = async () => {
  try {
    let response = await API.get(`${Apis.TimeLogs}/types`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const addLogType = async (payload: {name: string, color:string}) => {
  try {
    let response = await API.post(`${Apis.TimeLogs}/types`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const editLogType = async (payload: {name: string; id: string, color: string}) => {
  try {
    let response = await API.patch(
      `${Apis.TimeLogs}/types/${payload?.id}`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const deleteLogType = async (payload: {id: string}) => {
  try {
    let response = await API.delete(`${Apis.TimeLogs}/types/${payload.id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
