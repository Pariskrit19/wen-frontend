import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'
import {decrypt, NOTICE_TYPE_KEY} from 'util/crypto'

export const getNoticeboardTypes = async () => {
  try {
    let response = await API.get(`${Apis.NoticeBoard}/types?sort=name`)
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, NOTICE_TYPE_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const addNoticeboardType = async (payload: {name: string}) => {
  try {
    let response = await API.post(`${Apis.NoticeBoard}/types`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const editNoticeboardType = async (payload: {
  name: string
  id: string
}) => {
  try {
    let response = await API.patch(
      `${Apis.NoticeBoard}/types/${payload?.id}`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const deleteNoticeboardType = async (payload: {id: string}) => {
  try {
    let response = await API.delete(`${Apis.NoticeBoard}/types/${payload.id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}
