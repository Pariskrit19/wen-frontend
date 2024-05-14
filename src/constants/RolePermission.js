export const permissionRoleLogo = {
  Navigation: 'navigation',
  Dashboard: 'dasbhoard',
  'Co-Workers': 'view-o',
  Projects: 'folder-o',
  Attendance: 'select',
  'Log Time': 'ckeditor',
  'Leave Management': 'hotel-booking',
  'Notice Board': 'calendar-new',
  Blog: 'chat-new',
  Reports: 'chart-line',
  Resources: 'editor',
  Settings: 'setting',
}

export const permissionRole = {
  Navigation: [
    {name: 'todaysOverview', label: `Today's Overview`, rule: []},
    {name: 'coWorkers', label: `Co-Workers`, rule: []},
    {name: `projects`, label: `Projects`, rule: []},
    {name: `attendance`, label: `Attendance`, rule: []},
    {name: 'logTime', label: `Log Time`, rule: []},
    {name: `leaveManagement`, label: `Leave Management`, rule: []},
    {name: `noticeBoard`, label: `Notice Board`, rule: []},
    {name: `blog`, label: `Blog`, rule: []},
    {name: 'reports', label: `Reports`, rule: []},
    {name: `resources`, label: `Resources`, rule: []},
    {name: `settings`, label: `Settings`, rule: []},
  ],
  Dashboard: [
    {name: 'viewCalendar', label: 'View Calendar', rule: []},
    {
      name: `viewProjectTimeLogReport`,
      label: `View Project Time Log Report`,
      rule: [],
    },
    {name: 'viewTotalCoworkers', label: `View Total Co-workers`, rule: []},
    {name: `viewAnnouncement`, label: `View Announcement `, rule: []},
    {
      name: 'viewCoworkersPunhedInToday',
      label: `View Co-workers Punched In Today`,
      rule: [],
    },
    {name: `viewHolidays`, label: `View Holidays `, rule: []},
    {
      name: `viewPendingLeaveRequest`,
      label: `View Pending Leave Request `,
      rule: [],
    },
    {name: 'viewSalaryReview', label: `View Salary Review`, rule: []},
    {
      name: `viewCoworkersOnLeave`,
      label: `View Co-workers On Leave `,
      rule: [],
    },
    {name: `viewBirthdays`, label: `View Birthdays `, rule: []},
    {name: 'viewRecentActivities', label: `View Recent Activities`, rule: []},
    {
      name: `enableMaintenanceMode`,
      label: `Enable Maintenance Mode `,
      rule: [],
    },
    {
      name: `makeclicakbleTotalCoworkers`,
      label: `Make 'Total Co-workers' Card Clickable`,
      rule: [],
    },
    {
      name: `makeclickableCoworkersPunchIn`,
      label: `Make 'Co-workers Punch In' Card Clickable`,
      rule: [],
    },
    {
      name: `makeclickableLeavePendingRequest`,
      label: `Make'Pending Leave Requests' Card Clickable `,
      rule: [],
    },
    {
      name: `makeclickableCoworkersOnLeave`,
      label: `Make 'Co-workers On Leave' Card Clickable `,
      rule: [],
    },
  ],
  'Co-Workers': [
    {name: 'viewCoworkers', label: 'View Co-workers Detail', rule: []},
    {name: `exportCoworkers`, label: `Export Co-workers`, rule: []},
    {name: 'editCoworkers', label: `Edit Co-workers`, rule: []},
    {name: `importCoworkers`, label: `Import Co-workers `, rule: []},
    {name: 'disableCoworkers', label: `Disable Co-Workers`, rule: []},
    {name: `resetAllocatedLeaves`, label: `Reset Allocated Leaves `, rule: []},
    {name: `switchCoworkers`, label: `Switch Co-workers `, rule: []},
  ],
  Projects: [
    {name: 'createProjects', label: 'Create Projects', rule: []},
    {name: 'editProjects', label: 'Edit Projects', rule: []},
    {name: 'viewProjects', label: 'View Projects Detail', rule: []},
    {name: 'deleteProjects', label: 'Delete Projects', rule: []},
  ],
  Attendance: [
    {name: 'createMyAttendance', label: 'Create My Attendance', rule: []},
    {
      name: 'editCoworkersAttendance',
      label: 'Edit Co-workers Attendance',
      rule: [],
    },
    {
      name: 'deleteCoworkersAttendance',
      label: 'Delete Co-workers Attendance',
      rule: [],
    },
    {name: 'viewMyAttendance', label: 'View My Attendance Detail', rule: []},
    {
      name: 'exportCoworkersAttendance',
      label: 'Export Co-workers Attendance',
      rule: [],
    },
    {
      name: 'viewMyAttendanceCalendar',
      label: 'View My Attendance Calendar',
      rule: [],
    },
    {
      name: 'viewCoworkersLateAttendance',
      label: 'View Co-workers Late Attendance Detail',
      rule: [],
    },
    {
      name: 'viewCoworkersAttendance',
      label: 'View Co-workers Attendance Detail',
      rule: [],
    },
    {name: 'cutLateArrivalLeave', label: 'Cut Late Arrival Leave', rule: []},
    {
      name: 'addCoworkersAttendance',
      label: 'Add Co-workers Attendance',
      rule: [],
    },
    {
      name: 'viewCoworkersAttendanceCalendar',
      label: 'View Co-workers Attendance Calendar',
      rule: [],
    },
  ],
  'Log Time': [
    {name: 'createLogTime', label: 'Create Log Time', rule: []},
    {name: 'editLogTime', label: 'Edit Log Time', rule: []},
    {name: 'viewLogTime', label: 'View Log Time Detail', rule: []},
    {name: 'deleteLogTime', label: 'Delete Log Time', rule: []},
    {name: 'createUserLogTime', label: 'Create Co-worker Log Time', rule: []},
    {name: 'viewOtherLogTime', label: 'View Other Log Time', rule: []},
    {name: 'selectAllLogTime', label: 'Select All Log Time', rule: []},
  ],

  'Leave Management': [
    {name: 'applyLeave', label: 'Apply Leave', rule: []},
    {
      name: 'viewCoworkersLeaves',
      label: 'View Co-workers Leaves Detail',
      rule: [],
    },
    {name: 'viewMyHistory', label: 'View My History Detail', rule: []},
    {
      name: 'approveCoworkersLeaves',
      label: 'Approve Co-workers Leaves',
      rule: [],
    },
    {name: 'viewMyLeaveDetails', label: 'View My Leave Details', rule: []},
    {
      name: 'cancelCoworkersLeaves',
      label: 'Cancel Co-workers Leaves',
      rule: [],
    },
    {name: 'cancelMyLeaves', label: 'Cancel My Leaves', rule: []},
    {
      name: 'exportCoworkersLeaves',
      label: 'Export Co-workers Leaves',
      rule: [],
    },
    {name: 'viewLeaves', label: 'View Leaves Detail', rule: []},
    {name: 'viewLeavesCalendar', label: 'View Leaves Calendar', rule: []},
    {name: 'addCoworkersLeaves', label: 'Add Co-workers Leaves', rule: []},
    {name: 'editCoworkersLeaves', label: 'Edit Co-workers Leaves', rule: []},
  ],

  'Notice Board': [
    {name: 'createNotice', label: 'Create Notice', rule: []},
    {name: 'editNotice', label: 'Edit Notice', rule: []},
    {name: 'viewNotice', label: 'View Notice Detail', rule: []},
    {name: 'deleteNotice', label: 'Delete Notice', rule: []},
  ],
  Blog: [
    {name: 'createBlog', label: 'Create Blog', rule: []},
    {name: 'editBlog', label: 'Edit Blog', rule: []},
    {name: 'viewBlog', label: 'View Blog Detail', rule: []},
    {name: 'deleteBlog', label: 'Delete Blog', rule: []},
  ],
  Reports: [
    {name: 'viewWeeklyReport', label: 'View Weekly Report', rule: []},
    {name: 'viewLeaveReport', label: 'View Leave Report', rule: []},
    {name: 'editLeaveReport', label: 'Edit Leave Report', rule: []},
    {name: 'viewWorkLogReport', label: 'View Work Log Report', rule: []},
    {name: 'viewSalaryReview', label: 'View Salary Review', rule: []},
    {name: 'viewActivityLog', label: 'View Activity Log', rule: []},
    {name: 'viewOvertimeReport', label: 'View Overtime Report', rule: []},
  ],
  Resources: [
    {name: 'createFAQ', label: 'Create FAQ', rule: []},
    {name: 'viewFAQ', label: 'View FAQ Detail', rule: []},
    {name: 'editFAQ', label: 'Edit FAQ', rule: []},
    {name: 'deleteFAQ', label: 'Delete FAQ', rule: []},

    {name: 'createPolicy', label: 'Create Policy', rule: []},
    {name: 'viewPolicy', label: 'View Policy Detail', rule: []},
    {name: 'editPolicy', label: 'Edit Policy', rule: []},
    {name: 'deletePolicy', label: 'Delete Policy', rule: []},

    {name: 'createHoliday', label: 'Create Holiday', rule: []},
    {name: 'viewHoliday', label: 'View Holiday Detail', rule: []},
    {name: 'editHoliday', label: 'Edit Holiday', rule: []},
    {name: 'deleteHoliday', label: 'Delete Holiday', rule: []},
  ],
  Settings: [
    {name: 'coWorker', label: 'Co-Workers', rule: []},
    {name: 'project', label: 'Projects', rule: []},
    {name: 'coworkerCUD', label: 'Co-Workers CUD', rule: []},
    {name: 'logTimes', label: 'Log Time', rule: []},
    {name: 'leaveManagements', label: 'Leave Management', rule: []},
    {name: 'noticeBoards', label: 'Notice Board', rule: []},
    {name: 'blogs', label: 'Blog', rule: []},
    {name: 'resource', label: 'Resources', rule: []},
    {name: 'emails', label: 'Emails', rule: []},
    {name: 'attendance', label: 'Attendance', rule: []},
  ],
}

export const CHANGE_SINGLE_CHECKBOX = 'CHANGE_SINGLE_CHECKBOX'
export const RESET = 'RESET'
export const SELECT_ALL_CHECKBOX = 'SELECT_ALL_CHECKBOX'
export const GLOBAL_SELECT_ALL = 'GLOBAL_SELECT_ALL'
export const GLOBAL_REMOVE_ALL = 'GLOBAL_REMOVE_ALL'
export const SET_EDIT_DATA = 'SET_EDIT_DATA'
export const DESELECT_ALL = 'DESELECT_ALL'
export const REMOVE_CHECKBOX_SELECTION = 'REMOVE_CHECKBOX_SELECTION'
