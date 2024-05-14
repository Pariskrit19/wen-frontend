import {
  UPDATE_LATE_ARRIVAL_THRESHOLD,
  UPDATE_ALLOCATED_OFFICE_HOURS,
} from 'constants/ActionTypes'

export const getLateArrivalThreshold = (threshold) => {
  return {
    type: UPDATE_LATE_ARRIVAL_THRESHOLD,
    payload: threshold,
  }
}

export const getAllocatedOfficeHours = (threshold) => {
  return {
    type: UPDATE_ALLOCATED_OFFICE_HOURS,
    payload: threshold,
  }
}
