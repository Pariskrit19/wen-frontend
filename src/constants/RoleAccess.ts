const RoleAccess = {
  Admin: 'admin',
  ProjectManager: 'manager',
  Editor: 'editor',
  Normal: 'normal',
  HumanResource: 'hr',
  Finance: 'finance',
  TeamLead: 'lead',
  Subscriber: 'subscriber',
  OfficeAdmin: 'officeadmin',
  All: 'all',
}

//Position
export const PositionType = {
  Intern: 'Intern',
}

export const EmployeeStatus = {
  Probation: 'Probation',
  Permanent: 'Permanent',
}

// Dashboard
export const DASHBOARD_PROJECT_LOG_NO_ACCESS = [
  RoleAccess.HumanResource,
  RoleAccess.Finance,
  RoleAccess.Subscriber,
  RoleAccess.OfficeAdmin,
]

export const DASHBOARD_CARD_CLICKABLE_ACCESS = [
  RoleAccess.Admin,
  RoleAccess.HumanResource,
  RoleAccess.OfficeAdmin,
]

export const SALARY_REVIEW_ACCESS = [RoleAccess.HumanResource, RoleAccess.Admin]

export const DASHBOARD_ICON_ACCESS = [
  RoleAccess.Admin,
  RoleAccess.TeamLead,
  RoleAccess.ProjectManager,
  RoleAccess.HumanResource,
]

export const DASHBOARD_PUNCH_IN_TODAY_CARD_ACCESS = [
  RoleAccess.Admin,
  RoleAccess.TeamLead,
  RoleAccess.ProjectManager,
  RoleAccess.HumanResource,
  RoleAccess.OfficeAdmin,
]

// Co-workers
export const CO_WORKERS_TABLE_ACTION_NO_ACCESS = [
  RoleAccess.ProjectManager,
  RoleAccess.Finance,
  RoleAccess.TeamLead,
  RoleAccess.OfficeAdmin,
]

export const CO_WORKERS_SEARCH_IMPORT_NO_ACCESS = [RoleAccess.Finance]

export const CO_WORKERS_RESET_ALLOCATEDLEAVES_NO_ACCESS = [
  RoleAccess.TeamLead,
  RoleAccess.ProjectManager,
  RoleAccess.OfficeAdmin,
]

// Projects
export const PROJECTS_ADD_NEW_NO_ACCESS = [RoleAccess.Normal]
export const PROJECTS_TABLE_ACTION_NO_ACCESS = [RoleAccess.Normal]
export const PROJECTS_TABLE_ACTION_DELETE_NO_ACCESS = [RoleAccess.Editor]

// Attendance
export const ATTENDANCE_ALL_TAB_NO_ACCESS = [
  RoleAccess.Editor,
  RoleAccess.Normal,
  RoleAccess.Subscriber,
]

export const ATTENDANCE_LATE_ARRIVAL_ADMIN_CALENDAR_NO_ACCESS = [
  RoleAccess.OfficeAdmin,
]

export const ATTENDANCE_CO_WORKER_ATTENDANCE_ADD_NO_ACCESS = [
  RoleAccess.ProjectManager,
  RoleAccess.TeamLead,
  RoleAccess.Finance,
]
export const ATTENDANCE_LATE_ATTENDANCE_CUT_LEAVE_NO_ACCESS = [
  RoleAccess.ProjectManager,
  RoleAccess.TeamLead,
  RoleAccess.Finance,
]

// LogTime
export const LOG_TIME_ADD_NO_ACCESS = [RoleAccess.TeamLead]
export const LOG_TIME_DELETE_NO_ACCESS = [
  RoleAccess.Editor,
  RoleAccess.Normal,
  RoleAccess.TeamLead,
]
export const LOG_TIME_OLD_EDIT = [RoleAccess.Admin, RoleAccess.ProjectManager]

// Leaves
export const LEAVE_TABS_NO_ACCESS = [
  RoleAccess.TeamLead,
  RoleAccess.Editor,
  RoleAccess.Normal,
  RoleAccess.Subscriber,
]

export const LEAVE_ADMIN_TAB_NO_ACCESS = [RoleAccess.OfficeAdmin]

export const LEAVES_TAB_ACTIONS_NO_ACCESS = [RoleAccess.ProjectManager]
export const LEAVE_TAB_ADD_LEAVE_NO_ACCESS = [RoleAccess.Finance]

export const LEAVE_TABLE_ACTION_NO_ACESS = [
  RoleAccess.ProjectManager,
  RoleAccess.Finance,
]

// Noticeboard
export const NOTICEBOARD_ACTION_NO_ACCESS = [
  RoleAccess.TeamLead,
  RoleAccess.Editor,
  RoleAccess.Normal,
  RoleAccess.Finance,
  RoleAccess.Subscriber,
]

// Blogs
export const BLOGS_ACTION_NO_ACCESS = [RoleAccess.Normal, RoleAccess.Subscriber]

// Reports
export const WEEKLY_REPORT_ACCESS = [RoleAccess.Admin]
export const WORK_LOG_REPORT_ACESS = [
  RoleAccess.Admin,
  RoleAccess.ProjectManager,
  RoleAccess.TeamLead,
  RoleAccess.HumanResource,
]
export const LEAVE_REPORT_REPORT_ACESS = [
  RoleAccess.Admin,
  RoleAccess.ProjectManager,
  RoleAccess.TeamLead,
  RoleAccess.HumanResource,
  RoleAccess.Finance,
]

export const ACTIVITY_LOGS_ACCESS = [RoleAccess.Admin]

// Resources
export const HOLIDAY_ACTION_NO_ACCESS = [
  RoleAccess.ProjectManager,
  RoleAccess.TeamLead,
  RoleAccess.Editor,
  RoleAccess.Normal,
  RoleAccess.Finance,
  RoleAccess.Subscriber,
]

// Settings
export const SETTINGS_TABS_NO_ACCESS = [
  RoleAccess.ProjectManager,
  RoleAccess.TeamLead,
]

export const SETTINGS_TABS_NO_ACCESSTO_EMAIL = [
  RoleAccess.ProjectManager,
  RoleAccess.TeamLead,
  RoleAccess.OfficeAdmin,
]
export default RoleAccess
