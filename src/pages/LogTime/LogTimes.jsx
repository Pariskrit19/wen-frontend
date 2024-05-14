import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Card, Table, Button} from 'antd'
import CircularProgress from 'components/Elements/CircularProgress'
import LogModal from 'components/Modules/LogtimeModal'
import '@ant-design/compatible/assets/index.css'
import {LOGTIMES_COLUMNS} from 'constants/logTimes'
import {
  changeDate,
  roundedToFixed,
  handleResponse,
  getIsAdmin,
  sortTableDatas,
} from 'helpers/utils'
import {notification} from 'helpers/notification'
import moment from 'moment'
import React, {useRef, useState} from 'react'
import {
  addUserTimeLog,
  deleteTimeLog,
  getLogTypes,
  getTodayTimeLogSummary,
  getWeeklyTimeLogs,
  getWeeklyTimeLogSummary,
  updateTimeLog,
} from 'services/timeLogs'
import TimeSummary from './TimeSummary'
import {useNavigate} from 'react-router-dom'
import {emptyText} from 'constants/EmptySearchAntd'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {socket} from 'pages/Main'
import RoleAccess from 'constants/RoleAccess'

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

function LogTimes() {
  // init hooks
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const idUser = useSelector(selectAuthUser)

  // init states
  const [sort, setSort] = useState({})
  const [page, setPage] = useState({page: 1, limit: 50})
  const [openModal, setOpenModal] = useState(false)
  const [isAdminTimeLog, setIsAdminTimeLog] = useState(false)
  const [timeLogToUpdate, setTimelogToUpdate] = useState({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const projectNameRef = useRef('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userId, setUserId] = useState(
    JSON.parse(localStorage.getItem('user_id'))
  )

  const {
    _id,
    role: {key, permission},
  } = useSelector(selectAuthUser)

  const logPermissions = permission?.[`Log Time`]

  const {
    data: logTimeDetails,
    isLoading: timelogLoading,
    isFetching: timeLogFetching,
  } = useQuery(
    ['UsertimeLogs', page, _id, sort],
    () =>
      getWeeklyTimeLogs({
        ...page,
        user: _id,
        sort: sortTableDatas(sort.order, sort.column, sort.field),
      }),
    {keepPreviousData: true}
  )

  const {data: todayTimeSpent, isLoading: todayLoading} = useQuery(
    ['userTodayTimeSpent', userId],
    () => getTodayTimeLogSummary(userId)
  )
  const {data: weeklyTimeSpent, isLoading: weeklyLoading} = useQuery(
    ['userweeklyTimeSpent', userId],
    () => getWeeklyTimeLogSummary(userId)
  )
  const addLogTimeMutation = useMutation((details) => addUserTimeLog(details), {
    onSuccess: (response) => {
      if (
        response?.data?.data?.data?.isOt &&
        response?.data?.data?.data?.otStatus === 'P'
      ) {
        socket.emit('ot-log', {
          showTo: [RoleAccess.Admin],
          remarks: `${idUser?.name} has added OT logtime for project ${projectNameRef.current}. Please review.`,
          extraInfo: JSON.stringify({
            userId: idUser?._id,
            project: [
              {
                _id: response?.data?.data?.data?.project,
                name: projectNameRef.current,
              },
            ],
          }),
          module: 'Logtime',
        })
      }
      handleResponse(
        response,
        'Added time log successfully',
        'Could not add time log',
        [
          () => queryClient.invalidateQueries(['UsertimeLogs']),
          () => queryClient.invalidateQueries(['userTodayTimeSpent']),
          () => queryClient.invalidateQueries(['userweeklyTimeSpent']),
          () => handleCloseTimelogModal(),
        ]
      )
    },
    onError: (error) => {
      notification({message: 'Could not add time log!', type: 'error'})
    },
    onSettled: () => {
      setIsSubmitted(false)
    },
  })
  const UpdateLogTimeMutation = useMutation(
    (details) => updateTimeLog(details),
    {
      onSuccess: (response) => {
        if (
          response?.data?.data?.data?.isOt &&
          response?.data?.data?.data?.otStatus === 'P'
        ) {
          socket.emit('ot-log', {
            showTo: [RoleAccess.Admin],
            remarks: `${idUser?.name} has added OT logtime for project ${projectNameRef.current}. Please review.`,
            module: 'Logtime',
            extraInfo: JSON.stringify({
              userId: idUser?._id,
              project: [
                {
                  _id: response?.data?.data?.data?.project?._id,
                  name: projectNameRef.current,
                },
              ],
            }),
          })
        }
        handleResponse(
          response,
          'Updated time log successfully',
          'Could not update time log',
          [
            () => queryClient.invalidateQueries(['UsertimeLogs']),
            () => queryClient.invalidateQueries(['userTodayTimeSpent']),
            () => queryClient.invalidateQueries(['userweeklyTimeSpent']),
            () => handleCloseTimelogModal(),
          ]
        )
      },
      onError: (error) => {
        notification({message: 'Could not update time log!', type: 'error'})
      },
      onSettled: () => {
        setIsSubmitted(false)
      },
    }
  )

  const navigateToProjectLogs = (url) => {
    navigate(url, {replace: true})
  }

  const {data: logTypes} = useQuery(['logTypes'], () => getLogTypes())

  const deleteLogMutation = useMutation((logId) => deleteTimeLog(logId), {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Deleted time log successfully',
        'Could not delete time log',
        [
          () => queryClient.invalidateQueries(['UsertimeLogs']),
          () => queryClient.invalidateQueries(['userTodayTimeSpent']),
          () => queryClient.invalidateQueries(['userweeklyTimeSpent']),
          () => {
            socket.emit('CUD')
          },
        ]
      ),
    onError: (error) => {
      notification({message: 'Could not delete time log!', type: 'error'})
    },
  })

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
    if (readOnly) {
      setIsReadOnly(true)
    }
  }

  const handleCloseTimelogModal = () => {
    setOpenModal(false)
    setTimelogToUpdate({})
    setIsEditMode(false)
    setIsAdminTimeLog(false)
    setIsReadOnly(false)
  }

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleOpenCoworkersModal = () => {
    setOpenModal(true)
    setIsAdminTimeLog(true)
  }

  const handleLogTypeSubmit = (newLogtime) => {
    projectNameRef.current = newLogtime?.projectName
    let formattedNewLogtime = {
      ...newLogtime,
      hours: +newLogtime.hours,
      logDate: moment.utc(newLogtime.logDate).format(),
      minutes: +newLogtime.minutes,
      otStatus: isAdminTimeLog
        ? newLogtime?.isOt
          ? 'A'
          : undefined
        : newLogtime?.otStatus || (newLogtime?.isOt ? 'P' : undefined),
    }
    if (!isAdminTimeLog) {
      formattedNewLogtime = {...formattedNewLogtime, user: idUser?._id}
    }
    if (isEditMode)
      UpdateLogTimeMutation.mutate({
        id: formattedNewLogtime.id,
        details: {
          ...formattedNewLogtime,
          user: newLogtime.user,
        },
      })
    else addLogTimeMutation.mutate(formattedNewLogtime)
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
          loading={
            addLogTimeMutation.isLoading ||
            UpdateLogTimeMutation.isLoading ||
            isSubmitted
          }
          logTypes={logTypes}
          initialValues={timeLogToUpdate}
          isEditMode={isEditMode}
          isUserLogtime={true}
          isAdminTimeLog={isAdminTimeLog}
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
        <div className="gx-f-flex gx-flex-row gx-column-gap-10">
          {logPermissions?.createLogTime && (
            <div className="components-table-demo-control-bar">
              <div className="gx-d-flex gx-justify-content-between gx-flex-row">
                <Button
                  className="gx-btn-form gx-btn-primary gx-text-white gx-mt-auto"
                  onClick={handleOpenModal}
                  disabled={getIsAdmin()}
                >
                  Add New Log Time
                </Button>
              </div>
            </div>
          )}
          {logPermissions?.createUserLogTime && (
            <Button
              className="gx-btn gx-btn-primary gx-text-white "
              onClick={handleOpenCoworkersModal}
              // onClick={handleOpenModal}
              style={{marginBottom: '16px'}}
              disabled={getIsAdmin()}
            >
              Add New Co-worker Log Time
            </Button>
          )}
        </div>
        <Table
          locale={{emptyText}}
          className="gx-table-responsive"
          columns={LOGTIMES_COLUMNS(
            sort,
            handleOpenEditModal,
            confirmDelete,
            true,
            undefined,
            permission,
            navigateToProjectLogs
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

export default LogTimes
