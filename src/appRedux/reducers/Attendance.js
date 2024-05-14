import {
  GET_USER_ATTENDANCE,
  GET_USER_ATTENDANCE_ERROR,
  PUNCH_IN,
  PUNCH_OUT,
} from 'constants/ActionTypes'

const INIT_STATE = {
  latestAttendance: [],
  punchIn: true,
  error: false,
}

const Attendance = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_USER_ATTENDANCE:
      return {...state, latestAttendance: action.payload}

    case GET_USER_ATTENDANCE_ERROR:
      return {...state, error: true}

    case PUNCH_IN:
      return {...state, punchIn: true}

    case PUNCH_OUT:
      return {...state, punchIn: false}

    default:
      return state
  }
}

export default Attendance
