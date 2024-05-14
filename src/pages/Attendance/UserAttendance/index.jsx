import React, {useEffect, useMemo, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Table, Form, DatePicker} from 'antd'
import moment from 'moment'
import {
  attendanceFilter,
  ATTENDANCE_COLUMNS,
  intialDate,
  monthlyState,
  weeklyState,
} from 'constants/Attendance'
import {
  addAttendance,
  getIpAddres,
  searchAttendacentOfUser,
  updatePunchout,
} from 'services/attendances'
import {
  checkIfTimeISBetweenOfficeHour,
  dateDifference,
  getIsAdmin,
  handleResponse,
  isNotValidTimeZone,
  milliSecondIntoHours,
  MuiFormatDate,
  sortFromDate,
} from 'helpers/utils'
import ViewDetailModel from '../ViewDetailModel'
import {notification} from 'helpers/notification'
import Select from 'components/Elements/Select'
import TmsMyAttendanceForm from 'components/Modules/TmsMyAttendanceForm'
import {useDispatch, useSelector} from 'react-redux'
import CustomIcon from 'components/Elements/Icons'
import {useLocation} from 'react-router-dom'
import {punchLimit} from 'constants/PunchLimit'
import {emptyText} from 'constants/EmptySearchAntd'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import getLocation, {checkLocationPermission} from 'helpers/getLocation'
import {PUNCH_IN, PUNCH_OUT} from 'constants/ActionTypes'
import {fetchLoggedInUserAttendance} from 'appRedux/actions/Attendance'
import {PAGE50} from 'constants/Common'
import {disabledAfterToday} from 'util/antDatePickerDisabled'
import calculateTimeDifference from 'util/calculatePunchInOutTimeDiff'

const {RangePicker} = DatePicker
const FormItem = Form.Item

const formattedAttendances = (attendances) => {
  return attendances?.map((att) => {
    let timeToMilliSeconds = att?.data
      ?.map((x) =>
        x?.punchOutTime
          ? new Date(x?.punchOutTime) - new Date(x?.punchInTime)
          : ''
      )
      .filter(Boolean)
      ?.reduce((accumulator, value) => {
        return accumulator + value
      }, 0)

    return {
      ...att,
      key: att._id.attendanceDate + att._id.user,
      attendanceDate: moment(att?._id.attendanceDate).format('LL'),
      attendanceDay: moment(att?._id.attendanceDate).format('dddd'),
      punchInTime: moment(att?.data?.[0]?.punchInTime).format('LTS'),
      punchOutTime: att?.data?.[att?.data.length - 1]?.punchOutTime
        ? moment(att?.data?.[att?.data.length - 1]?.punchOutTime).format('LTS')
        : '',
      officehour: milliSecondIntoHours(att?.officehour),
      intHour: timeToMilliSeconds,
    }
  })
}

function UserAttendance({userRole}) {
  const queryClient = useQueryClient()
  const {lateArrivalThreshold, allocatedOfficeHours} = useSelector(
    (state) => state.configurations
  )

  //init hooks
  const {state} = useLocation()
  const [sort, setSort] = useState({
    order: 'ascend',
    field: 'attendanceDate',
    columnKey: 'attendanceDate',
  })
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const [disableButton, setDisableButton] = useState(false)
  const [page, setPage] = useState(PAGE50)
  const [openView, setOpenView] = useState(false)
  const [attToView, setAttToView] = useState({})
  const [date, setDate] = useState(intialDate)
  const [attFilter, setAttFilter] = useState({id: '1', value: 'Daily'})
  const [toogle, setToogle] = useState(false)
  const [activeExpandedRow, setActiveExpandedRow] = useState([])

  const user = useSelector(selectAuthUser)

  // const punchIn = useSelector((state) => state.attendance.punchIn)
  const {punchIn, latestAttendance} = useSelector((state) => state.attendance)

  // set inital date to date selected from my attendance calendar
  useEffect(() => {
    if (state?.date) {
      setDate([moment(state.date), moment(state.date)])
    }
  }, [state?.date])

  const {data, isLoading, isFetching} = useQuery(
    ['userAttendance', user, date, page, sort],
    () => {
      let sortField = ''
      if (sort?.order) {
        const order = sort.order === 'ascend' ? '' : '-'
        sortField = `${order}${sort.columnKey}`
      }

      return searchAttendacentOfUser({
        page: page.page + '',
        limit: page.limit + '',
        userId: user._id,
        fromDate: date?.[0] ? MuiFormatDate(date[0]._d) + 'T00:00:00Z' : '',
        toDate: date?.[1] ? MuiFormatDate(date[1]._d) + 'T00:00:00Z' : '',
        sort: sortField,
      })
    }
  )

  const handleChangeDate = (date) => {
    setDate(date ? date : intialDate)

    if (date === null) {
      setAttFilter(1)
    }
  }

  const handleTableChange = (pagination, filters, sorter) => {
    setSort(sorter)
  }

  const handlePageChange = (pageNumber) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const onShowSizeChange = (_, pageSize) => {
    setPage((prev) => ({...page, limit: pageSize}))
  }

  const handleView = (record) => {
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

  const addAttendances = useMutation((payload) => addAttendance(payload), {
    onSuccess: (response) => {
      handleResponse(response, 'Punched Successfully', 'Punch  failed', [
        () => {
          dispatch({type: PUNCH_OUT})
        },
        () => queryClient.invalidateQueries(['adminAttendance']),
        () => queryClient.invalidateQueries(['userAttendance']),
        () => {
          dispatch(fetchLoggedInUserAttendance(user._id))
        },
      ])
    },
    onError: (error) => {
      notification({message: 'Punch  failed', type: 'error'})
    },
  })

  const punchOutAttendances = useMutation(
    (payload) => updatePunchout(payload?.userId, payload.payload),
    {
      onSuccess: (response) => {
        handleResponse(response, 'Punched Successfully', 'Punch  failed', [
          () => {
            dispatch(fetchLoggedInUserAttendance(user._id))
          },
          () => {
            dispatch({type: PUNCH_IN})
          },
          () => queryClient.invalidateQueries(['userAttendance']),
          () => queryClient.invalidateQueries(['adminAttendance']),
        ])
      },
      onError: (error) => {
        notification({message: 'Punch  failed', type: 'error'})
      },
    }
  )

  const handleAttChnageChange = (val) => {
    setPage(PAGE50)
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

  useEffect(() => {
    if (isLoading === false && !data?.status) {
      notification({message: 'Failed To load Attendances', type: 'error'})
    }
  }, [isLoading, data?.status])

  const expandedRowRender = (parentRow) => {
    const columns = [
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
        title: 'Action',
        key: 'action',
        render: (text, record) => {
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
    const data = parentRow?.data?.map((att) => ({
      ...att,
      key: att._id,
      punchInTime: moment(att?.punchInTime).format('LTS'),
      punchOutTime: att?.punchOutTime
        ? moment(att?.punchOutTime).format('LTS')
        : '',
      officeHour: att?.punchOutTime
        ? dateDifference(att?.punchOutTime, att?.punchInTime)
        : '',
    }))

    return <Table columns={columns} dataSource={data} pagination={false} />
  }
  const sortedData = useMemo(() => {
    return data?.data?.data?.attendances?.[0]?.data?.map((d) => ({
      ...d,
      data: sortFromDate(d?.data, 'punchInTime'),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data?.data?.attendances?.[0]?.data])

  const handlePunch = async () => {
    let latestPunchInTime =
      latestAttendance?.[latestAttendance.length - 1]?.punchInTime

    let latestPunchOutTime =
      latestAttendance?.[latestAttendance.length - 1]?.punchOutTime

    const hasAlreadyPunchedOut = latestPunchOutTime?.length
    const punchInOutTimeDiff = calculateTimeDifference(latestPunchInTime)

    if (
      !hasAlreadyPunchedOut &&
      latestPunchInTime &&
      moment() < moment(latestPunchInTime).add(10, 'm')
    ) {
      notification({
        message: `You have just Punched In ! You can punch out again after ${`${
          punchInOutTimeDiff.minutes
        } ${punchInOutTimeDiff.minutes === 1 ? 'minute.' : 'minutes.'}`} `,

        type: 'info',
      })
      return
    }
    if (isNotValidTimeZone()) {
      notification({
        message: 'Your timezone is not a valid timezone',
        type: 'error',
      })
      return
    }

    if (
      checkIfTimeISBetweenOfficeHour(
        moment(user?.officeTime?.utcDate)
          .add(lateArrivalThreshold, 'm')
          .format('HH:mm:ss'),
        moment(user?.officeEndTime).format('HH:mm:ss')
      )
    ) {
      setToogle(true)
      return
    }
    setDisableButton(true)
    const location = await getLocation()
    if (location && (await checkLocationPermission())) {
      const IP = await getIpAddres()

      if (!punchIn) {
        const lastattendace = sortFromDate(latestAttendance, 'punchInTime').at(
          -1
        )

        punchOutAttendances.mutate({
          userId: lastattendace?._id,
          payload: {
            punchOutNote: '',
            midDayExit: false,
            punchOutTime: moment.utc().format(),
            punchOutLocation: location,
            punchOutIp: IP?.data?.IPv4,
          },
        })
      } else {
        addAttendances.mutate({
          punchInTime: moment.utc().format(),
          punchInLocation: location,
          attendanceDate: moment.utc().startOf('day').format(),
          punchInIp: IP?.data?.IPv4,
        })
      }
    } else {
      notification({
        message: 'Please allow Location Access to Punch for Attendance',
        type: 'error',
      })
    }
    setDisableButton(false)
  }
  return (
    <div>
      <TmsMyAttendanceForm
        title="Time Attendance"
        toogle={toogle}
        handleCancel={() => setToogle(false)}
      />
      <ViewDetailModel
        title="Attendance Details"
        toogle={openView}
        handleCancel={() => setOpenView(false)}
        attendanceToview={attToView}
      />
      <div className="gx-mt-2"></div>
      <div className="components-table-demo-control-bar">
        <div className="gx-d-flex gx-justify-content-between gx-flex-row">
          <Form layout="inline" form={form}>
            <FormItem>
              <RangePicker
                onChange={handleChangeDate}
                value={date}
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
          </Form>
          {userRole?.createMyAttendance && (
            <div className="form-buttons">
              <Button
                className="gx-btn-form gx-btn-primary gx-text-white "
                disabled={isLoading || getIsAdmin() || disableButton}
                onClick={
                  latestAttendance?.length >= punchLimit &&
                  !latestAttendance
                    ?.map((item) => item?.hasOwnProperty('punchOutTime'))
                    .includes(false)
                    ? () => {
                        notification({
                          message: 'Punch Limit Exceeded',
                          type: 'error',
                        })
                      }
                    : handlePunch
                }
              >
                {punchIn ? 'Punch In' : 'Punch Out'}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Table
        locale={{emptyText}}
        className="gx-table-responsive"
        columns={ATTENDANCE_COLUMNS(
          sort,
          handleView,
          false,
          allocatedOfficeHours
        )}
        dataSource={formattedAttendances(sortedData)}
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
        pagination={{
          current: page.page,
          pageSize: page.limit,
          pageSizeOptions: ['5', '10', '20', '50'],
          showSizeChanger: true,
          total: data?.data?.data?.attendances?.[0]?.metadata?.[0]?.total || 1,
          onShowSizeChange,
          onChange: handlePageChange,
        }}
        loading={isFetching}
      />
    </div>
  )
}

export default UserAttendance
