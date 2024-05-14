import React, {ReactElement} from 'react'
import moment from 'moment'
import CustomIcon from 'components/Elements/Icons'
import {hrsToMins} from './Common'
import {ATTENDANCE_LATE_ATTENDANCE_CUT_LEAVE_NO_ACCESS} from './RoleAccess'
import {getIsAdmin} from 'helpers/utils'

interface notice {
  title: string
  dataIndex?: string
  key: any
  width?: number
  sorter?: boolean | ((a: any, b: any) => any)
  sortOrder?: any
  render?: (text: any, record: any) => ReactElement | null
}

type days =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

const ATTENDANCE_COLUMNS = (
  sortedInfo: any,
  openModal: Function,
  admin: boolean,
  officeHours: number
): notice[] =>
  admin
    ? [
        {
          title: 'Co-worker',
          dataIndex: 'user',
          key: 'user',
          sorter: true,
          sortOrder: sortedInfo.columnKey === 'user' && sortedInfo.order,
        },
        {
          title: 'Date',
          dataIndex: 'attendanceDate',
          key: 'attendanceDate',
          sorter: true,
          sortOrder:
            sortedInfo.columnKey === 'attendanceDate' && sortedInfo.order,
        },
        {
          title: 'Day',
          dataIndex: 'attendanceDay',
          key: 'attendanceDay',
        },
        {
          title: 'Punch-in Time',
          dataIndex: 'punchInTime',
          key: 'punchInTime',
          sorter: true,
          sortOrder: sortedInfo.columnKey === 'punchInTime' && sortedInfo.order,
        },
        {
          title: 'Punch-out Time',
          dataIndex: 'punchOutTime',
          key: 'punchOutTime',
          sorter: true,
          sortOrder:
            sortedInfo.columnKey === 'punchOutTime' && sortedInfo.order,
        },
        {
          title: 'Office Hour',
          dataIndex: 'officehour',
          key: 'officehour',
          sorter: true,
          sortOrder: sortedInfo.columnKey === 'officehour' && sortedInfo.order,
          render: (text: string, record) => {
            return (
              <span
                className={
                  record.data
                    ?.map((x: any) =>
                      x?.punchOutTime
                        ? new Date(x?.punchOutTime).getTime() -
                          new Date(x?.punchInTime).getTime()
                        : ''
                    )
                    .filter(Boolean)
                    ?.reduce((accumulator: number, value: number) => {
                      return accumulator + value
                    }, 0) < hrsToMins(officeHours)
                    ? 'gx-text-danger'
                    : ''
                }
              >
                {text}
              </span>
            )
          },
        },
      ]
    : [
        {
          title: 'Date',
          dataIndex: 'attendanceDate',
          key: 'attendanceDate',
          sorter: true,
          sortOrder:
            sortedInfo.columnKey === 'attendanceDate' && sortedInfo.order,
        },
        {
          title: 'Day',
          dataIndex: 'attendanceDay',
          key: 'attendanceDay',
        },
        {
          title: 'Punch-in Time',
          dataIndex: 'punchInTime',
          key: 'punchInTime',
          sorter: true,
          sortOrder: sortedInfo.columnKey === 'punchInTime' && sortedInfo.order,
        },
        {
          title: 'Punch-out Time',
          dataIndex: 'punchOutTime',
          key: 'punchOutTime',
          sorter: true,
          sortOrder:
            sortedInfo.columnKey === 'punchOutTime' && sortedInfo.order,
        },
        {
          title: 'Office Hour',
          dataIndex: 'officehour',
          key: 'officehour',
          sorter: true,
          sortOrder: sortedInfo.columnKey === 'officehour' && sortedInfo.order,
          render: (text: string, record) => {
            return (
              <span
                className={
                  record.data
                    ?.map((x: any) =>
                      x?.punchOutTime
                        ? new Date(x?.punchOutTime).getTime() -
                          new Date(x?.punchInTime).getTime()
                        : ''
                    )
                    .filter(Boolean)
                    ?.reduce((accumulator: number, value: number) => {
                      return accumulator + value
                    }, 0) < hrsToMins(officeHours)
                    ? 'gx-text-danger'
                    : ''
                }
              >
                {text}
              </span>
            )
          },
        },
      ]

const LATE_ATTENDANCE_COLUMNS = (
  sortedInfo: any,
  hanldeLeaveCutModal: Function,
  role: any
): notice[] =>
  role?.cutLateArrivalLeave === false
    ? [
        {
          title: 'Co-worker',
          dataIndex: 'user',
          key: 'user',
          sorter: (a, b) => {
            return a.user.toString().localeCompare(b.user.toString())
          },
          sortOrder: sortedInfo.columnKey === 'user' && sortedInfo.order,
        },

        {
          title: 'Count',
          dataIndex: 'count',
          key: 'count',
          sorter: (a, b) => a.count - b.count,
          sortOrder: sortedInfo.columnKey === 'count' && sortedInfo.order,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
        },
      ]
    : [
        {
          title: 'Co-worker',
          dataIndex: 'user',
          key: 'user',
          sorter: (a, b) => {
            return a.user.toString().localeCompare(b.user.toString())
          },
          sortOrder: sortedInfo.columnKey === 'user' && sortedInfo.order,
        },

        {
          title: 'Count',
          dataIndex: 'count',
          key: 'count',
          sorter: (a, b) => a.count - b.count,
          sortOrder: sortedInfo.columnKey === 'count' && sortedInfo.order,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
        },
        {
          title: 'Action',
          key: 'action',
          width: 150,
          render: (text, record) => {
            return (
              <div
                style={{
                  display: record?.data?.every(
                    (item: any) => item.lateArrivalLeaveCut === true
                  )
                    ? 'none'
                    : 'flex',
                }}
              >
                <span
                  className="gx-link"
                  onClick={() => hanldeLeaveCutModal(record)}
                >
                  {!getIsAdmin() && <CustomIcon name="leaveCut" />}
                </span>
              </div>
            )
          },
        },
      ]

const attendanceFilter = [
  {id: 1, value: 'Daily'},
  {id: 2, value: 'Weekly'},
  {id: 3, value: 'Monthly'},
]

const attendanceFilterWithLastWeek = [
  {id: 1, value: 'Daily'},
  {id: 2, value: 'This Week'},
  {id: 4, value: 'Last Week'},
  {id: 3, value: 'Monthly'},
]

export const intialDate = [moment().startOf('day'), moment().endOf('day')]
export const weeklyState = [
  moment().startOf('week').subtract(1, 'days'),
  moment().endOf('day'),
]
export const monthlyState = [moment().startOf('month'), moment().endOf('day')]
export const LastWeekState = [
  moment().subtract(1, 'weeks').startOf('week').subtract(1, 'days'),
  moment().subtract(1, 'weeks').endOf('week').subtract(1, 'days'),
]

export {
  ATTENDANCE_COLUMNS,
  attendanceFilter,
  LATE_ATTENDANCE_COLUMNS,
  attendanceFilterWithLastWeek,
}

export const leaveCutStatus = [
  {id: '1', value: 'Leave Not Cut '},
  {id: '2', value: 'Leave Cut '},
]

export const OfficeHourFilter = [
  {
    value: 'Is Equal to',
    id: 'eq',
  },
  {
    value: 'Is Greater than',
    id: 'gt',
  },
  {
    value: 'Is Greater than or Equal to',
    id: 'gte',
  },
  {
    value: 'Is Less than or Equal to',
    id: 'lte',
  },
  {
    value: 'Is Lesser than',
    id: 'lt',
  },
]

export const ATTENDANCE_SETTINGS_LIST = (
  lateMinutes: any,
  officeHours: any
) => [
  {
    id: 0,
    name: 'Late Arrival Threshold',
    unit: lateMinutes === 1 ? 'minute' : 'minutes',
    value: lateMinutes,
  },
  {
    id: 1,
    name: 'Office Hours',
    unit: officeHours === 1 ? 'hour' : 'hours',
    value: officeHours,
  },
]
