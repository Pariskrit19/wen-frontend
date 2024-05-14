import {Button, Card, Form, Input, Table} from 'antd'
import React, {useState, useCallback, useEffect} from 'react'
import {emptyText} from 'constants/EmptySearchAntd'
import {OVERTIME_COLUMNS, OT_STATUS} from 'constants/Overtime'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {
  MuiFormatDate,
  changeDate,
  filterOptions,
  handleResponse,
  sortTableDatas,
} from 'helpers/utils'
import {
  getAllTimeLogs,
  getOtherTimeLogTotal,
  updateTimeLog,
} from 'services/timeLogs'
import OvertimeApproveReasonModal from 'components/Modules/OvertimeApproveReasonModal'
import {getAllUsers} from 'services/users/userDetails'
import Select from 'components/Elements/Select'
import {debounce} from 'helpers/utils'
import {getAllProjects} from 'services/projects'
import {LOG_STATUS} from 'constants/logTimes'
import RangePicker from 'components/Elements/RangePicker'
import {PLACE_HOLDER_CLASS} from 'constants/Common'
import {socket} from 'pages/Main'
import {notification} from 'helpers/notification'
import {dateToDateFormat} from 'helpers/utils'
import moment from 'moment'
import {useLocation} from 'react-router'

const formattedReports = (overtimeData) => {
  return overtimeData?.map((log) => ({
    ...log,
    key: log?._id,
    logType: log?.logType?.name,
    logDate: changeDate(log?.logDate),
    user: log?.user?.name,
    project: log?.project?.name || 'Other',
    slug: log?.project?.slug,
    projectId: log?.project?.id,
    remarks: log?.remarks,
    otStatus: LOG_STATUS[log?.otStatus],
  }))
}

const FormItem = Form.Item

const OvertimePage = () => {
  const location = useLocation()
  const {userId: otAuthorId, project: projectIdLocation} =
    location?.state?.extraData || {}
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [sort, setSort] = useState({})
  const [page, setPage] = useState({page: 1, limit: 50})
  const [openOvertimeModal, setOpenOvertimeModal] = useState(false)
  const [approveDetails, setApproveDetails] = useState({})
  const [isViewOnly, setIsViewOnly] = useState(false)
  const [readOnlyApproveReason, setReadonlyApproveReason] = useState('')
  const [author, setAuthor] = useState(otAuthorId)
  const [otStatus, setOtStatus] = useState('')
  const [projectData, setProjectData] = useState(projectIdLocation || [])
  const [project, setProject] = useState(
    projectIdLocation?.[0]?._id || undefined
  )
  const [rangeDate, setRangeDate] = useState(undefined)

  const allUsers = useQuery(['users'], () => getAllUsers({sort: 'name'}))

  useEffect(() => {
    if (otAuthorId) {
      setAuthor(otAuthorId)
    }
  }, [otAuthorId])

  const {
    data: logTimeDetails,
    isLoading: timelogLoading,
    isFetching: timeLogFetching,
  } = useQuery(
    ['timeLogs', page, sort, otStatus, author, project, rangeDate],
    () =>
      getAllTimeLogs({
        ...page,
        isOt: true,
        user: author,
        project: project,
        otStatus: otStatus ? otStatus : undefined,
        fromDate: rangeDate?.[0]
          ? MuiFormatDate(rangeDate[0].format()) + 'T00:00:00Z'
          : '',
        toDate: rangeDate?.[1]
          ? MuiFormatDate(rangeDate[1]?.format()) + 'T23:59:59Z'
          : '',
        sort: sortTableDatas(sort.order, sort.column, sort.field),
      })
  )

  const {
    data: totalTime,
    isLoading: totalLoading,
    isFetching: totalFetching,
  } = useQuery(['timeLogs', author, rangeDate, otStatus, project], () =>
    getOtherTimeLogTotal({
      project: project,
      otStatus: otStatus ? otStatus : undefined,
      user: author,
      fromDate: rangeDate?.[0]
        ? MuiFormatDate(rangeDate[0].format()) + 'T00:00:00Z'
        : '',
      toDate: rangeDate?.[1]
        ? MuiFormatDate(rangeDate[1]?.format()) + 'T23:59:59Z'
        : '',
    })
  )

  const UpdateLogTimeMutation = useMutation(
    (details) => updateTimeLog(details),
    {
      onSuccess: (response) => {
        handleResponse(
          response,
          'Updated time log successfully',
          'Could not update time log',
          [
            () => queryClient.invalidateQueries(['timeLogs']),
            () => handleCloseApproveModal(),
            () => {
              socket.emit('resolve-ot-log', {
                showTo: [response.data.data.data.user._id],
                remarks: `Your OT has been ${
                  LOG_STATUS[response.data?.data?.data?.otStatus]
                } for project ${
                  response?.data?.data?.data?.project?.name || 'Other'
                }.`,
                module: 'Logtime',
              })
            },
          ]
        )
      },
      onError: (error) => {
        handleCloseApproveModal()
        notification({
          message: 'Could not approve overtime report',
          type: 'error',
        })
      },
    }
  )

  const handleCloseApproveModal = () => {
    setOpenOvertimeModal(false)
    setIsViewOnly(false)
    setReadonlyApproveReason('')
  }

  const handleRejectOvertime = (reject) => {
    const rejectReason = reject?.overtimeApproveReason
    UpdateLogTimeMutation.mutate({
      id: reject?._id,
      details: {
        otRejectReason: rejectReason,
        otStatus: 'R',
        logDate: dateToDateFormat(reject?.logDate),
      },
    })
  }

  const handleApprove = (data) => {
    UpdateLogTimeMutation.mutate({
      id: data?._id,
      details: {
        otStatus: 'A',
        logDate: dateToDateFormat(data?.logDate),
      },
    })
  }

  const handleOpenRejectModal = (record) => {
    setApproveDetails(record)
    setOpenOvertimeModal(true)
  }

  const handleOpenViewModal = (details) => {
    setReadonlyApproveReason(details?.otRejectReason)
    setIsViewOnly(true)
    setOpenOvertimeModal(true)
  }

  const handleSearch = async (projectName) => {
    if (!projectName) {
      setProjectData([])
      return
    } else {
      const projects = await getAllProjects({
        project: projectName,
        sort: 'name',
      })
      setProjectData(projects?.data?.data?.data)
    }
  }
  const optimizedFn = useCallback(debounce(handleSearch, 100), [])

  const handleProjectChange = (ProjectId) => {
    setProject(ProjectId)
  }

  const handleAuthorChange = (logAuthor) => {
    setAuthor(logAuthor)
    setPage({page: 1, limit: 50})
  }

  const handleStatusChange = (status) => {
    if (!status) {
      setOtStatus('')
    } else {
      setOtStatus(status)
    }
    setPage({page: 1, limit: 50})
  }

  const handleResetFilter = () => {
    setProject(undefined)
    setOtStatus('')
    setAuthor(undefined)
    setRangeDate(undefined)
    setPage({page: 1, limit: 50})
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

  const handleChangeDate = (date) => {
    setRangeDate(date)
  }

  return (
    <Card title="Overtime Report">
      <OvertimeApproveReasonModal
        open={openOvertimeModal}
        onClose={handleCloseApproveModal}
        onSubmit={handleRejectOvertime}
        approveDetails={approveDetails}
        approveReason={readOnlyApproveReason}
        loader={UpdateLogTimeMutation?.isLoading}
        title={isViewOnly ? 'Overtime Reject Reason' : 'Overtime  Reject'}
        isRequired={isViewOnly ? false : true}
        label={isViewOnly ? 'Reason' : 'Reject reason'}
        isReadOnly={isViewOnly}
      />

      <div className="overtime-hour">
        <Form layout="inline" form={form}>
          <FormItem>
            <RangePicker handleChangeDate={handleChangeDate} date={rangeDate} />
          </FormItem>
          <FormItem className="direct-form-item">
            <Select
              placeholderClass={PLACE_HOLDER_CLASS}
              placeholder="Select Project"
              onChange={handleProjectChange}
              value={project}
              handleSearch={optimizedFn}
              options={[
                ...(projectData || []),
                {_id: process.env.REACT_APP_OTHER_PROJECT_ID, name: 'Other'},
              ]?.map((x) => ({
                ...x,
                id: x._id,
                value: x.name,
              }))}
              inputSelect
            />
          </FormItem>
          <FormItem className="direct-form-item">
            <Select
              placeholderClass={PLACE_HOLDER_CLASS}
              showSearch
              filterOption={filterOptions}
              placeholder="Select Log Author"
              onChange={handleAuthorChange}
              value={author}
              options={allUsers?.data?.data?.data?.data?.map((user) => ({
                id: user._id,
                value: user.name,
              }))}
            />
          </FormItem>
          <FormItem className="direct-form-item">
            <Select
              placeholderClass={PLACE_HOLDER_CLASS}
              showSearch
              filterOption={filterOptions}
              placeholder="Select OT Status"
              onChange={handleStatusChange}
              value={otStatus}
              emptyAll={true}
              options={OT_STATUS?.map((x) => ({
                id: x.id,
                value: x.value,
              }))}
            />
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

        <FormItem className="overtime-total-hour">
          <Input
            defaultValue="Total OT hour"
            disabled={true}
            style={{width: '120px', fontWeight: '500'}}
          />
          <Input
            value={
              timelogLoading
                ? 'Calculating...'
                : `${totalTime?.data?.data?.data?.[0]?.totalHour ?? 0} ${
                    totalTime?.data?.data?.data?.[0]?.totalHour > 0
                      ? 'hrs'
                      : 'hr'
                  }`
            }
            style={{width: '100px', marginLeft: '5px'}}
            disabled
          />
        </FormItem>
      </div>

      <Table
        locale={{emptyText}}
        className="gx-table-responsive"
        columns={OVERTIME_COLUMNS({
          sort,
          handleApprove,
          handleOpenViewModal,
          handleOpenRejectModal,
        })}
        dataSource={formattedReports(logTimeDetails?.data?.data?.data)}
        onChange={handleTableChange}
        pagination={{
          current: page.page,
          pageSize: page.limit,
          pageSizeOptions: ['25', '50', '100'],
          showSizeChanger: true,
          total: logTimeDetails?.data?.data?.count || 1,
          onShowSizeChange,
          hideOnSinglePage: true,
          onChange: handlePageChange,
        }}
        loading={
          timelogLoading || timeLogFetching || UpdateLogTimeMutation?.isLoading
        }
      />
    </Card>
  )
}

export default OvertimePage
