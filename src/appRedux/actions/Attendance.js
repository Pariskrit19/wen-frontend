import {
  GET_USER_ATTENDANCE,
  GET_USER_ATTENDANCE_ERROR,
} from 'constants/ActionTypes'
import moment from 'moment'
import {searchAttendacentOfUser} from 'services/attendances'

export const fetchLoggedInUserAttendance = (userId) => async (dispatch) => {
  try {
    const response = await searchAttendacentOfUser({
      page: 1,
      limit: 1,
      userId: userId,
      fromDate: moment.utc(moment().startOf('day')).format(),
      toDate: moment.utc(moment().endOf('day')).format(),
    })
    if (response.status) {
      dispatch({
        type: GET_USER_ATTENDANCE,
        payload: response.data?.data?.attendances?.[0]?.data?.[0]?.data,
      })
    } else {
      dispatch({type: GET_USER_ATTENDANCE_ERROR})
    }
  } catch (error) {
    dispatch({type: GET_USER_ATTENDANCE_ERROR})
  }
}
