import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card, Form, Table} from 'antd'
import CircularProgress from 'components/Elements/CircularProgress'
import LogModal from 'components/Modules/LogtimeModal'
import '@ant-design/compatible/assets/index.css'
import {
  changeDate,
  roundedToFixed,
  handleResponse,
  MuiFormatDate,
  sortTableDatas,
} from 'helpers/utils'
import {notification} from 'helpers/notification'
import moment from 'moment'
import React, {useState} from 'react'
import {
  deleteTimeLog,
  getAllTimeLogs,
  getLogTypes,
  getOtherTodayTimeLogSummary,
  getOtherWeeklyTimeLogSummary,
  updateTimeLog,
} from 'services/timeLogs'
import TimeSummary from './TimeSummary'
import {
  attendanceFilter,
  intialDate,
  monthlyState,
  weeklyState,
} from 'constants/Attendance'
import {emptyText} from 'constants/EmptySearchAntd'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {socket} from 'pages/Main'
import {OTHER_LOGTIMES_COLUMNS} from 'constants/OtherLogTime'
import RangePicker from 'components/Elements/RangePicker'
import {getAllUsers} from 'services/users/userDetails'
import Select from 'components/Elements/Select'
import {PLACE_HOLDER_CLASS} from 'constants/Common'
import {disabledAfterToday} from 'util/antDatePickerDisabled'

const formattedLogs = (logs) => {
  return logs?.map((log) => ({
    ...log,
    key: log?._id,
    logType: log?.logType?.name,
    logDate: changeDate(log?.logDate),
    user: log?.user?.name,
    project: log?.project?.name || 'Other',
    slug: log?.project?.slug,
    projectId: log?.project?.id,
  }))
}

function OtherLogTime() {
  // init hooks
  const queryClient = useQueryClient()
  const defaultPageSize = {page: 1, limit: 50}

  // init states
  const [sort, setSort] = useState({})
  const [page, setPage] = useState(defaultPageSize)
  const [date, setDate] = useState(intialDate)
  const [user, setUser] = useState(undefined)
  const [logType, setLogType] = useState(undefined)
  const [openModal, setOpenModal] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const FormItem = Form.Item

  const [timeLogToUpdate, setTimelogToUpdate] = useState({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [dateFilter, setDateFilter] = useState({id: '1', value: 'Daily'})

  const {
    role: {key, permission},
  } = useSelector(selectAuthUser)

  const {data: users} = useQuery(['userForAttendances'], () =>
    getAllUsers({fields: 'name'})
  )

  const handleUserChange = (id) => {
    setUser(id)
    setPage(defaultPageSize)
  }

  const handlelogTypeChange = (id) => {
    setLogType(id)
    setPage(defaultPageSize)
  }

  const handleReset = () => {
    setDateFilter({id: '1', value: 'Daily'})
    setLogType(undefined)
    setPage(defaultPageSize)
    setUser(undefined)
    setDate(intialDate)
  }

  const {
    data: logTimeDetails,
    isLoading: timelogLoading,
    isFetching: timeLogFetching,
  } = useQuery(
    ['timeLogs', page, sort, user, logType, date],
    () =>
      getAllTimeLogs({
        ...page,
        project: process.env.REACT_APP_OTHER_PROJECT_ID,
        logType: logType,
        user,
        fromDate: date?.[0] ? MuiFormatDate(date[0]._d) + 'T00:00:00Z' : '',
        toDate: date?.[1] ? MuiFormatDate(date[1]._d) + 'T23:59:59Z' : '',
        sort: sortTableDatas(sort.order, sort.column, sort.field),
      }),
    {keepPreviousData: true}
  )

  const {data: todayTimeSpent, isLoading: todayLoading} = useQuery(
    ['otherTodayTimeSpent'],
    getOtherTodayTimeLogSummary
  )
  const {data: weeklyTimeSpent, isLoading: weeklyLoading} = useQuery(
    ['otherweeklyTimeSpent'],
    getOtherWeeklyTimeLogSummary
  )

  const UpdateLogTimeMutation = useMutation(
    (details) => updateTimeLog(details),
    {
      onSuccess: (response) =>
        handleResponse(
          response,
          'Updated time log successfully',
          'Could not update time log',
          [
            () => queryClient.invalidateQueries(['timeLogs']),
            () => queryClient.invalidateQueries(['otherTodayTimeSpent']),
            () => queryClient.invalidateQueries(['otherweeklyTimeSpent']),
            () => handleCloseTimelogModal(),
          ]
        ),
      onError: (error) => {
        notification({message: 'Could not update time log!', type: 'error'})
      },
      onSettled: () => {
        setIsSubmitted(false)
      },
    }
  )

  const {data: logTypes} = useQuery(['logTypes'], () => getLogTypes())

  const deleteLogMutation = useMutation((logId) => deleteTimeLog(logId), {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Deleted time log successfully',
        'Could not delete time log',
        [
          () => queryClient.invalidateQueries(['timeLogs']),
          () => queryClient.invalidateQueries(['otherTodayTimeSpent']),
          () => queryClient.invalidateQueries(['otherweeklyTimeSpent']),
          () => {
            socket.emit('CUD')
          },
        ]
      ),
    onError: (error) => {
      notification({message: 'Could not delete time log!', type: 'error'})
    },
  })

  const handleOptionChange = (val) => {
    setDateFilter(val)
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

  const handleTableChange = (pagination, filters, sorter) => {
    setSort(sorter)
  }

  const handlePageChange = (pageNumber) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const onShowSizeChange = (_, pageSize) => {
    setPage((prev) => ({...page, limit: pageSize}))
  }

  const confirmDelete = (log) => {
    deleteLogMutation.mutate(log._id)
  }

  const handleChangeDate = (date) => {
    setDate(date ? date : intialDate)
  }

  const handleOpenEditModal = (log, readOnly) => {
    const originalTimelog = logTimeDetails?.data?.data?.data.find(
      (project) => project.id === log.id
    )
    setTimelogToUpdate({
      ...log,
      logDate: originalTimelog?.logDate,
      logType: originalTimelog?.logType,
      user: originalTimelog?.user,
      project: originalTimelog?.project,
    })
    setOpenModal(true)
    setIsEditMode(true)
    if (readOnly) setIsReadOnly(true)
  }

  const handleCloseTimelogModal = () => {
    setOpenModal(false)
    setTimelogToUpdate({})
    setIsEditMode(false)
    setIsReadOnly(false)
  }

  const handleLogTypeSubmit = (newLogtime) => {
    let formattedNewLogtime = {
      ...newLogtime,
      hours: +newLogtime.hours,
      logDate: moment.utc(newLogtime.logDate).format(),
      minutes: +newLogtime.minutes,
      otStatus: newLogtime?.otStatus,
    }
    if (isEditMode)
      UpdateLogTimeMutation.mutate({
        id: formattedNewLogtime.id,
        details: {
          ...formattedNewLogtime,
          user: newLogtime.user,
        },
      })
  }

  if (timelogLoading) {
    return <CircularProgress />
  }

  return (
    <div>
      {openModal && (
        <LogModal
          toggle={openModal}
          onClose={handleCloseTimelogModal}
          onSubmit={handleLogTypeSubmit}
          loading={UpdateLogTimeMutation.isLoading || isSubmitted}
          logTypes={logTypes}
          initialValues={timeLogToUpdate}
          isEditMode={isEditMode}
          isUserLogtime={true}
          role={key}
          isReadOnly={isReadOnly}
          setIsSubmitted={setIsSubmitted}
        />
      )}
      <div style={{marginTop: 20}}></div>
      <Card title={' Time Summary'}>
        <TimeSummary
          tst={roundedToFixed(
            todayTimeSpent?.data?.data?.timeSpentToday?.[0]?.timeSpentToday ||
              0,
            2
          )}
          tsw={roundedToFixed(
            weeklyTimeSpent?.data?.data?.weeklySummary?.[0]
              ?.timeSpentThisWeek || 0,
            2
          )}
        />
      </Card>
      <Card title={'Time Logs'}>
        <div className="gx-d-flex gx-justify-content-between gx-flex-row">
          <Form layout="inline">
            <FormItem>
              <RangePicker
                handleChangeDate={handleChangeDate}
                date={date}
                disabledDate={disabledAfterToday}
              />
            </FormItem>
            <FormItem className="direct-form-item">
              <Select
                onChange={handleOptionChange}
                value={dateFilter}
                options={attendanceFilter}
              />
            </FormItem>
            <FormItem className="direct-form-item">
              <Select
                placeholderClass={PLACE_HOLDER_CLASS}
                placeholder="Search Co-worker"
                onChange={handleUserChange}
                value={user}
                options={users?.data?.data?.data?.map((x) => ({
                  id: x._id,
                  value: x.name,
                }))}
              />
            </FormItem>

            <FormItem className="direct-form-item">
              <Select
                placeholderClass={PLACE_HOLDER_CLASS}
                placeholder="Log Type"
                value={logType}
                onChange={handlelogTypeChange}
                options={logTypes?.data?.data?.data.map((x) => ({
                  id: x?._id,
                  value: x?.name,
                }))}
              />
            </FormItem>

            <FormItem>
              <Button
                className="gx-btn gx-btn-primary gx-text-white "
                onClick={handleReset}
              >
                Reset
              </Button>
            </FormItem>
          </Form>
        </div>

        <Table
          locale={{emptyText}}
          className="gx-table-responsive"
          columns={OTHER_LOGTIMES_COLUMNS(
            sort,
            handleOpenEditModal,
            confirmDelete,
            undefined,
            permission
          )}
          dataSource={formattedLogs(logTimeDetails?.data?.data?.data)}
          onChange={handleTableChange}
          pagination={{
            current: page.page,
            pageSize: page.limit,
            pageSizeOptions: ['25', '50', '100'],
            showSizeChanger: true,
            total: logTimeDetails?.data?.data?.count || 1,
            onShowSizeChange,
            hideOnSinglePage: logTimeDetails?.data?.data?.count ? false : true,
            onChange: handlePageChange,
          }}
          loading={
            timeLogFetching ||
            deleteLogMutation.isLoading ||
            todayLoading ||
            weeklyLoading
          }
        />
      </Card>
    </div>
  )
}

export default OtherLogTime
