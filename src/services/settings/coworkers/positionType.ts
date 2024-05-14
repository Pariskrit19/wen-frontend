import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'

export const addPositionTypes = async (payload: {name: string}) => {
  try {
    let response = await API.post(`${Apis.Users}/positionTypes`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const editPositionType = async (payload: {name: string; id: string}) => {
  try {
    let response = await API.patch(
      `${Apis.Users}/positionTypes/${payload?.id}`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const deletePositionTypes = async (payload: {id: string}) => {
  try {
    let response = await API.delete(`${Apis.Users}/positionTypes/${payload.id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
