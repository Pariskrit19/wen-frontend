import React, {useEffect, useMemo, useState, useCallback} from 'react'
import {useQuery} from '@tanstack/react-query'
import moment from 'moment'
import {Card, Table, Form, Button, DatePicker} from 'antd'
import CircularProgress from 'components/Elements/CircularProgress'
import {
  getAllProjects,
  getProjectClients,
  getProjectStatus,
} from 'services/projects'
import {useNavigate} from 'react-router-dom'
import {notification} from 'helpers/notification'
import {getLogTypes, getWeeklyReport} from 'services/timeLogs'
import Select from 'components/Elements/Select'
import {WEEKLY_REPORT_COLUMNS} from 'constants/weeklyReport'
import {MuiFormatDate, debounce, roundedToFixed} from 'helpers/utils'
import useWindowsSize from 'hooks/useWindowsSize'
import {emptyText} from 'constants/EmptySearchAntd'
import {PAGE50} from 'constants/Common'
import {disabledAfterToday} from 'util/antDatePickerDisabled'
import {
  LastWeekState,
  attendanceFilter,
  attendanceFilterWithLastWeek,
  intialDate,
  monthlyState,
  weeklyState,
} from 'constants/Attendance'

const {RangePicker} = DatePicker
const FormItem = Form.Item

const formattedWeeklyReports = (reports, clients) => {
  return reports?.map((report) => ({
    key: report?.project?.[0]?._id || 'Other',
    name: report?.project?.[0]?.name || 'Other',
    client: clients?.[report?.project?.[0]?.client] || '',
    timeSpent: roundedToFixed(report?.timeSpent || 0, 2),
  }))
}

function WeeklyReport() {
  // init states
  const [sort, setSort] = useState({
    columnKey: 'name',
    field: 'name',
    order: 'ascend',
  })
  const [page, setPage] = useState({page: 1, limit: 50})
  const [projectStatus, setProjectStatus] = useState(undefined)
  const [projectArray, setProjectArray] = useState([])
  const [project, setProject] = useState(undefined)
  const [logType, setLogType] = useState(undefined)
  const [projectClient, setprojectClient] = useState(undefined)
  const [date, setDate] = useState(weeklyState)
  const [dateFilter, setDateFilter] = useState(
    attendanceFilterWithLastWeek.find((d) => d.id === 2)
  )
  const [form] = Form.useForm()
  const {innerWidth} = useWindowsSize()

  const navigate = useNavigate()

  const {data: logTypesData} = useQuery(['logTypes'], getLogTypes)
  const {data: projectStatusData} = useQuery(
    ['projectStatus'],
    getProjectStatus
  )
  const {data: projectClientsData} = useQuery(
    ['projectClients'],
    getProjectClients
  )
  const {data, isLoading, isError, isFetching} = useQuery(
    ['projects', logType, projectStatus, projectClient, date, project],
    () =>
      getWeeklyReport({
        ...page,
        logType,
        projectStatus,
        client: projectClient,
        fromDate: date?.[0] ? MuiFormatDate(date[0]) + 'T00:00:00Z' : '',
        toDate: date?.[1] ? MuiFormatDate(date[1]) + 'T00:00:00Z' : '',
        project: project,
      }),
    {keepPreviousData: true}
  )

  const handleSearch = async (projectName) => {
    if (!projectName) {
      setProjectArray([])
      return
    } else {
      const projects = await getAllProjects({
        project: projectName,
        sort: 'name',
      })
      setProjectArray(projects?.data?.data?.data)
    }
    //else fetch projects from api
  }

  const optimizedFn = useCallback(debounce(handleSearch, 100), [])

  useEffect(() => {
    if (isError) {
      notification({message: 'Could not load Weekly Report!', type: 'error'})
    }
  }, [isError, data])

  const handleTableChange = (pagination, filters, sorter) => {
    setSort(sorter)
  }

  const handlePageChange = (pageNumber) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const onShowSizeChange = (_, pageSize) => {
    setPage((prev) => ({...prev, limit: pageSize}))
  }

  const handleLogTypeChange = (typeId) => {
    setLogType(typeId)
  }
  const handleProjectNameChange = (projectId) => {
    setProject(projectId)
  }

  const handleProjectStatusChange = (statusId) => {
    setProjectStatus(statusId)
  }

  const handleClientChange = (clientId) => {
    setprojectClient(clientId)
  }

  const handleResetFilter = () => {
    setDate(weeklyState)
    setLogType(undefined)
    setProjectStatus(undefined)
    setprojectClient(undefined)
    setProject(undefined)
    setDateFilter(2)
  }

  const navigateToProjectLogs = (projectSlug, newPage = false) => {
    if (!newPage) {
      navigate(`${projectSlug}`)
    } else {
      window.open(projectSlug, '_blank')
    }
  }

  const handleChangeDate = (date) => {
    setSort({columnKey: 'client', field: 'client', order: 'ascend'})
    setDate([date[0], date[1].endOf('day')])
  }

  const clients = useMemo(() => {
    return projectClientsData?.data?.data?.data?.reduce((obj, client) => {
      obj[client._id] = client?.name
      return obj
    }, {})
  }, [projectClientsData])

  const handleOptionChnageChange = (val) => {
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

      case 4:
        setDate(LastWeekState)
        break

      default:
        break
    }
  }

  if (isLoading) {
    return <CircularProgress />
  }
  return (
    <div>
      <Card title="Weekly Report">
        <div className="components-table-demo-control-bar">
          <div className="gx-d-flex gx-justify-content-between gx-flex-row">
            <Form layout="inline" form={form}>
              <FormItem style={{width: innerWidth <= 748 ? '100%' : 250}}>
                <RangePicker
                  onChange={handleChangeDate}
                  value={date}
                  disabledDate={disabledAfterToday}
                />
              </FormItem>
              <FormItem className="direct-form-item">
                <Select
                  onChange={handleOptionChnageChange}
                  value={dateFilter}
                  options={attendanceFilterWithLastWeek}
                />
              </FormItem>

              <FormItem className="direct-form-item">
                <Select
                  showSearchIcon={true}
                  value={project}
                  onChange={handleProjectNameChange}
                  handleSearch={optimizedFn}
                  placeholder="Search Project"
                  options={(projectArray || [])?.map((project) => ({
                    id: project._id,
                    value: project.name,
                  }))}
                  inputSelect
                />
              </FormItem>
              <FormItem className="direct-form-item">
                <Select
                  placeholder="Select Project Status"
                  onChange={handleProjectStatusChange}
                  value={projectStatus}
                  options={projectStatusData?.data?.data?.data?.map((x) => ({
                    ...x,
                    id: x._id,
                    value: x.name,
                  }))}
                />
              </FormItem>
              <FormItem className="direct-form-item">
                <Select
                  placeholder="Select Log Type"
                  onChange={handleLogTypeChange}
                  value={logType}
                  options={logTypesData?.data?.data?.data?.map((x) => ({
                    ...x,
                    id: x._id,
                    value: x.name,
                  }))}
                />
              </FormItem>
              <FormItem className="direct-form-item">
                <Select
                  placeholder="Select Client"
                  onChange={handleClientChange}
                  value={projectClient}
                  options={projectClientsData?.data?.data?.data?.map((x) => ({
                    ...x,
                    id: x._id,
                    value: x.name,
                  }))}
                />
              </FormItem>
              <FormItem>
                <Button
                  className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                  onClick={handleResetFilter}
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
          columns={WEEKLY_REPORT_COLUMNS(sort, navigateToProjectLogs)}
          dataSource={formattedWeeklyReports(data?.data?.data?.report, clients)}
          onChange={handleTableChange}
          pagination={{
            current: page.page,
            pageSize: page.limit,
            pageSizeOptions: ['25', '50', '100'],
            showSizeChanger: true,
            total: data?.data?.data?.report?.length || 1,
            onShowSizeChange,
            hideOnSinglePage: true,
            onChange: handlePageChange,
          }}
          loading={isLoading || isFetching}
        />
      </Card>
    </div>
  )
}

export default WeeklyReport
