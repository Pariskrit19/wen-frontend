import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux'
import Settings from './Settings'
import Auth from './Auth'
import Common from './Common'
import Attendance from './Attendance'
import Configurations from './Configuration'

const reducers = combineReducers({
  routing: routerReducer,
  settings: Settings,
  auth: Auth,
  common: Common,
  attendance: Attendance,
  configurations: Configurations,
})

export default reducers
