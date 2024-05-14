import API from 'helpers/api'
import {getAPIResponse} from 'helpers/getApiResponse'
import {Apis} from 'services/api'

export const editAttendanceParams = async (payload: any) => {
  try {
    let response = await API.patch(
      `${Apis.Configurations}/update-latearrival-threshold`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
