import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'

export const addRole = async (payload: {value: string; key: string}) => {
  try {
    let response = await API.post(`${Apis.Users}/roles`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
export const updateRole = async (payload: {value: string; id: string}) => {
  try {
    let response = await API.patch(
      `${Apis.Users}/roles/${payload?.id}`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const deleteRole = async (payload: {id: string}) => {
  try {
    let response = await API.delete(`${Apis.Users}/roles/${payload.id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
