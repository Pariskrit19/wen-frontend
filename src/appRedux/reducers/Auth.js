import {
  UPDATE_USER_PROFILE,
  HIDE_MESSAGE,
  INIT_URL,
  ON_HIDE_LOADER,
  ON_SHOW_LOADER,
  ON_SWITCHED_USER,
  ON_SWITCH_USER,
  SHOW_MESSAGE,
  SIGNIN_USER_SUCCESS,
  SIGNOUT_USER_SUCCESS,
  SIGNUP_USER_SUCCESS,
  UPDATE_JOIN_DATE,
  UPDATE_PERMISSION_ROLE,
  PROFILE_LOADING_SUCCESS,
  PROFILE_LOADING_FAIL,
} from 'constants/ActionTypes'

const INIT_STATE = {
  showLoader: false,
  switchingUser: false,
  alertMessage: '',
  showMessage: false,
  initURL: '',
  authUser: null,
  profileLoading: true,
  profileLoadingFail: false,
}

const reducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case SIGNUP_USER_SUCCESS: {
      return {
        ...state,
        showLoader: false,
        authUser: action.payload,
      }
    }
    case SIGNIN_USER_SUCCESS: {
      return {
        ...state,
        showLoader: false,
        authUser: action.payload,
        profileLoading: false,
      }
    }
    case INIT_URL: {
      return {
        ...state,
        initURL: action.payload,
      }
    }
    case SIGNOUT_USER_SUCCESS: {
      return {
        ...state,
        authUser: null,
        initURL: '/',
        showLoader: false,
      }
    }

    case SHOW_MESSAGE: {
      return {
        ...state,
        alertMessage: action.payload,
        showMessage: true,
        showLoader: false,
      }
    }
    case HIDE_MESSAGE: {
      return {
        ...state,
        alertMessage: '',
        showMessage: false,
        showLoader: false,
      }
    }

    case ON_SHOW_LOADER: {
      return {
        ...state,
        showLoader: true,
      }
    }
    case ON_HIDE_LOADER: {
      return {
        ...state,
        showLoader: false,
      }
    }
    case ON_SWITCH_USER: {
      return {
        ...state,
        switchingUser: true,
      }
    }
    case ON_SWITCHED_USER: {
      return {
        ...state,
        switchingUser: false,
      }
    }

    case UPDATE_USER_PROFILE:
      return {
        ...state,
        authUser: {
          ...state.authUser,
          user: {...action.payload.user},
        },
      }

    case PROFILE_LOADING_SUCCESS:
      return {
        ...state,
        profileLoadingFail: false,
        profileLoading: false,
      }

    case PROFILE_LOADING_FAIL:
      return {
        ...state,
        profileLoading: false,
        profileLoadingFail: true,
      }

    case UPDATE_JOIN_DATE:
      return {
        ...state,
        authUser: {
          ...state.authUser,
          user: {
            ...state.authUser.user,
            joinDate: action.payload,
          },
        },
      }

    case UPDATE_PERMISSION_ROLE:
      return {
        ...state,
        authUser: {
          ...state.authUser,
          user: {
            ...state.authUser.user,
            role: {...state.authUser.user.role, permission: action.payload},
          },
        },
      }

    default:
      return state
  }
}

export const selectAuthUser = (state) => {
  return state?.auth?.authUser?.user ?? {role: {key: null}}
}

export default reducer
