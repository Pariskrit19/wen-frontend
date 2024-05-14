import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'
import {
  decrypt,
  SALARY_REVIEW_KEY,
  USERS_KEY,
  USER_POSITION_KEY,
  USER_POSITION_TYPE_KEY,
  USER_ROLE_KEY,
} from 'util/crypto'

// login user api
const loginInUsers = async (loginDetail) => {
  try {
    let response = await API.post(`${Apis.Users}/login`, loginDetail)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

// logout user api
const logoutUser = async () => {
  try {
    let response = await API.get(`${Apis.Users}/logout`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}

const getAllUsers = async ({
  page = '',
  sort = 'name',
  limit = '',
  fields = '',
  name = '',
  role = '',
  position = '',
  positionType = '',
  active = 'true',
}) => {
  try {
    let response = await API.get(
      `${Apis.Users}?search=${name}&page=${page}&sort=${sort}&limit=${limit}&fields=${fields}&role=${role}&position=${position}&positionType=${positionType}&active=${active}`
    )
    return getAPIResponse({
      ...response,
      data: {...response?.data, data: decrypt(response?.data?.data, USERS_KEY)},
    })
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export const getBlogAuthors = async () => {
  try {
    let response = await API.get(`${Apis.Blog}/blog-authors`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getMyProfile = async (payload) => {
  try {
    let response = await API.get(`${Apis.Users}?_id=${payload}`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getUserRoles = async () => {
  try {
    let response = await API.get(`${Apis.Roles}?sort=value`)
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, USER_ROLE_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getUserPositionTypes = async () => {
  try {
    let response = await API.get(`${Apis.PositionTypes}?sort=name`)
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, USER_POSITION_TYPE_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getTeamLeads = async () => {
  try {
    let response = await API.get(
      `${Apis.Users}?role=62b1a1ac9220ea1d59ab385b&role=62b1907b31f49d10e7717078`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getUserPosition = async () => {
  try {
    let response = await API.get(`${Apis.Positions}?sort=name`)
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, USER_POSITION_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const updateProfile = async (payload) => {
  try {
    let response = await API.patch(`${Apis.Profile}`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const updateUser = async (userId, payload) => {
  try {
    let response = await API.patch(`${Apis.Users}/${userId}`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const disableUser = async (userId) => {
  try {
    let response = await API.post(`${Apis.Users}/${userId}/disable`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const importUsers = async (payload) => {
  try {
    let response = await API.post(`${Apis.Users}/import`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getActiveUsersCount = async () => {
  try {
    let response = await API.get(`${Apis.Users}/count`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getBirthMonthUsers = async () => {
  try {
    let response = await API.get(`${Apis.Users}/birthday`)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const getSalaryReviewUsers = async ({days, user}) => {
  try {
    let response = await API.get(
      `${Apis.Users}/salaryReview?user=${user}&days=${days}`
    )
    return getAPIResponse({
      ...response,
      data: {
        ...response?.data,
        data: decrypt(response?.data?.data, SALARY_REVIEW_KEY),
      },
    })
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const UpdateUserPassword = async (payload) => {
  try {
    let response = await API.patch(`${Apis.Users}/updateMyPassword`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const forgotPassword = async (payload) => {
  try {
    let response = await API.post(`${Apis.Users}/forgotPassword`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const resetPassword = async (token, payload) => {
  try {
    let response = await API.patch(
      `${Apis.Users}/resetPassword/${token}`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const resetAllocatedLeaves = async (payload) => {
  try {
    let response = await API.patch(
      `${Apis.Users}/resetAllocatedLeaves`,
      payload
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

const signUp = async (payload, token) => {
  try {
    let response = await API.post(`${Apis.Signup}/${token}`, payload)
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err?.response)
  }
}

export {
  signUp,
  loginInUsers,
  getAllUsers,
  getTeamLeads,
  logoutUser,
  getUserRoles,
  getUserPosition,
  getUserPositionTypes,
  updateProfile,
  updateUser,
  importUsers,
  getActiveUsersCount,
  getBirthMonthUsers,
  getSalaryReviewUsers,
  UpdateUserPassword,
  forgotPassword,
  resetPassword,
  resetAllocatedLeaves,
  disableUser,
  getMyProfile,
}
