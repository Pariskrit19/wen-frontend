export const app = '/wenapp'

export const SIGNIN = 'signin'
export const SIGNUP = 'signup'
export const FORGOT_PASSWORD = 'forget-password'
export const RESET_PASSWORD = '/users/resetPassword/:token'

// Sidebar
export const DASHBOARD = 'dashboard'
export const COWORKERS = 'coworkers'
export const PROJECTS = 'projects'
export const ATTENDANCE = 'attendance'
export const LOGTIME = 'logtime'
export const LEAVE = 'leave'
export const NOTICEBOARD = 'noticeboard'
export const BLOG = 'blog'
export const SETTINGS = 'settings'
export const REPORTS = 'reports'
export const RESOURCES = 'resources'
export const OVERVIEW = 'todays-overview'

// Project Log page
export const PROJECT_LOG = `${PROJECTS}/:slug`

//logtime
export const USER_TIME_LOG = 'all-work-logs'
export const OTHER_TIME_LOG = 'other-logtime'

export const ALL_TIME_LOG = `${LOGTIME}/${USER_TIME_LOG}`

// User
export const PROFILE = 'profile'
export const INVITE = 'users/signup/:token'

// Reports
export const WEEKLY_REPORT = `weekly-report`
export const WORK_LOG_REPORT = `work-log-report`
export const LEAVE_REPORT = `leave-report`
export const ACTIVITY_LOGS = `activity-logs`
export const SALARY_REVIEW = 'salary-review'
export const OVERTIME_REPORT = 'overtime-report'

// Resources
export const FAQS = `faq`
export const POLICY = 'policy'
export const CALENDAR = 'calendar'
export const HOLIDAY = 'holiday'

// Blog
export const BLOGS = ''
export const BLOGDETAIL = ':blog'
export const ADDBLOG = 'add-blog'
export const EDITBLOG = 'edit-blog/:blogId'

// Maintenance Mode
export const MAINTAINANCE_MODE = 'maintenance'
