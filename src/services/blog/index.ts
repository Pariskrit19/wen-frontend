import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'

const getAllBlogs = async ({
  page = '',
  sort = '',
  limit = '',
  fields = '',
  createdBy = '',
  search = '',
}) => {
  try {
    let response = await API.get(
      `${Apis.Blog}?page=${page}&sort=${sort}&limit=${limit}&fields=${fields}&search=${search}&createdBy=${createdBy}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getBlog = async (BlogId: number | string) => {
  try {
    let response = await API.get(`${Apis.Blog}/${BlogId}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const addBlog = async (Blog: any) => {
  try {
    let response = await API.post(`${Apis.Blog}`, Blog)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const updateBlog = async (id: number | string, Blog: any) => {
  try {
    let response = await API.patch(`${Apis.Blog}/${id}`, Blog)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const deleteBlog = async (BlogId: number | string) => {
  try {
    let response = await API.delete(`${Apis.Blog}/${BlogId}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export {getAllBlogs, getBlog, deleteBlog, addBlog, updateBlog}
