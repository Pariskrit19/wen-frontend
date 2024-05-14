import {
  UPDATE_USER_PROFILE,
  HIDE_MESSAGE,
  INIT_URL,
  ON_HIDE_LOADER,
  ON_SHOW_LOADER,
  ON_SWITCHED_USER,
  ON_SWITCH_USER,
  SHOW_MESSAGE,
  SIGNIN_USER,
  SIGNIN_USER_SUCCESS,
  SIGNOUT_USER,
  SIGNOUT_USER_SUCCESS,
  SIGNUP_USER,
  SIGNUP_USER_SUCCESS,
  PROFILE_LOADING_SUCCESS,
  UPDATE_JOIN_DATE,
  UPDATE_PERMISSION_ROLE,
  PROFILE_LOADING_FAIL,
} from 'constants/ActionTypes'
import {LOCALSTORAGE_USER} from 'constants/Settings'
import {getMyProfile} from 'services/users/userDetails'
import {decrypt, USERS_KEY} from 'util/crypto'

export const userSignUp = (user) => {
  return {
    type: SIGNUP_USER,
    payload: user,
  }
}
export const userSignIn = (user) => {
  return {
    type: SIGNIN_USER,
    payload: user,
  }
}
export const userSignOut = () => {
  return {
    type: SIGNOUT_USER,
  }
}
export const userSignUpSuccess = (authUser) => {
  return {
    type: SIGNUP_USER_SUCCESS,
    payload: authUser,
  }
}

export const userSignInSuccess = (authUser) => {
  return {
    type: SIGNIN_USER_SUCCESS,
    payload: authUser,
  }
}
export const userSignOutSuccess = () => {
  return {
    type: SIGNOUT_USER_SUCCESS,
  }
}

export const showAuthMessage = (message) => {
  return {
    type: SHOW_MESSAGE,
    payload: message,
  }
}

export const setInitUrl = (url) => {
  return {
    type: INIT_URL,
    payload: url,
  }
}

export const showAuthLoader = () => {
  return {
    type: ON_SHOW_LOADER,
  }
}

export const hideMessage = () => {
  return {
    type: HIDE_MESSAGE,
  }
}
export const hideAuthLoader = () => {
  return {
    type: ON_HIDE_LOADER,
  }
}

export const switchUser = () => {
  return {
    type: ON_SWITCH_USER,
  }
}
export const switchedUser = () => {
  return {
    type: ON_SWITCHED_USER,
  }
}
export const getUserProfile = (userData) => {
  const data = JSON.parse(userData?.user?.role?.permission || '[{}]')
  return {
    type: UPDATE_USER_PROFILE,
    payload: {
      user: {
        ...userData.user,
        role: {...userData?.user?.role, permission: data?.[0]},
      },
    },
  }
}

export const updateJoinDate = (joinDate) => {
  return {
    type: UPDATE_JOIN_DATE,
    payload: joinDate,
  }
}

export const updateRolePermission = (payload) => {
  const updatedRolePermission = JSON.parse(payload || '[{}]')
  return {
    type: UPDATE_PERMISSION_ROLE,
    payload: updatedRolePermission?.[0],
  }
}
export function getProfile(userId) {
  return async (dispatch) => {
    try {
      const encrypted = await getMyProfile(userId)

      const decryptedData = decrypt(encrypted?.data?.data, USERS_KEY)
      dispatch(
        getUserProfile({
          user: decryptedData?.data?.[0],
        })
      )

      decryptedData?.data[0]?._id &&
        localStorage.setItem(
          LOCALSTORAGE_USER,
          JSON.stringify(decryptedData?.data[0]?._id)
        )

      dispatch({type: PROFILE_LOADING_SUCCESS})
    } catch (error) {
      dispatch({type: PROFILE_LOADING_FAIL})
      const admin = JSON.parse(localStorage.getItem('admin')) || null

      admin && localStorage.setItem(LOCALSTORAGE_USER, JSON.stringify(admin))
      localStorage.removeItem('admin')
    } finally {
      dispatch(switchedUser())
    }
  }
}
