import React, {useEffect, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Button, Card, Form, Table} from 'antd'
import CircularProgress from 'components/Elements/CircularProgress'
import {notification} from 'helpers/notification'
import {emptyText} from 'constants/EmptySearchAntd'
import {getActivityLogs} from 'services/activitLogs'
import {ACTIVITY_LOGS, MODULES, STATUS} from 'constants/activityLogs'
import {
  MuiFormatDate,
  capitalizeInput,
  isoDateWithoutTimeZone,
} from 'helpers/utils'
import RangePicker from 'components/Elements/RangePicker'
import {intialDate} from 'constants/Attendance'
import Select from 'components/Elements/Select'
import moment from 'moment'
import {PAGE50} from 'constants/Common'

const FormItem = Form.Item

const formattedWeeklyReports = (logs: any) => {
  return logs?.map((log: any) => ({
    ...log,
    module: log?.module === 'User' ? 'Co-worker' : log?.module,
    createdAt: isoDateWithoutTimeZone(log.createdAt),
    status: capitalizeInput(log.status),
  }))
}

function ActivityLogs() {
  // init states
  const [sort, setSort] = useState<any>({})
  const [page, setPage] = useState(PAGE50)
  const [date, setDate] = useState(intialDate)
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [module, setModule] = useState<string | undefined>(undefined)

  const [form] = Form.useForm()

  const {data, isLoading, isError, isFetching} = useQuery(
    ['activityLogs', page, sort, status, module, date],
    () =>
      getActivityLogs({
        ...page,
        sort:
          sort.order === undefined || sort.column === undefined
            ? ''
            : sort.order === 'ascend'
            ? sort.field
            : `-${sort.field}`,
        fromDate: date?.[0] ? MuiFormatDate(date[0]) + 'T00:00:00Z' : '',
        toDate: date?.[1] ? MuiFormatDate(date[1]) + 'T23:59:59Z' : '',
        status,
        module,
      }),
    {keepPreviousData: true}
  )

  useEffect(() => {
    if (isError) {
      notification({message: 'Could not load Activity Logs!', type: 'error'})
    }
  }, [isError, data])

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSort(sorter)
  }

  const handlePageChange = (pageNumber: any) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const onShowSizeChange = (_: any, pageSize: any) => {
    setPage((prev) => ({...prev, limit: pageSize}))
  }

  const handleChangeDate = (date: any[]) => {
    setDate([date[0], date[1].endOf('day')])
  }

  const handleModuleChange = (moduleId: string) => {
    setModule(moduleId)
    setPage(PAGE50)
  }

  const handleStatusChange = (statusId: string) => {
    setStatus(statusId)
    setPage(PAGE50)
  }

  const handleResetFilter = () => {
    setDate(intialDate)
    setModule(undefined)
    setStatus(undefined)
    setPage(PAGE50)
  }
  if (isLoading) {
    return <CircularProgress className="" />
  }

  return (
    <div>
      <Card title="Activity Logs">
        <div className="components-table-demo-control-bar">
          <div className="gx-d-flex gx-justify-content-between gx-flex-row">
            <Form layout="inline" form={form}>
              <FormItem>
                <RangePicker handleChangeDate={handleChangeDate} date={date} />
              </FormItem>
              <FormItem className="direct-form-item">
                <Select
                  placeholder="Select Module"
                  onChange={handleModuleChange}
                  value={module}
                  options={MODULES}
                />
              </FormItem>
              <FormItem className="direct-form-item">
                <Select
                  placeholder="Select Status"
                  onChange={handleStatusChange}
                  value={status}
                  options={STATUS}
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
          columns={ACTIVITY_LOGS(sort)}
          dataSource={formattedWeeklyReports(data?.data?.data?.data)}
          onChange={handleTableChange}
          pagination={{
            current: page.page,
            pageSize: page.limit,
            pageSizeOptions: ['50', '80', '100'],
            showSizeChanger: true,
            total: data?.data?.data?.count || 1,
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

export default ActivityLogs
