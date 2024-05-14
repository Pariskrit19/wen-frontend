import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'

const getAllFaqs = async ({page = '', limit = ''}) => {
  try {
    let response = await API.get(
      `${Apis.Resources}/faqs?page=${page}&limit=${limit}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

export const addFaqs = async (payload) => {
  try {
    let response = await API.post(`${Apis.Resources}/faqs`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const editFaqs = async (payload) => {
  try {
    let response = await API.patch(
      `${Apis.Resources}/faqs/${payload?.id}`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const deleteFaqs = async (payload) => {
  try {
    let response = await API.delete(`${Apis.Resources}/faqs/${payload.id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getAllPolicies = async ({page = '', limit = ''}) => {
  try {
    let response = await API.get(
      `${Apis.Resources}/policies?page=${page}&limit=${limit}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

export const addPolicies = async (payload) => {
  try {
    let response = await API.post(`${Apis.Resources}/policies`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const editPolicies = async (payload) => {
  try {
    let response = await API.patch(
      `${Apis.Resources}/policies/${payload?.id}`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const deletePolicies = async (payload) => {
  try {
    let response = await API.delete(`${Apis.Resources}/policies/${payload.id}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

// Holidays
const getAllHolidays = async ({page = '', limit = '', sort = ''}) => {
  try {
    let response = await API.get(
      `${Apis.Resources}/holidays?page=${page}&limit=${limit}&sort=${sort}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const createHolidays = async (payload) => {
  try {
    let response = await API.post(`${Apis.Resources}/holidays`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const deleteHoliday = async (payload) => {
  try {
    let response = await API.delete(
      `${Apis.Resources}/holidays/remove/${payload.docId}/${payload.holidayId}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}
const updateHoliday = async (payload) => {
  try {
    let response = await API.patch(
      `${Apis.Resources}/holidays/${payload?.id}`,
      payload?.holidays
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

export {
  getAllFaqs,
  getAllPolicies,
  getAllHolidays,
  createHolidays,
  deleteHoliday,
  updateHoliday,
}
