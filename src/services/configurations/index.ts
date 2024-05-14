import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'
import {CONFIGURATION_KEY, decrypt} from 'util/crypto'

export const updateMaintenance = async (payload: any) => {
  try {
    let response = await API.patch(`${Apis.Configurations}/update`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
export const getMaintenance = async () => {
  try {
    let response = await API.get(`${Apis.Configurations}`)
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, CONFIGURATION_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
