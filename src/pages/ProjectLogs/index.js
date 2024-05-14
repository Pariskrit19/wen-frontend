import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import '@ant-design/compatible/assets/index.css'
import {Card, Table, Select, Button, Form, Checkbox} from 'antd'
import CircularProgress from 'components/Elements/CircularProgress'
import LogTimeModal from 'components/Modules/LogtimeModal'
import {LOGTIMES_COLUMNS} from 'constants/logTimes'
import {
  changeDate,
  filterOptions,
  roundedToFixed,
  handleResponse,
  getIsAdmin,
  sortTableDatas,
} from 'helpers/utils'
import {notification} from 'helpers/notification'
import moment from 'moment'
import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {getProject} from 'services/projects'
import {
  addLogTime,
  deleteTimeLog,
  getAllTimeLogs,
  getLogTypes,
  getTimelogAuthors,
  getTotalLogHoursOfAProject,
  updateTimeLog,
  WeeklyProjectTimeLogSummary,
} from 'services/timeLogs'
import LogsBreadCumb from './LogsBreadCumb'
import TimeSummary from './TimeSummary'
import ProjectModal from 'components/Modules/ProjectModal'
import {emptyText} from 'constants/EmptySearchAntd'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import LogHoursModal from './LogHours'
import {socket} from 'pages/Main'
import {PAGE50} from 'constants/Common'
import RoleAccess from 'constants/RoleAccess'

const Option = Select.Option
const FormItem = Form.Item

const formattedLogs = (logs) => {
  return logs?.map((log) => ({
    ...log,
    key: log?._id,
    logType: log?.logType?.name,
    logDate: changeDate(log?.logDate),
    user: log?.user?.name,
  }))
}

function ProjectLogs() {
  // init hooks
  const {slug} = useParams()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  // init states
  const [sort, setSort] = useState({})
  const [logType, setLogType] = useState(undefined)
  const [author, setAuthor] = useState(undefined)
  const [openModal, setOpenModal] = useState(false)
  const [page, setPage] = useState(PAGE50)
  const [timeLogToUpdate, setTimelogToUpdate] = useState({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [userRecord, setUserRecord] = useState({})
  const [totalHours, setTotalHours] = useState(0)
  const [openLogHoursModal, setOpenLogHoursModal] = useState(false)
  const [selectedLogsIds, setSelectedLogsIds] = useState([])
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false)
  const [notSelectedLogIds, setNotSelectedLogIds] = useState([])
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  //fot the checkbox state
  const [isChecked, setIsChecked] = useState({
    checked: false,
    indeterminate: false,
  })
  const [projectId] = slug.split('-')
  const {
    _id: userId,
    name,
    role: {permission, key},
  } = useSelector(selectAuthUser)

  const logPermissions = permission?.['Log Time']

  const {data: projectDetail, refetch: fetchProject} = useQuery(
    ['singleProject', projectId],
    () => getProject(projectId),
    {
      enabled: false,
    }
  )

  const {data: logTypes} = useQuery(['logTypes', projectId], () =>
    getLogTypes()
  )

  const {data: authors} = useQuery(['timelogAuthors'], () =>
    getTimelogAuthors(projectId)
  )
  const {refetch, isFetching: totalLogHoursLoading} = useQuery(
    ['totalLogHours'],
    () =>
      getTotalLogHoursOfAProject(
        projectId,
        author,
        logType,
        notSelectedLogIds,
        selectedLogsIds,
        isSelectAllChecked
      ),
    {
      enabled: false,
      onSuccess: (res) => {
        if (res.status) {
          setOpenLogHoursModal(true)
          setTotalHours(res?.data?.data.count)
        }
      },
    }
  )
  const {
    data: logTimeDetails,
    isLoading: timelogLoading,
    isFetching: timeLogFetching,
    refetch: LogTimeRefetch,
  } = useQuery(
    ['timeLogs', page, projectId, logType, author, sort, isSelectAllChecked],
    () =>
      getAllTimeLogs({
        page: null,
        limit: null,
        logType,
        project: projectId,
        user: author,
        sort: sortTableDatas(sort.order, sort.column, sort.field),
      }),
    {
      keepPreviousData: true,
      onSuccess: (res) => {
        if (isSelectAllChecked) {
          const timelogs = res?.data?.data?.data.map((log) => log._id)
          setSelectedLogsIds((prev) => {
            const filteredTimeLog = prev.filter((x) => timelogs.includes(x))
            return filteredTimeLog
          })
        }
      },
    }
  )

  // for Select All Table Data
  const DATA = logTimeDetails?.data?.data?.data
  useEffect(() => {
    if (isSelectAllChecked && DATA?.length && notSelectedLogIds.length === 0) {
      setSelectedLogsIds(DATA?.map((d) => d?._id))
    }
  }, [DATA])

  //update checkbox state based on current data
  useEffect(() => {
    if (
      selectedLogsIds?.length > 0 &&
      (selectedLogsIds?.length < DATA?.length ||
        selectedLogsIds?.length === DATA?.length)
    ) {
      setIsChecked({
        ...isChecked,
        checked:
          DATA?.length === 0 ? false : selectedLogsIds?.length === DATA?.length,
        indeterminate: selectedLogsIds?.length < DATA?.length,
      })
    }
    if (selectedLogsIds?.length === 0) {
      setIsChecked({
        ...isChecked,
        checked: false,
        indeterminate: false,
      })
    }
    if (selectedLogsIds?.length > DATA?.length) {
      setIsChecked({
        ...isChecked,
        checked: selectedLogsIds?.length === DATA?.length,
        indeterminate: selectedLogsIds?.length < DATA?.length,
      })
    }
  }, [DATA, selectedLogsIds])

  const {
    data: projectTimeSpent,
    isLoading: projectTimeLoading,
    refetch: timeSpentThisWeekRefetch,
  } = useQuery(
    ['projectWeeklyTime', projectId],
    () => WeeklyProjectTimeLogSummary(projectId),
    {
      onSettled: (res) => {
        fetchProject()
      },
    }
  )

  const addLogTimeMutation = useMutation((details) => addLogTime(details), {
    onSuccess: (response) => {
      if (
        response?.data?.data?.data?.isOt &&
        response?.data?.data?.data?.otStatus === 'P'
      ) {
        socket.emit('ot-log', {
          showTo: [RoleAccess.Admin],
          remarks: `${name} has added OT logtime for project ${projectSlug}. Please review.`,
          module: 'Logtime',
          extraInfo: JSON.stringify({
            userId,
            project: [
              {_id: response?.data?.data?.data?.project, name: projectSlug},
            ],
          }),
        })
      }
      handleResponse(
        response,
        'Added time log successfully',
        'Could not add time log',
        [
          () => queryClient.invalidateQueries(['timeLogs']),
          () => queryClient.invalidateQueries(['projectWeeklyTime']),
          () => handleCloseTimelogModal(),
        ]
      )
    },

    onError: () =>
      notification({
        message: 'Could not add time log!',
        type: 'error',
      }),

    onSettled: () => {
      setIsSubmitted(false)
    },
  })

  const UpdateLogTimeMutation = useMutation(
    (details) => updateTimeLog(details),
    {
      onSuccess: (response) => {
        let temp = response?.data?.data?.data

        if (
          response?.data?.data?.data?.isOt &&
          response?.data?.data?.data?.otStatus === 'P'
        ) {
          socket.emit('ot-log', {
            showTo: [RoleAccess.Admin],
            remarks: `${name} has added OT logtime for project ${projectSlug}. Please review.`,
            module: 'Logtime',
            extraInfo: JSON.stringify({
              userId,
              project: [
                {
                  _id: response?.data?.data?.data?.project?._id,
                  name: projectSlug,
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
            () => queryClient.invalidateQueries(['timeLogs']),
            () => queryClient.invalidateQueries(['projectWeeklyTime']),
            () => handleCloseTimelogModal(),
          ]
        )
      },

      onError: () =>
        notification({
          message: 'Could not update time log!',
          type: 'error',
        }),
      onSettled: () => {
        setIsSubmitted(false)
      },
    }
  )

  const deleteLogMutation = useMutation((logId) => deleteTimeLog(logId), {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Deleted successfully',
        'Could not delete time log',
        [
          () => queryClient.invalidateQueries(['timeLogs']),
          () => queryClient.invalidateQueries(['projectWeeklyTime']),
          () => {
            socket.emit('CUD')
          },
        ]
      ),

    onError: () =>
      notification({
        message: 'Could not delete time log!',
        type: 'error',
      }),
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

  const handlelogTypeChange = (log) => {
    setLogType(log)
    setPage(PAGE50)

    if (!log) {
      setIsSelectAllChecked(false)
    }
  }

  const handleAuthorChange = (logAuthor) => {
    setAuthor(logAuthor)
    setPage(PAGE50)
    if (!logAuthor) {
      setIsSelectAllChecked(false)
    }
  }

  const handleResetFilter = () => {
    setLogType(undefined)
    setAuthor(undefined)
    setNotSelectedLogIds([])
    setSelectedLogsIds([])
    setIsChecked({isChecked: false, inde: false})
    setIsSelectAllChecked(false)
  }
  const handleOpenEditModal = (log, readOnly) => {
    setIsSelectAllChecked(false)
    const originalTimelog = logTimeDetails?.data?.data?.data.find(
      (project) => project.id === log.id
    )
    setTimelogToUpdate({
      ...log,
      logDate: originalTimelog?.logDate,
      logType: originalTimelog?.logType,
      user: originalTimelog?.user,
      isOt: originalTimelog?.isOt,
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

  const confirmDelete = (log) => {
    deleteLogMutation.mutate(log._id)
  }

  const handleLogTypeSubmit = (newLogtime, reset) => {
    const formattedNewLogtime = {
      ...newLogtime,
      hours: +newLogtime.hours,
      logDate: moment.utc(newLogtime.logDate).format(),
      minutes: +newLogtime.minutes,
      otStatus: newLogtime?.otStatus || (newLogtime?.isOt ? 'P' : undefined),
      totalHours: +newLogtime.hours + +newLogtime.minutes / 60,
    }
    if (isEditMode)
      UpdateLogTimeMutation.mutate({
        id: formattedNewLogtime.id || formattedNewLogtime._id,
        details: {
          ...formattedNewLogtime,
          project: newLogtime.project._id,
          user: newLogtime.user,
        },
      })
    else
      addLogTimeMutation.mutate({
        id: projectId,
        details: formattedNewLogtime,
      })
  }

  const {
    designers,
    devOps,
    developers,
    qa,
    estimateHistory,
    weeklyTimeSpent,
    totalTimeSpent,
    name: projectSlug,
  } = projectDetail?.data?.data?.data?.[0] || {}

  const logAuthors = authors?.data?.data?.authors
  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleOpenLogHoursModal = () => {
    if (isSelectAllChecked) {
      LogTimeRefetch()
      fetchProject()
      timeSpentThisWeekRefetch()
    }
    refetch()
  }
  const handleCloseLogHoursModal = () => {
    setOpenLogHoursModal(false)
  }
  const handleRowSelect = (record, isSelected) => {
    if (isSelectAllChecked) {
      if (isSelected) {
        setNotSelectedLogIds((prev) => prev.filter((id) => id !== record._id))
      } else {
        setNotSelectedLogIds((prev) => [...prev, record._id])
      }
    }
    if (isSelected) {
      setSelectedLogsIds((prev) => [...prev, record._id])
    } else {
      setSelectedLogsIds((prev) => prev.filter((x) => x !== record._id))
    }
  }

  const handleAllRowSelect = (selected) => {
    if (!selected) {
      setSelectedLogsIds([])
    } else {
      setNotSelectedLogIds([])
      setSelectedLogsIds((prev) => {
        const newIds = DATA?.map((row) => row?._id).filter(
          (id) => !prev.includes(id)
        )
        return [...prev, ...newIds]
      })
    }
    if (DATA?.length) setIsSelectAllChecked(selected)
  }
  const handleOpenViewModal = () => {
    const detailDatas = projectDetail?.data?.data?.data[0]
    setUserRecord({
      id: detailDatas.id,
      project: detailDatas,
    })
    setOpenViewModal(true)
  }

  const handleCloseModal = () => {
    setOpenViewModal((prev) => !prev)
  }

  const headerCheckbox = (
    <Checkbox
      checked={isChecked?.checked}
      indeterminate={isChecked?.indeterminate}
      onChange={(e) => handleAllRowSelect(e?.target?.checked)}
    />
  )
  if (timelogLoading) {
    return <CircularProgress />
  }
  const estimatedHour =
    estimateHistory?.length > 0 ? estimateHistory.at(-1).estimatedHours : 0
  return (
    <div>
      {openViewModal && (
        <ProjectModal
          toggle={openViewModal}
          onClose={handleCloseModal}
          initialValues={userRecord?.project}
          isEditMode={true}
          readOnly={true}
          isFromLog={true}
        />
      )}

      {openModal && (
        <LogTimeModal
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
          role={key}
          isReadOnly={isReadOnly}
          setIsSubmitted={setIsSubmitted}
          permission={permission}
        />
      )}
      {openLogHoursModal && (
        <LogHoursModal
          toggle={openLogHoursModal}
          onClose={handleCloseLogHoursModal}
          totalHours={totalHours}
        />
      )}

      <LogsBreadCumb slug={projectSlug} />
      <div style={{marginTop: 20}}></div>
      <Card title={projectSlug + ' Time Summary'}>
        <TimeSummary
          est={roundedToFixed(estimatedHour || 0, 2)}
          ts={roundedToFixed(totalTimeSpent || 0, 2)}
          tsw={roundedToFixed(
            projectTimeSpent?.data?.data?.weeklySummary[0]?.timeSpentThisWeek ||
              0,
            2
          )}
        />
      </Card>
      <Card title={projectSlug + ' Logs'}>
        <div className="components-table-demo-control-bar">
          <div className="gx-d-flex gx-justify-content-between gx-flex-row">
            <Form layout="inline" form={form}>
              <FormItem className="direct-form-item">
                <Select
                  notFoundContent={emptyText}
                  showSearch
                  filterOption={filterOptions}
                  placeholder="Select Log Type"
                  onChange={handlelogTypeChange}
                  value={logType}
                  allowClear
                >
                  {logTypes &&
                    logTypes.data?.data?.data?.map((type) => (
                      <Option value={type._id} key={type._id}>
                        {type.name}
                      </Option>
                    ))}
                </Select>
              </FormItem>
              <FormItem className="direct-form-item">
                <Select
                  notFoundContent={emptyText}
                  showSearch
                  filterOption={filterOptions}
                  placeholder="Select Log Author"
                  onChange={handleAuthorChange}
                  value={author}
                  allowClear
                >
                  {logAuthors &&
                    logAuthors?.map((status) => (
                      <Option value={status._id} key={status._id}>
                        {status.name}
                      </Option>
                    ))}
                </Select>
              </FormItem>

              <FormItem style={{marginBottom: '0.8rem'}}>
                <Button
                  className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                  onClick={handleResetFilter}
                >
                  Reset
                </Button>
              </FormItem>
            </Form>
            <div>
              <Button
                className="gx-btn gx-btn-primary gx-text-white "
                onClick={handleOpenLogHoursModal}
                style={{marginBottom: '16px'}}
                disabled={selectedLogsIds?.length === 0 || totalLogHoursLoading}
              >
                {totalLogHoursLoading ? 'Calculating...' : 'Calculate Hours'}
              </Button>
              {permission?.Projects?.viewProjects && (
                <Button
                  className="gx-btn gx-btn-primary gx-text-white "
                  onClick={handleOpenViewModal}
                  style={{marginBottom: '16px'}}
                >
                  View Project
                </Button>
              )}
              {logPermissions?.createLogTime && (
                <Button
                  className="gx-btn gx-btn-primary gx-text-white "
                  onClick={handleOpenModal}
                  style={{marginBottom: '16px'}}
                  disabled={getIsAdmin()}
                >
                  Add New TimeLog
                </Button>
              )}
            </div>
          </div>
        </div>
        <Table
          locale={{emptyText}}
          className="gx-table-responsive"
          columns={LOGTIMES_COLUMNS(
            sort,
            handleOpenEditModal,
            confirmDelete,
            false,
            name,
            permission
          )}
          dataSource={formattedLogs(logTimeDetails?.data?.data?.data)}
          onChange={handleTableChange}
          rowSelection={{
            onSelect: handleRowSelect,
            selectedRowKeys: selectedLogsIds,
            hideSelectAll: !permission?.[`Log Time`]?.selectAllLogTime,
            columnTitle: headerCheckbox,
          }}
          pagination={{
            current: page.page,
            pageSize: page.limit,
            pageSizeOptions: ['50', '80', '100'],
            showSizeChanger: true,
            total: logTimeDetails?.data?.data?.count || 1,
            onShowSizeChange,
            hideOnSinglePage: logTimeDetails?.data?.data?.count ? false : true,
            onChange: handlePageChange,
          }}
          loading={timeLogFetching || deleteLogMutation.isLoading}
        />
      </Card>
    </div>
  )
}

export default ProjectLogs
