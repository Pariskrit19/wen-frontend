import React, {useEffect, useState} from 'react'
import {Button, Checkbox, DatePicker, Form, Table} from 'antd'
import Select from 'components/Elements/Select'
import {
  FIRST_HALF,
  LEAVES_COLUMN,
  SECOND_HALF,
  STATUS_TYPES,
} from 'constants/Leaves'
import {CSVLink} from 'react-csv'
import LeaveModal from 'components/Modules/LeaveModal'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {
  changeLeaveStatus,
  getLeavesOfAllUsers,
  getQuarters,
} from 'services/leaves'
import {
  capitalizeInput,
  changeDate,
  filterSpecificUser,
  getIsAdmin,
  handleResponse,
  MuiFormatDate,
  removeDash,
} from 'helpers/utils'
import {getAllUsers} from 'services/users/userDetails'
import moment from 'moment'
import AccessWrapper from 'components/Modules/AccessWrapper'
import CancelLeaveModal from 'components/Modules/CancelLeaveModal'
import {getLeaveTypes} from 'services/leaves'
import {sendEmailforLeave} from 'services/leaves'
import {emptyText} from 'constants/EmptySearchAntd'
import {socket} from 'pages/Main'
import {ADMINISTRATOR} from 'constants/UserNames'
import {customLeaves} from 'constants/LeaveDuration'
import {PAGE25, SELECT_ALL_LIMIT} from 'constants/Common'
import {leaveHistoryDays} from 'constants/LeaveTypes'
import {useLocation} from 'react-router-dom'
import {APPROVED} from 'constants/LeaveStatus'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {notification} from 'helpers/notification'

const FormItem = Form.Item
const {RangePicker} = DatePicker

const formattedLeaves = (leaves, key) => {
  let filteredLeaves = leaves
  if (key === 'hr') {
    filteredLeaves = leaves?.filter((leave) => leave?.user?.role.key !== key)
  }
  return filteredLeaves?.map((leave) => {
    return {
      ...leave,
      key: leave._id,
      coWorker: leave?.user?.name,
      dates: leave?.leaveType?.isSpecial
        ? [leave?.leaveDates?.[0], leave?.leaveDates?.at(-1)]
            ?.map((date) => changeDate(date))
            ?.join('-')
        : leave?.leaveDates?.map((date) => changeDate(date))?.join(' '),
      type: `${leave?.leaveType?.name} ${
        leave?.halfDay === FIRST_HALF || leave?.halfDay === SECOND_HALF
          ? '- ' + removeDash(leave?.halfDay)
          : ''
      }`,
      status: leave?.leaveStatus ? capitalizeInput(leave?.leaveStatus) : '',
      addedBy: leave?.createdBy?.name,
    }
  })
}

function Leaves({
  handleOpenCancelLeaveModal,
  selectedRows,
  rowSelection,
  isExportDisabled,
  userRole,
  permissions,
  isCancelLoading,
  fiscalYearEndDate,
  setSelectedRows,
}) {
  const queryClient = useQueryClient()
  const location = useLocation()
  let approveReason
  const [openModal, setOpenModal] = useState(false)
  const [openApproveLeaveModal, setopenApproveLeaveModal] = useState(false)
  const [loader, setLoader] = useState(false)
  const [dataToEdit, setDataToEdit] = useState({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [leaveStatus, setLeaveStatus] = useState(
    location?.state?.leaveStatus ?? undefined
  )
  const [leaveId, setLeaveId] = useState(undefined)
  const [leaveTitle, setLeaveTitle] = useState('')
  const [leaveInterval, setLeaveInterval] = useState(undefined)
  const [leaveFilter, setLeaveFilter] = useState(undefined)
  const [form] = Form.useForm()
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [rangeDate, setRangeDate] = useState(
    location?.state?.date
      ? [moment(location?.state?.date), moment(location?.state?.date)]
      : []
  )

  //for the checbox states

  const [isChecked, setIsChecked] = useState({
    checked: false,
    indeterminate: false,
    isSelectAll: false,
  })
  const {
    role: {key},
  } = useSelector(selectAuthUser)

  const [page, setPage] = useState(PAGE25)
  const [leaveDetails, setleaveDetails] = useState({})
  const [user, setUser] = useState(location?.state?.user ?? undefined)

  const leavesQuery = useQuery(
    [
      'leaves',
      leaveStatus,
      user,
      rangeDate,
      page,
      leaveId,
      leaveInterval,
      isSelectAll,
    ],
    () =>
      getLeavesOfAllUsers(
        leaveStatus,
        user,
        '',
        isSelectAll ? SELECT_ALL_LIMIT.page : page.page,
        isSelectAll ? SELECT_ALL_LIMIT.limit : page.limit,
        leaveStatus && leaveStatus !== 'pending'
          ? '-updatedAt'
          : '-leaveDates,-createdAt',
        leaveId,
        rangeDate?.[0] ? MuiFormatDate(rangeDate[0]?._d) + 'T00:00:00Z' : '',
        rangeDate?.[1] ? MuiFormatDate(rangeDate[1]?._d) + 'T00:00:00Z' : '',
        leaveInterval === 'full-day' ? undefined : leaveInterval
      ),
    {
      onError: (err) => console.log(err),
      keepPreviousData: true,
    }
  )

  const totalLeaveCount = leavesQuery?.data?.data?.data?.count

  const {data: quarterQuery} = useQuery(['quarters'], getQuarters, {
    select: (res) => {
      return res.data?.data?.data?.[0]?.quarters
    },
  })

  const updatedQuarters = quarterQuery?.map((d) => ({
    ...d,
    id: d?._id,
    value: d.quarterName,
  }))
  const combinedFilter = [...leaveHistoryDays, ...(updatedQuarters || [])]

  const leaveTypeQuery = useQuery(['leaveType'], getLeaveTypes, {
    select: (res) => [
      ...res?.data?.data?.data?.map((type) => ({
        id: type._id,
        value: type?.name.replace('Leave', '').trim(),
      })),
    ],
  })

  useEffect(() => {
    leavesQuery.refetch()
    setLeaveStatus(location?.state?.leaveStatus)
    setUser(location?.state?.user)
    setRangeDate(
      location?.state?.date
        ? [moment(location?.state?.date), moment(location?.state?.date)]
        : []
    )
  }, [location?.state])

  const handleLeaveTypeChange = (value, option) => {
    setPage(PAGE25)
    setLeaveId(value)
    setLeaveTitle(option?.children)
    if (option?.children !== 'Sick' && option?.children !== 'Casual') {
      setLeaveInterval(undefined)
    }

    if (!value) {
      setIsSelectAll(false)
    }
  }
  const handleLeaveIntervalChange = (value) => {
    setPage(PAGE25)
    setLeaveInterval(value)
  }

  const handleLeaveFilter = (value) => {
    setPage(PAGE25)
    if (value) {
      if (updatedQuarters?.find((d) => d?.id === value)) {
        const rangeDate = updatedQuarters?.find((d) => d?.id === value)
        setLeaveFilter(value)
        setRangeDate([moment(rangeDate?.fromDate), moment(rangeDate?.toDate)])
      } else if (leaveHistoryDays?.find((d) => d?.id === value)) {
        const tempDays = leaveHistoryDays?.find((d) => d?.id === value)?.value
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

  const emailMutation = useMutation((payload) => sendEmailforLeave(payload))
  const usersQuery = useQuery(['users'], () => getAllUsers({sort: 'name'}))

  let usersToBeDisplayed = usersQuery?.data?.data?.data?.data

  if (key === 'hr') {
    usersToBeDisplayed = usersToBeDisplayed?.filter(
      (user) => user?.role?.key !== 'hr'
    )
  }

  const leaveApproveMutation = useMutation(
    (payload) =>
      changeLeaveStatus(payload.id, payload.type, '', '', payload.leaveStatus),
    {
      onSuccess: (response) => {
        if (response?.status) {
          handleResponse(
            response,
            'Leave approved successfully',
            'Could not approve leave',
            [
              () => sendEmailNotification(response),
              () => queryClient.invalidateQueries(['userLeaves']),
              () => queryClient.invalidateQueries(['leaves']),
              () =>
                queryClient.invalidateQueries(['takenAndRemainingLeaveDays']),
              () =>
                queryClient.invalidateQueries([
                  'quartertakenAndRemainingLeaveDays',
                ]),
              () => {
                socket.emit('dashboard-leave')
              },
              () => {
                socket.emit('CUD')
              },
              () => {
                socket.emit('approve-leave', {
                  showTo: [response.data.data.data.user._id],
                  remarks: 'Your leave has been approved.',
                  module: 'Leave',
                  extraInfo: JSON.stringify({
                    status: APPROVED,
                  }),
                })
              },
            ]
          )
        } else {
          setLoader(false)
          notification({
            message: response?.data?.message || 'Could not approve leave',
            type: 'error',
          })
        }
      },
      onError: (error) => {
        setLoader(false)
        notification({message: 'Could not approve leave', type: 'error'})
      },
    }
  )

  const sendEmailNotification = (res) => {
    emailMutation.mutate({
      leaveStatus: res.data.data.data.leaveStatus,
      leaveDates: res.data.data.data.leaveDates,
      user: res.data.data.data.user,
      leaveApproveReason: approveReason || '',
    })
    setLoader(false)
    handleCloseApproveModal()
  }

  const handleCloseApproveModal = () => {
    setopenApproveLeaveModal(false)
  }

  const handleOpenApproveModal = (leaveDetails) => {
    setleaveDetails(leaveDetails)
    setopenApproveLeaveModal(true)
  }

  const handleApproveLeave = (leave) => {
    approveReason = leave?.leaveApproveReason
    leaveApproveMutation.mutate({
      id: leave._id,
      type: 'approve',
      reason: approveReason,
      leaveStatus: leave?.leaveStatus,
    })
  }

  const handleStatusChange = (statusId) => {
    setPage(PAGE25)
    setLeaveStatus(statusId)
    // if (!statusId) {
    //   setIsSelectAll(false)
    // }
  }
  const handleUserChange = (user) => {
    setPage(PAGE25)
    setUser(user)
    if (!user) {
      setIsSelectAll(false)
    }
  }

  const handleResetFilter = () => {
    setPage(PAGE25)
    setLeaveStatus(undefined)
    setUser(undefined)
    setLeaveId(undefined)
    setLeaveInterval(undefined)
    setLeaveTitle('')
    setRangeDate([])
    setLeaveFilter(undefined)
    setIsSelectAll(false)
    setSelectedRows([])
  }

  const handleCloseModal = (
    setSpecificHalf,
    setHalfLeaveApproved,
    setHalfLeavePending,
    setMultipleDatesSelected,
    setCalendarClicked
  ) => {
    setOpenModal(false)
    setIsEditMode(false)
    setSpecificHalf(false)
    setHalfLeaveApproved(false)
    setHalfLeavePending(false)
    setMultipleDatesSelected(false)
    setCalendarClicked(false)
  }

  const handleOpenModal = () => {
    setOpenModal(true)
    setReadOnly(false)
  }

  //to clear edit mode -- adding leaves for co-workers
  const handleOpenModalForAddLeave = () => {
    setDataToEdit({})
    setIsEditMode(false)
    handleOpenModal()
  }

  const handleOpenEditModal = (data, mode) => {
    setIsEditMode(true)
    setDataToEdit(data)
    handleOpenModal()
    setReadOnly(mode)
  }

  const onShowSizeChange = (_, pageSize) => {
    setPage((prev) => ({...page, limit: pageSize}))
  }

  const handlePageChange = (pageNumber) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const handleDateChange = (value) => {
    if (value) {
      setPage(PAGE25)
      setRangeDate(value)
    } else {
      setRangeDate([])
    }
  }

  const data = formattedLeaves(leavesQuery?.data?.data?.data?.data, key)

  //LMS- leaves pagination total detail
  const getShowTotalDetail = () => {
    const currentPage = page?.page || 1
    const pageSize = page?.limit || 50
    const totalEntries = totalLeaveCount || 1

    const startIndex = Math.min((currentPage - 1) * pageSize + 1, totalEntries)
    const endIndex = Math.min(currentPage * pageSize, totalEntries)

    return `Showing ${startIndex} to ${endIndex} of ${totalEntries} entries`
  }
  useEffect(() => {
    if (isSelectAll && data?.length) {
      const selectedIds = data?.map((item) => item._id)
      setSelectedRows(
        user || leaveStatus || leaveId
          ? (prev) => selectedIds?.filter((id) => prev.includes(id))
          : selectedIds
      )
    }
  }, [data?.length])

  useEffect(() => {
    if (
      selectedRows?.length > 0 &&
      (selectedRows?.length < data?.length ||
        selectedRows?.length === data?.length)
    ) {
      setIsChecked({
        ...isChecked,
        checked:
          data?.length === 0 ? false : selectedRows?.length === data?.length,
        indeterminate: selectedRows?.length < data?.length,
      })
    }
    if (selectedRows?.length === 0) {
      setIsChecked({
        ...isChecked,
        checked: false,
        indeterminate: false,
      })
    }
    if (selectedRows?.length > data?.length) {
      setIsChecked({
        ...isChecked,
        checked: selectedRows?.length === totalLeaveCount,
        indeterminate: selectedRows?.length < totalLeaveCount,
      })
    }
  }, [data?.length, selectedRows, leaveStatus, user, leaveId])
  //handle selectalls
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(data?.map((item) => item._id))
    }
    if (!checked) {
      setSelectedRows([])
    }
    setIsSelectAll(checked)
  }

  // for checkbox
  const headerCheckbox = (
    <Checkbox
      checked={isChecked?.checked}
      indeterminate={isChecked?.indeterminate}
      onChange={(e) => handleSelectAll(e?.target?.checked)}
    />
  )
  const leaveRowSelection = {...rowSelection, columnTitle: headerCheckbox}

  return (
    <div>
      {openModal && (
        <LeaveModal
          leaveData={dataToEdit}
          isEditMode={isEditMode}
          open={openModal}
          onClose={handleCloseModal}
          users={usersQuery?.data?.data?.data?.data}
          readOnly={readOnly}
          adminOpened={true}
          fiscalYearEndDate={fiscalYearEndDate}
        />
      )}

      {/* leave approve modal */}
      {openApproveLeaveModal && (
        <CancelLeaveModal
          open={openApproveLeaveModal}
          onClose={handleCloseApproveModal}
          onSubmit={handleApproveLeave}
          leaveData={leaveDetails}
          loader={loader}
          setLoader={setLoader}
          title={'Approve Leave'}
          isRequired={false}
          name={'leaveApproveReason'}
        />
      )}

      <div className="components-table-demo-control-bar">
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
                onChange={handleLeaveTypeChange}
                value={leaveId}
                options={leaveTypeQuery?.data}
              />
            </FormItem>
            {(leaveTitle === 'Sick' || leaveTitle === 'Casual') && (
              <FormItem className="direct-form-item">
                <Select
                  placeholder="Select Half Day Type"
                  onChange={handleLeaveIntervalChange}
                  options={customLeaves}
                  value={leaveInterval}
                />
              </FormItem>
            )}

            <FormItem className="direct-form-item">
              <Select
                placeholder="Select Co-worker"
                value={user}
                options={filterSpecificUser(
                  usersToBeDisplayed,
                  ADMINISTRATOR
                )?.map((x) => ({
                  id: x._id,
                  value: x.name,
                }))}
                onChange={handleUserChange}
              />
            </FormItem>
            <FormItem>
              <RangePicker onChange={handleDateChange} value={rangeDate} />
            </FormItem>

            <FormItem
              className="direct-form-item"
              style={{marginRight: '2rem'}}
            >
              <Select
                style={{minWidth: '210px'}}
                placeholder="Select Filter By"
                onChange={handleLeaveFilter}
                value={leaveFilter}
                options={combinedFilter}
              />
            </FormItem>

            <FormItem style={{marginBottom: '3px'}}>
              <Button
                className="gx-btn-primary gx-text-white"
                onClick={handleResetFilter}
              >
                Reset
              </Button>
            </FormItem>
          </Form>
          <div className="gx-btn-form">
            <AccessWrapper role={permissions?.addCoworkersLeaves}>
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={handleOpenModalForAddLeave}
                disabled={getIsAdmin()}
              >
                Add Leave
              </Button>
            </AccessWrapper>
            <AccessWrapper role={permissions?.exportCoworkersLeaves}>
              <CSVLink
                filename={'Leaves.csv'}
                data={
                  data?.length > 0
                    ? [
                        [
                          'Co-worker',
                          'Dates',
                          'Type',
                          'Reason',
                          'Cancel Leave Reason',
                          'Rejected Leave Reason',
                          'Status',
                        ],
                        ...data
                          ?.filter((leave) => selectedRows.includes(leave?._id))
                          ?.map((leave) => {
                            const leaveDatesLength = leave?.leaveDates?.length
                            const checkSpecialLeave =
                              leave?.leaveType?.isSpecial
                            if (checkSpecialLeave) {
                              let specialLeaveDate = [
                                moment(leave?.leaveDates[0]).format(
                                  'DD/MM/YYYY'
                                ),
                                moment(
                                  leave?.leaveDates[leaveDatesLength - 1]
                                ).format('DD/MM/YYYY'),
                              ]
                              const specialLeaveStartEndDate =
                                specialLeaveDate.join(' - ')
                              return [
                                leave?.user?.name,
                                specialLeaveStartEndDate,
                                leave?.type,
                                leave?.reason,
                                leave?.cancelReason,
                                leave?.rejectReason,
                                leave?.status,
                              ]
                            } else {
                              const LeaveDates = leave?.dates
                                ?.split(' ')
                                ?.join(', ')
                              return [
                                leave?.user?.name,
                                LeaveDates,
                                leave?.type,
                                leave?.reason,
                                leave?.cancelReason,
                                leave?.rejectReason,
                                leave?.status,
                              ]
                            }
                          }),
                      ]
                    : []
                }
              >
                <Button
                  className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                  disabled={isExportDisabled}
                >
                  Export
                </Button>
              </CSVLink>
            </AccessWrapper>
          </div>
        </div>
      </div>
      <Table
        locale={{emptyText}}
        className="gx-table-responsive"
        columns={LEAVES_COLUMN({
          onCancelLeave: handleOpenCancelLeaveModal,
          onApproveClick: handleOpenApproveModal,
          onEditClick: handleOpenEditModal,
          isAdmin: true,
          role: userRole,
          viewLeave: permissions?.viewCoworkersLeaves,
          cancelLeave: permissions?.cancelCoworkersLeaves,
          approveLeave: permissions?.approveCoworkersLeaves,
          editLeave: permissions?.editCoworkersLeaves,
        })}
        dataSource={data}
        // onChange={handleTableChange}
        rowSelection={leaveRowSelection}
        pagination={{
          showTotal: () => getShowTotalDetail(),
          current: page.page,
          pageSize: page.limit,
          pageSizeOptions: ['25', '50', '100'],
          showSizeChanger: true,
          total: totalLeaveCount || 1,
          onShowSizeChange,
          hideOnSinglePage: totalLeaveCount ? false : true,
          onChange: handlePageChange,
        }}
        loading={
          leavesQuery.isLoading ||
          leaveApproveMutation.isLoading ||
          isCancelLoading
        }
      />
    </div>
  )
}

export default Leaves
