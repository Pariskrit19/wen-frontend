import React, {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Table, Form} from 'antd'
import moment from 'moment'
import {
  attendanceFilter,
  intialDate,
  LATE_ATTENDANCE_COLUMNS,
  leaveCutStatus,
  monthlyState,
  weeklyState,
} from 'constants/Attendance'
import {
  searchLateAttendacentOfUser,
  updateLateAttendance,
} from 'services/attendances'
import {
  changeDate,
  dateDifference,
  filterSpecificUser,
  handleResponse,
  MuiFormatDate,
  sortFromDate,
  subtractHourTime,
} from 'helpers/utils'
import Select from 'components/Elements/Select'
import {getAllUsers} from 'services/users/userDetails'
import {createLeaveOfUser, getLeaveTypes} from 'services/leaves'
import {notification} from 'helpers/notification'
import {FIRST_HALF, LATE_ARRIVAL} from 'constants/Leaves'
import RangePicker from 'components/Elements/RangePicker'
import {emptyText} from 'constants/EmptySearchAntd'
import LeaveCutModal from 'components/Modules/LeaveCutAttendance/LeaveCutModal'
import CustomIcon from 'components/Elements/Icons'
import ViewDetailModel from '../ViewDetailModel'
import {socket} from 'pages/Main'
import {ADMINISTRATOR} from 'constants/UserNames'
import {decrypt, LATE_ARRIVAL_KEY} from '../../../util/crypto'
import {disabledAfterToday} from 'util/antDatePickerDisabled'

const FormItem = Form.Item

interface recordAttendance {
  _id: {
    userId: string
    user: string
  }
  user?: any
  data: {attendanceDate: string; userId: string; user?: String}[]
}

const formattedAttendances = (attendances: any) => {
  return attendances?.map((att: any) => ({
    ...att,
    key: att._id.userId,
    user: att._id.user,
    count: att.data?.length,
    status: att.data?.every(
      (item: any) => item.lateArrivalLeaveCut === true
    ) ? (
      <span className="gx-text-danger">Leave Cut</span>
    ) : (
      <span className="gx-text-green">Leave Not Cut</span>
    ),
  }))
}

function LateAttendance({userRole}: {userRole: any}) {
  const [sort, setSort] = useState({
    order: 'descend',
    field: 'count',
    columnKey: 'count',
  })
  const [form] = Form.useForm()
  const [date, setDate] = useState(intialDate)
  const [user, setUser] = useState<undefined | string>(undefined)
  const [attFilter, setAttFilter] = useState({id: '1', value: 'Daily'})
  const [leaveCut, setLeaveCut] = useState(leaveCutStatus[0].id)
  const [openView, setOpenView] = useState<boolean>(false)
  const [attToView, setAttToView] = useState<any>({})
  const [openLeaveCutModal, setOpenLeaveCutModal] = useState<boolean>(false)
  const [activeExpandedRow, setActiveExpandedRow] = useState<string[]>([])
  const [attendanceRecord, setAttendanceRecord] = useState<recordAttendance>({
    _id: {userId: '', user: ''},
    data: [{attendanceDate: '', userId: ''}],
  })

  //init hooks
  const queryClient = useQueryClient()

  const {data: users} = useQuery(['userForAttendances'], () =>
    getAllUsers({fields: 'name', active: 'true', sort: 'name'})
  )

  const {data: leaveTypes} = useQuery(['leaveTypes'], getLeaveTypes)

  const {data, isFetching} = useQuery(
    ['lateAttendaceAttendance', user, date, user, leaveCut],
    () =>
      searchLateAttendacentOfUser({
        userId: user || '',
        lateArrivalLeaveCut: leaveCut,
        fromDate: date?.[0]
          ? MuiFormatDate(date[0].format()) + 'T00:00:00Z'
          : '',
        toDate: date?.[1]
          ? MuiFormatDate(date[1]?.format()) + 'T00:00:00Z'
          : '',
      })
  )

  const handleChangeDate = (date: any) => {
    setDate(date ? date : intialDate)
    if (date === null) {
      setAttFilter({id: '1', value: 'Daily'})
    }
  }

  const leaveMutation = useMutation((leave: any) => createLeaveOfUser(leave), {
    onSuccess: (response) => {
      if (response.status) {
        setOpenLeaveCutModal(false)
        setAttendanceRecord({
          _id: {userId: '', user: ''},
          data: [{attendanceDate: '', userId: ''}],
        })
        handleCutLeaveInAttendance(response)
      } else {
        notification({
          message: `Leave creation failed !`,
          type: 'success',
        })
      }
    },
    onError: (error) => {
      notification({message: 'Leave creation failed!', type: 'error'})
    },
  })

  const attendanceGroupMutation = useMutation(
    (lateAttendace: any) => updateLateAttendance(lateAttendace),
    {
      onSuccess: (response) => {
        if (response.status) {
          setAttendanceRecord({
            _id: {userId: '', user: ''},
            data: [{attendanceDate: '', userId: ''}],
          })
        }
        handleResponse(
          response,
          'Leave Cut Successful',
          'Leave creation failed',
          [() => queryClient.invalidateQueries(['lateAttendaceAttendance'])]
        )
      },
      onError: (error) => {
        notification({message: 'Leave creation failed!', type: 'error'})
      },
    }
  )

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSort(sorter)
  }

  const handleAttChnageChange = (val: any) => {
    setAttFilter(val)
    switch (val) {
      case 1:
        setDate(intialDate)
        break
      case 2:
        setDate(weeklyState)
        break
      case 3:
        setDate(monthlyState)
        break

      default:
        break
    }
  }

  const handleUserChange = (id: string) => {
    setUser(id)
  }

  const handleLeaveCutStatusChange = (val: any) => {
    setLeaveCut(val)
  }

  const handleView = (record: any) => {
    setOpenView(true)
    setAttToView({
      ...record,
      attendanceDate: moment(record?.attendanceDate).format('LL'),
      attendanceDay: moment(record?.attendanceDate).format('dddd'),
      punchInTime: record?.punchInTime,
      punchOutTime: record?.punchOutTime ? record?.punchOutTime : '',
      officeHour: record?.officeHour ? record?.officeHour : '',
    })
  }
  const handleReset = () => {
    setUser(undefined)
    setAttFilter({id: '1', value: 'Daily'})
    setDate(intialDate)
    setLeaveCut(leaveCutStatus[0].id)
  }

  const handleCutLeave = (type: number) => {
    leaveMutation.mutate({
      id: attendanceRecord?._id?.userId,
      data: {
        leaveDates: [
          attendanceRecord?.data?.[attendanceRecord?.data.length - 1]
            .attendanceDate,
        ],
        reason: 'Leave cut due to late attendance',
        leaveType:
          leaveTypes?.data?.data?.data?.find(
            (type: any) => type?.name === LATE_ARRIVAL
          )?._id || LATE_ARRIVAL,
        leaveStatus: 'approved',
        halfDay: type === 2 ? FIRST_HALF : '',
      },
    })
  }

  const handleCutLeaveInAttendance = (leaveResponse: any) => {
    const payload = attendanceRecord?.data.map((x: any) => x._id) || []

    attendanceGroupMutation.mutate({
      leaveType:
        leaveResponse?.data?.data?.data?.halfDay === ''
          ? 'Full Day'
          : 'First Half',
      attendance: payload,
      userId: attendanceRecord?.data[0].userId,
      leaveCutdate: moment(
        attendanceRecord?.data?.[attendanceRecord?.data.length - 1]
          .attendanceDate
      )
        .startOf('day')
        .format(),
    })

    socket.emit('late-attendance', {
      showTo: [attendanceRecord?.data[0].userId],
      remarks: `Your ${
        leaveResponse?.data?.data?.data?.halfDay === ''
          ? 'full Day'
          : 'half Day'
      } leave has been cut due to late arrival.`,
      module: 'Attendance',
    })

    socket.emit('CUD')
  }

  const expandedRowRender = (parentRow: any) => {
    const columns = [
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: 'Punch-in Time',
        dataIndex: 'punchInTime',
        key: 'punchInTime',
      },
      {
        title: 'Punch-out Time',
        dataIndex: 'punchOutTime',
        key: 'punchOutTime',
      },
      {
        title: 'Office hour',
        dataIndex: 'officeHour',
        key: 'officeHour',
      },
      {
        title: 'Late By',
        dataIndex: 'lateBy',
        key: 'lateBy',
      },
      {
        title: 'Action',
        key: 'action',
        render: (text: any, record: any) => {
          return (
            <span>
              <span className="gx-link" onClick={() => handleView(record)}>
                <CustomIcon name="view" />
              </span>
            </span>
          )
        },
      },
    ]
    const data = parentRow?.data?.map((att: any) => ({
      ...att,
      key: att._id,
      date: changeDate(att.attendanceDate),
      punchInTime: moment(att?.punchInTime).format('LTS'),
      punchOutTime: att?.punchOutTime
        ? moment(att?.punchOutTime).format('LTS')
        : 'N/A',
      officeHour: att?.punchOutTime
        ? dateDifference(att?.punchOutTime, att?.punchInTime)
        : '',
      lateBy: subtractHourTime({
        userOfficeTime: att?.officeTime?.utcDate,
        lateArrivalThreshold,
        userPunchIn: att?.punchInTime,
      }),
    }))

    return <Table columns={columns} dataSource={data} pagination={false} />
  }

  const sortedData = (datas: any[]) => {
    // group by attendance date in object
    const groupByAttendance = datas?.reduce((acc, item: any) => {
      acc[item.attendanceDate] = [...(acc[item.attendanceDate] || [])].concat(
        item
      )
      return acc
    }, {})

    // sort  by earliest punchInTime
    // Object.keys(groupByAttendance)?.forEach((x) => {
    //   groupByAttendance[x] = sortFromDate(groupByAttendance[x], 'punchInTime')
    // })

    // get first punchInTime Attendance  a day
    return Object.values(groupByAttendance)?.reduce((acc: any, x: any) => {
      acc.push(x[0])
      return sortFromDate(acc, 'attendanceDate')
    }, [])
  }

  const formattedAttendaces = decrypt(
    data?.data?.data?.attendances,
    LATE_ARRIVAL_KEY
  )?.map((att: any) => ({
    ...att,
    data: att.data && sortedData(att.data),
  }))

  const lateArrivalThreshold = decrypt(
    data?.data?.data?.lateArrivalThreshold,
    LATE_ARRIVAL_KEY
  )

  const hanldeLeaveCutModal = (record: any) => {
    setAttendanceRecord(record)
    setOpenLeaveCutModal(true)
  }

  const hanldeCloseLeaveCutModal = () => {
    setOpenLeaveCutModal(false)
  }

  return (
    <div>
      {openLeaveCutModal && (
        <LeaveCutModal
          coWorker={attendanceRecord?._id?.user || ''}
          open={openLeaveCutModal}
          onClose={hanldeCloseLeaveCutModal}
          onSubmit={handleCutLeave}
          loading={leaveMutation.isLoading}
        />
      )}

      <ViewDetailModel
        toogle={openView}
        title={attToView?.user ? attToView?.user : 'Attendance Details'}
        handleCancel={() => {
          setOpenView(false)
        }}
        attendanceToview={attToView}
      />
      <div className="gx-mt-2"></div>
      <div className="components-table-demo-control-bar">
        <div className="gx-d-flex gx-justify-content-between gx-flex-row">
          <Form layout="inline" form={form}>
            <FormItem>
              <RangePicker
                handleChangeDate={handleChangeDate}
                date={date}
                disabledDate={disabledAfterToday}
              />
            </FormItem>
            <FormItem className="direct-form-item">
              <Select
                onChange={handleAttChnageChange}
                value={attFilter}
                options={attendanceFilter}
              />
            </FormItem>
            <FormItem className="direct-form-item">
              <Select
                placeholder="Select Co-worker"
                onChange={handleUserChange}
                value={user}
                options={filterSpecificUser(
                  users?.data?.data?.data,
                  ADMINISTRATOR
                )?.map((x: any) => ({
                  id: x._id,
                  value: x.name,
                }))}
              />
            </FormItem>
            <FormItem className="direct-form-item">
              <Select
                placeholder="Select Leave Cut  Status"
                onChange={handleLeaveCutStatusChange}
                value={leaveCut}
                options={leaveCutStatus}
              />
            </FormItem>

            <FormItem>
              <Button
                className="gx-btn gx-btn-primary gx-text-white "
                onClick={() => handleReset()}
              >
                Reset
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
      <Table
        locale={{emptyText}}
        className="gx-table-responsive"
        columns={LATE_ATTENDANCE_COLUMNS(sort, hanldeLeaveCutModal, userRole)}
        dataSource={formattedAttendances(formattedAttendaces)}
        expandable={{expandedRowRender}}
        onExpandedRowsChange={function (expandedRows) {
          if (expandedRows.length > 0) {
            setActiveExpandedRow([
              expandedRows[expandedRows.length - 1]?.toString(),
            ])
          } else {
            setActiveExpandedRow([''])
          }
        }}
        expandedRowKeys={activeExpandedRow}
        onChange={handleTableChange}
        loading={isFetching}
      />
    </div>
  )
}

export default LateAttendance
