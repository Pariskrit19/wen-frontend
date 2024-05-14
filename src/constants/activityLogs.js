const ACTIVITY_LOGS = (sortedInfo) => [
  {
    title: 'Module',
    dataIndex: 'module',
    key: 'module',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'module' && sortedInfo.order,
  },
  {
    title: 'Activity',
    dataIndex: 'activity',
    key: 'activity',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'activity' && sortedInfo.order,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    sorter: true,

    sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
  },
  {
    title: 'Activity Time',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
  },
]

const MODULES = [
  {id: 'Attendance', value: 'Attendance'},
  {id: 'User', value: 'Co-worker'},
  {id: 'Leave', value: 'Leave'},
  {id: 'Leave Quarter', value: 'Leave Quarter'},
  {id: 'Notice', value: 'Notice'},
  {id: 'Project', value: 'Project'},
  {id: 'TimeLog', value: 'TimeLog'},
]

const STATUS = [
  {id: 'created', value: 'Created'},
  {id: 'updated', value: 'Updated'},
  {id: 'deleted', value: 'Deleted'},
]

export {ACTIVITY_LOGS, STATUS, MODULES}
