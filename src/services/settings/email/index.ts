import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'
import {decrypt, EMAIL_KEY} from 'util/crypto'

export const getEmails = async ({page = '', limit = ''}) => {
  try {
    let response = await API.get(`${Apis.Email}?page=${page}&limit=${limit}`)
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, EMAIL_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const addEmail = async (payload: {
  title: string
  body: string
  module: string
}) => {
  try {
    let response = await API.post(`${Apis.Email}`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const editEmail = async (payload: {email: any; id: string}) => {
  try {
    let response = await API.patch(
      `${Apis.Email}/${payload?.id}`,
      payload?.email
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const deleteEmail = async (payload: {id: string}) => {
  try {
    let response = await API.delete(`${Apis.Email}/${payload.id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
