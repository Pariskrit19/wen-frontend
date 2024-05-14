import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'

export const addPosition = async (payload: {name: string}) => {
  try {
    let response = await API.post(`${Apis.Users}/positions`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const editPosition = async (payload: {name: string; id: string}) => {
  try {
    let response = await API.patch(
      `${Apis.Users}/positions/${payload?.id}`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const deletePosition = async (payload: {id: string}) => {
  try {
    let response = await API.delete(`${Apis.Users}/positions/${payload.id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
