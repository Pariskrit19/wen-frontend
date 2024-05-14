import { useQuery } from '@tanstack/react-query'
import { Button, DatePicker, Form, Table } from 'antd'
import Select from 'components/Elements/Select'
import { LEAVES_COLUMN, STATUS_TYPES } from 'constants/Leaves'
import {
  MuiFormatDate,
  capitalizeInput,
  changeDate,
  removeDash,
} from 'helpers/utils'
import moment, { Moment } from 'moment'
import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLeavesOfUser, getQuarters } from 'services/leaves'
import LeaveModal from 'components/Modules/LeaveModal'
import { getLeaveTypes } from 'services/leaves'
import { emptyText } from 'constants/EmptySearchAntd'
import { leaveHistoryDays } from 'constants/LeaveTypes'
import { selectAuthUser } from 'appRedux/reducers/Auth'
import { useSelector } from 'react-redux'
import { PAGE25 } from 'constants/Common'

const FormItem = Form.Item
const { RangePicker } = DatePicker

const formattedLeaves = (leaves: any) => {
  return leaves?.map((leave: any) => {
    return {
      ...leave,
      key: leave._id,
      dates: leave?.leaveType?.isSpecial
        ? [leave?.leaveDates?.[0], leave?.leaveDates?.at(-1)]
          ?.map((date) => changeDate(date))
          ?.join('-')
        : leave?.leaveDates
          ?.map((date: any) => changeDate(date))
          ?.join(' '),
      type: `${leave?.leaveType?.name} ${leave?.halfDay === 'first-half' || leave?.halfDay === 'second-half'
          ? '- ' + removeDash(leave?.halfDay)
          : ''
        }`,
      status: leave?.leaveStatus ? capitalizeInput(leave?.leaveStatus) : '',
    }
  })
}

function MyHistory({
  userId,
  handleOpenCancelLeaveModal,
  isLoading,
  permissions,
  reApplyLeave,
  isCancelLoading,
  fiscalYearEndDate,
  casualLeaveRemainingDays,
}: {
  userId: string
  handleCancelLeave: (leave: any) => void
  handleOpenCancelLeaveModal: (param: any) => void
  isLoading: boolean
  permissions: any
  reApplyLeave: (leave: any) => void
  isCancelLoading: boolean
  fiscalYearEndDate: any
  casualLeaveRemainingDays: number
}) {
  const [form] = Form.useForm()
  const location: any = useLocation()
  let selectedDate = location.state?.date
  const [datatoShow, setdatatoShow] = useState({})
  const [openModal, setModal] = useState<boolean>(false)
  const [leaveStatus, setLeaveStatus] = useState<string | undefined>(
    location?.state?.leaveStatus || ''
  )
  const [leaveTypeId, setLeaveType] = useState<string | undefined>(undefined)
  const [date, setDate] = useState<{ moment: Moment | undefined; utc: string }>({
    utc: selectedDate ? selectedDate : undefined,
    moment: selectedDate ? moment(selectedDate).startOf('day') : undefined,
  })
  const [modalReadOnly, setmodalReadOnly] = useState<boolean>(false)

  const { gender: userGender, status: userStatus } = useSelector(selectAuthUser)

  const [rangeDate, setRangeDate] = useState<any>([])

  const [page, setPage] = useState(PAGE25)
  const [leaveFilter, setLeaveFilter] = useState(undefined)

  const userLeavesQuery = useQuery(
    ['userLeaves', leaveStatus, rangeDate, page, leaveTypeId],
    () =>
      getLeavesOfUser(
        userId,
        leaveStatus,
        date?.utc,
        page.page,
        page.limit,
        rangeDate?.[0] ? MuiFormatDate(rangeDate[0]?._d) + 'T00:00:00Z' : '',
        rangeDate?.[1] ? MuiFormatDate(rangeDate[1]?._d) + 'T00:00:00Z' : '',
        '-leaveDates,_id',
        leaveTypeId
      )
  )

  useEffect(() => {
    setLeaveStatus(location?.state?.leaveStatus)
  }, [location?.state?.leaveStatus])

  const { data: quarterQuery } = useQuery(['quarters'], getQuarters, {
    select: (res: any) => {
      return res.data?.data?.data?.[0]?.quarters
    },
  })

  const updatedQuarters = quarterQuery?.map((d: any) => ({
    ...d,
    id: d?._id,
    value: d.quarterName,
  }))
  const combinedFilter = [...leaveHistoryDays, ...(updatedQuarters || [])]

  const handleLeaveType = (value: string | undefined) => {
    setPage(PAGE25)
    setLeaveType(value)
  }

  const handleLeaveFilter = (value: any) => {
    setPage(PAGE25)
    if (value) {
      if (updatedQuarters?.find((d: any) => d?.id === value)) {
        const rangeDate = updatedQuarters?.find((d: any) => d?.id === value)
        setLeaveFilter(value)
        setRangeDate([moment(rangeDate?.fromDate), moment(rangeDate?.toDate)])
      } else if (leaveHistoryDays?.find((d: any) => d?.id === value)) {
        const tempDays: any = leaveHistoryDays?.find(
          (d: any) => d?.id === value
        )?.value
        const selectedDays = parseInt(tempDays?.split(' ')?.[1])
        const newRangeDates = [
          moment().subtract(selectedDays, 'days'),
          moment(),
        ]
        setLeaveFilter(value)
        setRangeDate(newRangeDates)
      }
    } else {
      setRangeDate([])
      setLeaveFilter(undefined)
    }
  }

  const leaveTypeQuery = useQuery(['leaveType'], getLeaveTypes, {
    select: (res) => {
      return [
        ...res?.data?.data?.data?.map((type: any) => ({
          ...type,
          id: type._id,
          value: type?.name.replace('Leave', '').trim(),
        })),
      ]
    },
  })

  const onShowSizeChange = (_: any, pageSize: number) => {
    setPage((prev) => ({ ...page, limit: pageSize }))
  }

  const handlePageChange = (pageNumber: number) => {
    setPage((prev) => ({ ...prev, page: pageNumber }))
  }

  const handleStatusChange = (statusId: string) => {
    if (page?.page > 1) setPage(PAGE25)
    setLeaveStatus(statusId)
  }

  const handleDateChange = (value: any) => {
    setLeaveFilter(undefined)
    if (page?.page > 1) setPage(PAGE25)

    setRangeDate(value)
  }

  const handleShow = (data: any, mode: boolean) => {
    setdatatoShow(data)
    setModal(true)
    setmodalReadOnly(mode)
  }

  const handleResetFilter = () => {
    setLeaveStatus(undefined)
    setLeaveType(undefined)
    setPage(PAGE25)
    setRangeDate([])
    setLeaveFilter(undefined)
    setDate({
      utc: '',
      moment: undefined,
    })
  }
  return (
    <div>
      {openModal && (
        <LeaveModal
          open={openModal}
          leaveData={datatoShow}
          onClose={() => setModal(false)}
          isEditMode={true}
          users={[]}
          readOnly={modalReadOnly}
          showWorker={false}
          adminOpened={false}
          casualLeaveRemainingDays={casualLeaveRemainingDays}
          fiscalYearEndDate={fiscalYearEndDate}
        />
      )}

      <div className="gx-d-flex gx-justify-content-between gx-flex-row">
        <Form layout="inline" form={form}>
          <FormItem className="direct-form-item">
            <Select
              placeholder="Select Status"
              onChange={handleStatusChange}
              value={leaveStatus}
              options={STATUS_TYPES}
            />
          </FormItem>

          <FormItem className="direct-form-item">
            <Select
              placeholder="Select Leave Type"
              onChange={handleLeaveType}
              value={leaveTypeId}
              options={leaveTypeQuery?.data?.filter((d) => {
                const showToProbation =
                  userStatus === 'Probation' ? d?.Probation : true
                return d.gender.includes(userGender) && showToProbation
              })}
            />
          </FormItem>

          <FormItem>
            <RangePicker onChange={handleDateChange} value={rangeDate} />
          </FormItem>

          <FormItem className="direct-form-item" style={{ marginRight: '2rem' }}>
            <Select
              style={{ minWidth: '210px' }}
              placeholder="Select Filter By"
              onChange={handleLeaveFilter}
              value={leaveFilter}
              options={combinedFilter}
            />
          </FormItem>

          <FormItem style={{ marginBottom: '3px' }}>
            <Button
              className="gx-btn-primary gx-text-white"
              onClick={handleResetFilter}
            >
              Reset
            </Button>
          </FormItem>
        </Form>
      </div>
      <Table
        locale={{ emptyText }}
        className="gx-table-responsive"
        columns={LEAVES_COLUMN({
          onCancelLeave: handleOpenCancelLeaveModal,
          onApproveClick: (leave) => {
            reApplyLeave(leave)
          },
          onEditClick: handleShow,
          viewLeave: permissions?.viewMyLeaveDetails,
          cancelLeave: permissions?.cancelMyLeaves,
        }).filter((item, index) => index !== 0)}
        dataSource={formattedLeaves(userLeavesQuery?.data?.data?.data?.data)}
        pagination={{
          current: page.page,
          pageSize: page.limit,
          pageSizeOptions: ['25', '50', '100'],
          showSizeChanger: true,
          total: userLeavesQuery?.data?.data?.data?.count || 1,
          onShowSizeChange,
          hideOnSinglePage: userLeavesQuery?.data?.data?.data?.count
            ? false
            : true,
          onChange: handlePageChange,
        }}
        loading={userLeavesQuery.isFetching || isLoading || isCancelLoading}
      />
    </div>
  )
}

export default MyHistory
