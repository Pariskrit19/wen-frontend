import {BASE_API_PATH} from 'helpers/api'

// Users
const BASE_API_PATH_USERS = `${BASE_API_PATH}users`
const BASE_API_PATH_ROLES = `${BASE_API_PATH_USERS}/roles`
const BASE_API_PATH_POSITIONS = `${BASE_API_PATH_USERS}/positions`
const BASE_API_PATH_POSITION_TYPES = `${BASE_API_PATH_USERS}/positionTypes`
const BASE_API_PATH_UPDATE_PROFILE = `${BASE_API_PATH_USERS}/updateMe`

// TimeLogs
const BASE_API_PATH_TIMELOGS = `${BASE_API_PATH}timelogs`

// Projects
const BASE_API_PATH_PROJECTS = `${BASE_API_PATH}projects`
const BASE_API_PATH_PROJECTS_TAGS = `${BASE_API_PATH_PROJECTS}/tags`

// Leaves
const BASE_API_PATH_LEAVES = `${BASE_API_PATH}leaves`

// Resources
const BASE_API_PATH_RESOURCES = `${BASE_API_PATH}resources`

// NoticeBoard
const BASE_API_PATH_NOTICEBOARD = `${BASE_API_PATH}notices`

// Blog
const BASE_API_PATH_BLOG = `${BASE_API_PATH}blogs`

// Attendances
const BASE_API_PATH_ATTENDENTS = `${BASE_API_PATH}attendances`

// User SignUp
const BASE_API_PATH_SIGN_UP = `${BASE_API_PATH_USERS}/signup`

// Email
const BASE_API_PATH_EMAIL = `${BASE_API_PATH}emails`

// Activity Logs
const BASE_API_PATH_ACTIVITY_LOGS = `${BASE_API_PATH}activitylogs`

// Notification
const BASE_API_PATH_NOTIFICATION = `${BASE_API_PATH}notifications`

//Maintenance
const BASE_API_PATH_CONFIGURATIONS = `${BASE_API_PATH}configurations`

export const Apis = {
  // Users
  Users: `${BASE_API_PATH_USERS}`,
  Roles: `${BASE_API_PATH_ROLES}`,
  Positions: `${BASE_API_PATH_POSITIONS}`,
  PositionTypes: `${BASE_API_PATH_POSITION_TYPES}`,
  Profile: `${BASE_API_PATH_UPDATE_PROFILE}`,

  // TimeLogs
  TimeLogs: `${BASE_API_PATH_TIMELOGS}`,

  // Projects
  Projects: `${BASE_API_PATH_PROJECTS}`,
  ProjectTags: `${BASE_API_PATH_PROJECTS_TAGS}`,

  // Leaves
  Leaves: `${BASE_API_PATH_LEAVES}`,

  // Resources
  Resources: `${BASE_API_PATH_RESOURCES}`,

  // Noticeboard
  NoticeBoard: `${BASE_API_PATH_NOTICEBOARD}`,

  // Blog
  Blog: `${BASE_API_PATH_BLOG}`,

  // Attendances
  Attendances: `${BASE_API_PATH_ATTENDENTS}`,

  // Sign up
  Signup: `${BASE_API_PATH_SIGN_UP}`,

  // Email
  Email: `${BASE_API_PATH_EMAIL}`,

  // Activity Logs
  ActivityLogs: `${BASE_API_PATH_ACTIVITY_LOGS}`,

  // Notification
  Notification: `${BASE_API_PATH_NOTIFICATION}`,

  //Configurations
  Configurations: `${BASE_API_PATH_CONFIGURATIONS}`,
}
