import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'
import {decrypt, USER_INVITE_KEY} from 'util/crypto'

export const inviteUsers = async (payload: {email: string}) => {
  try {
    let response = await API.post(`${Apis.Users}/invite`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const getInvitedUsers = async () => {
  try {
    let response = await API.get(`${Apis.Users}/invite`)
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, USER_INVITE_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
