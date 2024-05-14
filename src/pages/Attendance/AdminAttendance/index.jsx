import React, {useEffect, useMemo, useRef, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {
  Button,
  Table,
  Form,
  DatePicker,
  Divider,
  Input,
  InputNumber,
  Popconfirm,
} from 'antd'
import moment from 'moment'
import {CSVLink} from 'react-csv'
import {
  attendanceFilter,
  ATTENDANCE_COLUMNS,
  intialDate,
  monthlyState,
  OfficeHourFilter,
  weeklyState,
} from 'constants/Attendance'
import {
  deleteAttendance,
  searchAttendacentOfUser,
  UserTotalofficehour,
} from 'services/attendances'
import {
  convertMsToHM,
  dateDifference,
  filterSpecificUser,
  getIsAdmin,
  handleResponse,
  hourIntoMilliSecond,
  milliSecondIntoHours,
  MuiFormatDate,
  sortFromDate,
} from 'helpers/utils'
import ViewDetailModel from '../ViewDetailModel'
import {notification} from 'helpers/notification'
import Select from 'components/Elements/Select'
import {getAllUsers} from 'services/users/userDetails'
import TmsAdminAttendanceForm from 'components/Modules/TmsAdminAttendanceForm'
import TmsAdminAddAttendanceForm from 'components/Modules/TmsAdminAttendanceForm/Add'
import CustomIcon from 'components/Elements/Icons'
import {useLocation} from 'react-router-dom'
import AccessWrapper from 'components/Modules/AccessWrapper'
import {emptyText} from 'constants/EmptySearchAntd'
import useWindowsSize from 'hooks/useWindowsSize'
import {socket} from 'pages/Main'
import {ADMINISTRATOR} from 'constants/UserNames'
import {useSelector} from 'react-redux'
import {PAGE50} from 'constants/Common'
import {disabledAfterToday} from 'util/antDatePickerDisabled'

const {RangePicker} = DatePicker
const FormItem = Form.Item

const formattedAttendances = (attendances) => {
  return attendances?.map((att) => {
    let timeInMilliSeconds = att?.data
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
      user: att._id.user,
      attendanceDate: moment(att?._id.attendanceDate).format('LL'),
      attendanceDay: moment(att?._id.attendanceDate).format('dddd'),
      punchInTime: moment(att?.data?.[0]?.punchInTime).format('LTS'),
      punchOutTime: att?.data?.[att?.data.length - 1]?.punchOutTime
        ? moment(att?.data?.[att?.data.length - 1]?.punchOutTime).format('LTS')
        : '',
      officehour: milliSecondIntoHours(att?.officehour),
      intHour: timeInMilliSeconds,
    }
  })
}

function AdminAttendance({userRole}) {
  //init hooks
  const {state} = useLocation()
  const [sort, setSort] = useState({
    order: 'ascend',
    field: 'attendanceDate',
    columnKey: 'attendanceDate',
  })
  const [form] = Form.useForm()
  const [page, setPage] = useState(PAGE50)
  const [defaultFilter, setDefaultFilter] = useState(undefined)
  const [openView, setOpenView] = useState(false)
  const [attToView, setAttToView] = useState({})
  const [date, setDate] = useState(intialDate)
  const [user, setUser] = useState(undefined)
  const [attFilter, setAttFilter] = useState({id: '1', value: 'Daily'})
  const [toggleAdd, setToggleAdd] = useState(false)
  const [toggleEdit, setToggleEdit] = useState(false)
  const [AttToEdit, setAttToEdit] = useState({})
  const [btnClick, setbtnClick] = useState(false)
  const queryClient = useQueryClient()
  const [dataToExport, setdataToExport] = useState({
    todownload: false,
    data: [],
    loading: false,
  })
  const [activeExpandedRow, setActiveExpandedRow] = useState([])

  const CSVRef = useRef()

  const {allocatedOfficeHours} = useSelector((state) => state.configurations)

  const {innerWidth} = useWindowsSize()

  useEffect(() => {
    if (dataToExport.todownload) {
      CSVRef.current.link.click()
    }
  }, [dataToExport])

  // set inital date to date selected from Co-workers attendance calendar
  useEffect(() => {
    if (state?.date && state?.user) {
      setDate([moment(state.date), moment(state.date)])
      setUser(state?.user)
    }
  }, [state?.date, state?.user])

  const {data: users} = useQuery(['userForAttendances'], () =>
    getAllUsers({fields: 'name', active: 'true', sort: 'name'})
  )

  const {data, isLoading, isFetching} = useQuery(
    ['adminAttendance', user, date, page, sort, defaultFilter],
    () => {
      let sortField = ''
      if (sort?.order) {
        const order = sort.order === 'ascend' ? '' : '-'
        sortField =
          sort.columnKey === 'user'
            ? `${order}${sort.columnKey}`
            : `${order}${sort.columnKey},user`
      }
      setbtnClick(false)
      return searchAttendacentOfUser({
        page: page.page + '',
        limit: page.limit + '',
        userId: user || '',
        fromDate: date?.[0] ? MuiFormatDate(date[0]._d) + 'T00:00:00Z' : '',
        toDate: date?.[1] ? MuiFormatDate(date[1]._d) + 'T00:00:00Z' : '',
        sort: sortField,
        officehourop: defaultFilter?.op,
        officehourValue: hourIntoMilliSecond(defaultFilter?.num),
      })
    }
  )

  const deleteAttendanceMutation = useMutation(
    (attendanceId) => deleteAttendance(attendanceId),
    {
      onSuccess: (response) =>
        handleResponse(
          response,
          'Attendance removed Successfully',
          'Attendance deletion failed',
          [
            () => queryClient.invalidateQueries(['adminAttendance']),
            () => queryClient.invalidateQueries(['userAttendance']),
            () => {
              socket.emit('CUD')
            },
          ]
        ),
      onError: (error) => {
        notification({message: 'Attendance deletion failed', type: 'error'})
      },
    }
  )

  const {
    data: timedata,
    refetch,
    isFetching: timeFetching,
  } = useQuery(
    ['usertotalhour', user, date],
    () =>
      UserTotalofficehour({
        userId: user,
        fromDate: date?.[0] ? MuiFormatDate(date[0]._d) + 'T00:00:00Z' : '',
        toDate: date?.[1] ? MuiFormatDate(date[1]._d) + 'T00:00:00Z' : '',
        officehourop: defaultFilter?.op,
        officehourValue: hourIntoMilliSecond(defaultFilter?.num),
      }),
    {enabled: false}
  )

  const handleChangeDate = (date) => {
    setDate(date ? date : intialDate)
    if (date === null) {
      setAttFilter(1)
    }
  }

  const handleTableChange = (pagination, filters, sorter) => {
    setPage({page: pagination?.current, limit: pagination?.pageSize})

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

  const handleEdit = (record) => {
    setToggleEdit(true)
    setAttToEdit(record)
  }
  const confirmDeleteAttendance = (a) => {
    deleteAttendanceMutation.mutate(a._id)
  }

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
  const handleUserChange = (id) => {
    setPage(PAGE50)
    setUser(id)
  }

  const handleReset = () => {
    setUser(undefined)
    setAttFilter(1)
    setDate(intialDate)
    setDefaultFilter(null)
    setbtnClick(false)
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
              {userRole?.editCoworkersAttendance && !getIsAdmin() && (
                <>
                  <Divider type="vertical"></Divider>
                  <span className="gx-link" onClick={() => handleEdit(record)}>
                    <CustomIcon name="edit" />
                  </span>
                </>
              )}
              {userRole?.deleteCoworkersAttendance && !getIsAdmin() && (
                <>
                  <Divider type="vertical" />
                  <Popconfirm
                    title="Are you sure to delete this attendance?"
                    onConfirm={() => confirmDeleteAttendance(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <span className="gx-link gx-text-danger">
                      <CustomIcon name="delete" />
                    </span>
                  </Popconfirm>
                </>
              )}
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

  const handleExport = async (event, done) => {
    setdataToExport((prev) => ({loading: true, data: []}))
    const data = await searchAttendacentOfUser({
      page: '',
      limit: '',
      userId: user || '',
      fromDate: date?.[0] ? MuiFormatDate(date[0]._d) + 'T00:00:00Z' : '',
      toDate: date?.[1] ? MuiFormatDate(date[1]._d) + 'T00:00:00Z' : '',
      sort: 'user,attendanceDate',
      officehourop: defaultFilter?.op,
      officehourValue: hourIntoMilliSecond(defaultFilter?.num),
    })

    const sortedIntermediate = data?.data?.data?.attendances?.[0]?.data?.map(
      (d) => ({
        ...d,
        data: sortFromDate(d?.data, 'punchInTime'),
      })
    )
    const formattedData = formattedAttendances(sortedIntermediate).map((d) => [
      d?.user,
      d?.attendanceDate,
      d?.attendanceDay,
      d?.punchInTime,
      d?.punchOutTime,
      d?.officehour,
    ])
    setdataToExport({todownload: true, data: formattedData, loading: false})
    done(true)
  }

  const unchangedPositionElements = (
    <div className="gx-d-flex gx-justify-content-between gx-flex-row">
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
      <FormItem className="direct-form-item">
        <Select
          placeholder="Select Co-worker"
          onChange={handleUserChange}
          value={user}
          options={filterSpecificUser(
            users?.data?.data?.data,
            ADMINISTRATOR
          )?.map((x) => ({
            id: x._id,
            value: x.name,
          }))}
        />
      </FormItem>
    </div>
  )

  const officeHoursCalculationElements = (
    <div style={{display: 'flex'}}>
      <Button
        className="gx-btn-form gx-btn-primary gx-text-white "
        onClick={() => {
          setbtnClick(true)
          refetch()
        }}
        disabled={!user}
      >
        Calculate Office Hour
      </Button>

      <Input
        value={
          user && btnClick
            ? timeFetching
              ? 'Calculating...'
              : timedata?.data?.data[0]?.totalhours
              ? convertMsToHM(timedata?.data?.data[0]?.totalhours)
              : 0
            : ''
        }
        style={{height: '36px'}}
        placeholder="Total Office Hour"
      />
    </div>
  )

  const exportAddElements = (
    <AccessWrapper role={userRole?.exportCoworkersAttendance}>
      <div className="gx-btn-form" style={{marginLeft: '0.5rem'}}>
        <Button
          className="gx-btn-form gx-btn-primary gx-text-white "
          disabled={
            sortedData?.length === 0 || isFetching || dataToExport.loading
          }
          onClick={handleExport}
        >
          Export
        </Button>

        <CSVLink
          filename="Co-workers Attendance"
          ref={CSVRef}
          data={[
            [
              'Co-worker',
              'Date',
              'Day',
              'Punch-in Time',
              'Punch-out Time',
              'Office hour',
            ],
            ...dataToExport.data,
          ]}
        ></CSVLink>

        <AccessWrapper role={userRole?.addCoworkersAttendance}>
          <Button
            className="gx-btn-form gx-btn-primary gx-text-white "
            onClick={() => setToggleAdd(true)}
            disabled={getIsAdmin()}
          >
            Add
          </Button>
        </AccessWrapper>
      </div>
    </AccessWrapper>
  )

  const officeHourConditions = (
    <>
      <FormItem>
        <Input
          defaultValue="Office Hour"
          disabled={true}
          style={{width: '120px'}}
        />
      </FormItem>
      <FormItem>
        <Select
          options={OfficeHourFilter}
          onChange={(value) =>
            setDefaultFilter((prev) => ({...prev, op: value}))
          }
          value={defaultFilter?.op}
          style={{width: '220px'}}
          placeholder="Select condition"
        />
      </FormItem>
      <FormItem>
        <InputNumber
          value={defaultFilter?.num}
          onChange={(value) =>
            setDefaultFilter((prev) => ({...prev, num: value}))
          }
          style={{width: '80px'}}
          placeholder="Hours"
        />
      </FormItem>
      <FormItem style={{marginBottom: '1px'}}>
        <Button
          className="gx-btn-form gx-btn-primary gx-text-white "
          onClick={() => handleReset()}
        >
          Reset
        </Button>
      </FormItem>
    </>
  )

  return (
    <div>
      {toggleAdd && (
        <TmsAdminAddAttendanceForm
          toogle={toggleAdd}
          handleCancel={() => {
            setToggleAdd(false)
          }}
          users={users?.data?.data?.data}
        />
      )}
      {toggleEdit && (
        <TmsAdminAttendanceForm
          toogle={toggleEdit}
          handleCancel={() => {
            setToggleEdit(false)
            setAttToEdit({})
          }}
          users={users?.data?.data?.data}
          AttToEdit={AttToEdit}
        />
      )}
      <ViewDetailModel
        toogle={openView}
        title={attToView.user ? attToView.user : 'Attendance Details'}
        handleCancel={() => {
          setOpenView(false)
          setAttToEdit({})
        }}
        attendanceToview={attToView}
      />
      <div className="gx-mt-2"></div>
      <div className="components-table-demo-control-bar">
        {innerWidth > 1600 ? (
          <div className="gx-d-flex gx-justify-content-between gx-flex-row">
            <Form
              layout="inline"
              form={form}
              style={{width: '100vw', display: 'block'}}
            >
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <div className="gx-d-flex gx-justify-content-between gx-flex-row">
                    {unchangedPositionElements}

                    <div className="gx-d-flex gx-justify-content-between gx-flex-row">
                      {' '}
                      {officeHourConditions}
                    </div>
                  </div>
                </div>
                <div>{exportAddElements}</div>
              </div>
            </Form>
            {user && (
              <div style={{display: 'flex'}}>
                {officeHoursCalculationElements}
              </div>
            )}
          </div>
        ) : (
          <div className="gx-d-flex gx-justify-content-between gx-flex-row">
            <Form
              layout="inline"
              form={form}
              style={{width: '100%', display: 'block'}}
            >
              <div className="gx-d-flex gx-justify-content-between gx-flex-row">
                {unchangedPositionElements}
                {exportAddElements}
              </div>
            </Form>
            <div style={{display: 'flex'}}>
              <Form layout="inline">
                {officeHourConditions}
                {user && officeHoursCalculationElements}
              </Form>
            </div>
          </div>
        )}
      </div>
      <Table
        locale={{emptyText}}
        className="gx-table-responsive"
        columns={ATTENDANCE_COLUMNS(
          sort,
          handleView,
          true,
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
          pageSizeOptions: ['25', '50', '100'],
          showSizeChanger: true,
          total: data?.data?.data?.attendances?.[0]?.metadata?.[0]?.total || 1,
          onShowSizeChange,
          hideOnSinglePage: true,
          onChange: handlePageChange,
        }}
        loading={isFetching}
      />
    </div>
  )
}

export default AdminAttendance
