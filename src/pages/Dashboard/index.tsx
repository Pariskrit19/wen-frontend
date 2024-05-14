import React, {useEffect, useState, useCallback} from 'react'
import {ReactComponent as LeaveIcon} from 'assets/images/Leave.svg'
import {Button, Card, Col, Form, Row, Spin} from 'antd'
import Auxiliary from 'util/Auxiliary'
import Widget from 'components/Elements/Widget/index'
import TotalCountCard from 'components/Elements/TotalCountCard'
import {Calendar, momentLocalizer} from 'react-big-calendar'
import moment from 'moment'
import EventsAndAnnouncements from 'components/Modules/EventsAndAnnouncements'
import {
  LoginOutlined,
  LogoutOutlined,
  ExceptionOutlined,
} from '@ant-design/icons'
import TinyBarChart from 'routes/extensions/charts/recharts/bar/Components/TinyBarChart'
import Select from 'components/Elements/Select'
import {useQuery} from '@tanstack/react-query'
import {getAllProjects} from 'services/projects'
import {getLogTypes, getTimeLogChart} from 'services/timeLogs'
import CustomActiveShapePieChart from 'routes/extensions/charts/recharts/pie/Components/CustomActiveShapePieChart'
import {
  getPendingLeavesCount,
  getTodaysUserLeaveCount,
  getFutureLeaves,
} from 'services/leaves'
import {compareString, MuiFormatDate, oneWeekFilterCheck} from 'helpers/utils'
import {getWeeklyNotices} from 'services/noticeboard'
import {getAllHolidays} from 'services/resources'
import {
  getActiveUsersCount,
  getBirthMonthUsers,
} from 'services/users/userDetails'
import {getTodaysUserAttendanceCount} from 'services/attendances'
import {useNavigate} from 'react-router-dom'
import useWindowsSize from 'hooks/useWindowsSize'
import {useSelector} from 'react-redux'
import AccessWrapper from 'components/Modules/AccessWrapper'
import {DASHBOARD_ICON_ACCESS} from 'constants/RoleAccess'
import {FIRST_HALF, SECOND_HALF} from 'constants/Leaves'
import {debounce} from 'helpers/utils'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {notification} from 'helpers/notification'
import {socket} from 'pages/Main'
import {useCleanCalendar} from 'hooks/useCleanCalendar'
import {F10PX, F11PX} from 'constants/FontSizes'
import CalendarLegends from 'components/Elements/Calendar/CalendarLegends'
import {DashboardCalendarColors} from 'constants/CalendarColors'
import {v4 as uuidv4} from 'uuid'

const FormItem = Form.Item

const localizer = momentLocalizer(moment)

const Dashboard = () => {
  const {
    role: {
      key = '',
      permission: {Dashboard: NavigationDashboard = {}} = {},
    } = {},
  } = useSelector(selectAuthUser)

  const [chart, setChart] = useState('1')
  const [project, setProject] = useState('')
  const [logType, setlogType] = useState('')
  const [socketPendingLeaveCount, setSocketPendingLeaveCount] = useState(0)
  const [socketApprovedLeaveCount, setSocketApprovedLeaveCount] = useState(0)
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [projectArray, setProjectArray] = useState([])
  const [chartData, setChartData] = useState([])
  const navigate = useNavigate()
  const {innerWidth} = useWindowsSize()
  const [form] = Form.useForm()
  const {monthChangeHandler} = useCleanCalendar()

  useEffect(() => {
    socket.on('pending-leave-count', (response: number) => {
      setSocketPendingLeaveCount(response)
    })
    socket.on(
      'today-leave-count',
      (approvedCount: number, pendingCount: number) => {
        setSocketApprovedLeaveCount(approvedCount)
        setSocketPendingLeaveCount(pendingCount)
      }
    )
    document
      .querySelector('.ant-layout-content')
      ?.addEventListener('scroll', handleBodyScroll)
    return () => {
      document
        .querySelector('.ant-layout-content')
        ?.removeEventListener('scroll', handleBodyScroll)
    }
  }, [])

  const handleBodyScroll = () => {
    const eventPopOverlay: any =
      document.getElementsByClassName('rbc-overlay')[0]
    if (eventPopOverlay) {
      const customEvents = eventPopOverlay.querySelectorAll('.custom-event')
      for (let i = 0; i < customEvents.length; i++) {
        const eventId = customEvents[i]?.id
        if (eventId) {
          const event = document.getElementById(eventId)
          if (event && !customEvents[i].contains(event)) {
            eventPopOverlay.style.top = `${
              event.getBoundingClientRect().y + 45
            }px`
            break
          }
        }
      }
    }
  }

  const {data: AttendanceCount} = useQuery(
    ['todaysAttendance'],
    getTodaysUserAttendanceCount
  )

  const {data: PendingLeaves} = useQuery(
    ['pendingLeave'],
    getPendingLeavesCount
  )

  const {data: ActiveUsers} = useQuery(
    ['DashBoardActiveUsers'],
    getActiveUsersCount
  )

  const {data: TodaysLeave} = useQuery(
    ['DashBoardTodaysLeave'],
    getTodaysUserLeaveCount
  )

  const {data: BirthMonthUsers} = useQuery(
    ['bithMonthUsers'],
    getBirthMonthUsers
  )

  const {data: notices} = useQuery(['DashBoardnotices'], getWeeklyNotices)

  const {data: Holidays} = useQuery(['DashBoardHolidays'], () =>
    getAllHolidays({sort: '-createdAt', limit: '1'})
  )

  const fetchChartQuery = useCallback(async (project: any, logType: any) => {
    setIsChartLoading(true)
    try {
      const response = await getTimeLogChart({project, logType})

      if (response?.status) {
        setChartData(response?.data?.data?.chart || [])
      } else {
        notification({type: 'error', message: 'Failed to generate chart !'})
      }
    } catch (error) {
      notification({type: 'error', message: 'Failed to generate chart !'})
    } finally {
      setIsChartLoading(false)
    }
  }, [])

  const handleSearch = async (projectName: any) => {
    if (!projectName) {
      setProjectArray([])
      return
    } else {
      //else fetch projects from api
      const projects = await getAllProjects({
        project: projectName,
        sort: 'name',
      })
      setProjectArray(projects?.data?.data?.data)
    }
  }

  const optimizedFn = useCallback(debounce(handleSearch, 100), [])

  const todayDate = new Date(MuiFormatDate(new Date()))
  const leavesQuery = useQuery(['DashBoardleaves'], () => getFutureLeaves(), {
    onError: (err) => console.log(err),
  })
  const {data, refetch: projectRefetch} = useQuery(
    ['DashBoardprojects'],
    () =>
      getAllProjects({
        fields:
          '_id,name,-devOps,-createdBy,-designers,-developers,-projectStatus,-projectTags,-projectTypes,-qa,-updatedBy',
      }),
    {enabled: false}
  )

  const {data: logTypes, refetch: logTypeRefetch} = useQuery(
    ['DashBoardlogTypes'],
    () => getLogTypes(),
    {enabled: false}
  )

  useEffect(() => {
    if (NavigationDashboard?.viewProjectTimeLogReport) {
      Promise.all([logTypeRefetch(), projectRefetch()])
    }
  }, [
    NavigationDashboard?.viewProjectTimeLogReport,
    logTypeRefetch,
    projectRefetch,
  ])

  const calCulateWidth = (roles: any) => {
    const roleArray = [
      roles?.viewCoworkersOnLeave,
      roles?.viewCoworkersPunhedInToday,
      roles?.viewTotalCoworkers,
      roles?.viewPendingLeaveRequest,
    ]
    let count = roleArray?.filter((d) => d === true)?.length
    return 24 / count
  }

  const generateChart = (values: any) => {
    if (project === '' || project === undefined) return
    fetchChartQuery(project, logType)
  }
  const handleEventStyle = (event: any) => {
    let eventCopy = {...event}

    let style: any = {
      fontSize: innerWidth <= 1500 ? F10PX : F11PX,
      width: innerWidth <= 729 ? '2.5rem' : 'none',
      margin: '0px',
      fontWeight: '600',
      height: 'fit-content',
      background: event.type === 'notice' ? 'rgb(234 235 239)' : 'transparent',
      textOverflow: 'ellipsis',
    }
    if (eventCopy.type === 'birthday')
      style = {
        ...style,
        fontWeight: '400',

        color: DashboardCalendarColors?.birthday,
      }
    if (eventCopy.type === 'holiday')
      style = {
        ...style,
        fontWeight: '400',

        color: DashboardCalendarColors?.holiday,
      }
    if (eventCopy.type === 'leave') {
      style = {
        ...style,
        fontWeight: '400',

        color:
          event?.leaveStatus === 'pending'
            ? DashboardCalendarColors?.pendingLeave
            : event?.leaveType === 'Late Arrival'
            ? DashboardCalendarColors?.lateArrival
            : DashboardCalendarColors?.approvedLeave,
      }
    }
    if (event.type === 'notice') {
      style = {
        ...style,
        fontWeight: '500',
        background: 'rgb(191 202 255 / 60%)',
        color: DashboardCalendarColors?.notice,
        borderRadius: '10px',
        marginBottom: '6px',
        width: 'auto',
        marginLeft: '12px',
        marginRight: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    }

    return {
      style,
    }
  }

  const leaveUsers = leavesQuery?.data?.data?.data?.users
    ?.map((x: any, index: number) => ({
      eventId: uuidv4(),
      title: x?.user[0],
      leaveStatus: x?.leaveStatus,
      start: new Date(x.leaveDates),
      end: new Date(x.leaveDates),
      type: 'leave',
      date: x?.leaveDates,
      startDate: x?.date,
      halfDay: x?.halfDay,
      leaveType: x?.leaveType?.[0].split(' ').slice(0, 2).join(' '),
      id: x?._id?.[0],
      isSpecial: x?.isSpecial?.[0],
    }))
    ?.sort(compareString)

  let noticesCalendar = notices?.data?.data?.notices?.map((notice: any) => {
    return {
      eventId: uuidv4(),
      title: notice?.noticeType?.name,
      end: notice.endDate
        ? new Date(notice?.endDate)
        : new Date(notice?.startDate),
      start: new Date(notice.startDate),
      type: 'notice',
      name: notice?.title,
      noticeId: notice?._id,
    }
  })

  const holidaysCalendar = Holidays?.data?.data?.data?.[0]?.holidays
    // ?.filter(oneWeekFilterCheck)
    ?.map((x: any) => ({
      eventId: uuidv4(),
      title: x.title,
      start: new Date(x.date),
      end: new Date(x.date),
      type: 'holiday',
    }))

  const BirthDayCalendar = BirthMonthUsers?.data?.data?.users
    ?.sort(function (a: any, b: any) {
      return a?.name < b?.name ? -1 : 1
    })
    ?.map((x: any) => ({
      eventId: uuidv4(),
      title: x.name,
      start: new Date(
        `${new Date(x?.dob).getFullYear()}/${
          new Date(x.dob).getMonth() + 1
        }/${new Date(x.dob).getDate()}`
      ),
      end: new Date(
        `${new Date(x?.dob).getFullYear()}/${
          new Date(x.dob).getMonth() + 1
        }/${new Date(x.dob).getDate()}`
      ),
      type: 'birthday',
    }))
  const calendarEvents = [
    ...(holidaysCalendar || []),
    ...(noticesCalendar || []),
    ...(BirthDayCalendar || []),
    ...(leaveUsers?.sort((a: any, b: any) => {
      const fullNameFirst = a?.title?.split(' ')?.slice(0, -1)?.join(' ')
      const fullNameSecond = b?.title?.split(' ')?.slice(0, -1)?.join(' ')
      return fullNameFirst?.length - fullNameSecond?.length
    }) || []),
  ]

  // check first/second half of the leave
  const leaveExtraInfoHandler = (props: any) => {
    let extraInfo = ''
    if (props.leaveType === 'Late Arrival') {
      extraInfo = 'Late'
    } else if (props?.isSpecial || props?.event?.halfDay === '') {
      extraInfo = ''
    } else {
      if (props?.halfDay === FIRST_HALF) {
        extraInfo = '1st'
      }
      if (props?.halfDay === SECOND_HALF) {
        extraInfo = '2nd'
      }
    }

    return extraInfo
  }

  const CustomEvent = (props: any) => {
    const eventId = props?.event?.eventId
    const nameSplitted = props?.event?.title.split(' ')
    let lastName
    if (nameSplitted.length === 1) lastName = ''
    else lastName = `${nameSplitted.pop().substring(0, 1)}. `
    const shortName = `${nameSplitted.join(' ')} ${lastName ? lastName : ''}`

    const style = {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      margin: '0 !important',
      fontSize: F11PX,
    }

    if (props.event.type === 'birthday') {
      // Check for events that fall on the same date.
      const sameStartEvents = calendarEvents.filter(
        (currentEvent, currentIndex) => {
          return calendarEvents.some((nextEvent, nextIndex) => {
            if (nextIndex !== currentIndex) {
              const nextEventStart = moment(nextEvent?.start).startOf('day')
              return moment(currentEvent?.start)
                .startOf('day')
                .isSame(nextEventStart)
            }
            return false
          })
        }
      )
      // Check for birthday events, whether it's a single event or not.
      const birthdayEvent = sameStartEvents.filter((item, id) => {
        return item?.start === props?.event?.start
      })
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingLeft: birthdayEvent.length ? '10px' : '25px ',
            flexWrap: 'nowrap',
          }}
          id={eventId}
          className="custom-event"
        >
          <p
            style={{
              ...style,
              margin: 0,
              fontWeight: '500',
              fontSize: F11PX,
              flexWrap: 'nowrap',
              alignItems: 'flexs-start',
              width: '100%',
              gap: '4px',
            }}
            id={eventId}
            className="custom-event"
          >
            <i
              className="icon icon-birthday-new gx-fs-sm "
              style={{width: '15px', height: '16px'}}
            />
            <span
              style={{
                overflow: 'hidden',
                textAlign: 'left',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {shortName}
            </span>
          </p>
        </div>
      )
    }
    if (props.event.type === 'holiday') {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingLeft: '10px',
            flexWrap: 'nowrap',
          }}
          id={eventId}
          className="custom-event"
        >
          <p
            style={{
              ...style,
              margin: 0,
              fontWeight: '500',
              fontSize: F11PX,
              flexWrap: 'nowrap',
              alignItems: 'flex-start',
              width: '100%',
              gap: '6px',
            }}
          >
            <i
              className="icon icon-calendar gx-fs-sm"
              style={{
                width: '15px',
                height: '16px',
                marginLeft: '0px',
              }}
            />
            <span
              className="gx-mt-1p"
              style={{
                overflow: 'hidden',
                textAlign: 'left',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {props?.event?.title}
            </span>
          </p>
        </div>
      )
    }
    if (props.event.type === 'leave') {
      let extraInfo = ''
      extraInfo = leaveExtraInfoHandler(props?.event)
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingLeft: '10px',
            flexWrap: 'nowrap',
          }}
          onClick={
            isAdmin
              ? () =>
                  navigate('/leave', {
                    state: {
                      tabKey: '3',
                      leaveStatus: props?.event?.leaveStatus,
                      date: props.event.startDate || props?.event?.date,
                      user: props.event.id,
                    },
                  })
              : () => {}
          }
          id={eventId}
          className="custom-event"
        >
          <p
            style={{
              ...style,
              margin: 0,
              fontWeight: '500',
              fontSize: F11PX,
              flexWrap: innerWidth <= 750 ? 'wrap' : 'nowrap',
              alignItems: 'flex-start',
              width: '100%',
            }}
            id={eventId}
            className="custom-event"
          >
            <LeaveIcon
              width="15px"
              height="16px"
              fill={
                props?.event?.leaveStatus === 'pending'
                  ? DashboardCalendarColors?.pendingLeave
                  : extraInfo === 'Late'
                  ? DashboardCalendarColors?.lateArrival
                  : DashboardCalendarColors?.approvedLeave
              }
            />
            <span
              className="gx-mt-2p"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: '0.9',
              }}
            >{`${shortName}${extraInfo ? '(' + extraInfo + ')' : ''}`}</span>
          </p>
        </div>
      )
    }

    if (props.event.type === 'notice') {
      return (
        <p
          onClick={() =>
            navigate('/noticeboard', {
              state: {name: props?.event?.name, id: props?.event?.noticeId},
            })
          }
          style={{
            margin: '0',
            textAlign: 'center',
            padding: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: '1px',
          }}
          id={eventId}
          className="custom-event"
        >
          {props?.event?.name}
        </p>
      )
    }

    return (
      <p id={eventId} className="custom-event">
        {props?.event?.name}
      </p>
    )
  }

  let components = {
    event: CustomEvent, // used by each view (Month, Day, Week)
  }

  const isAdmin = DASHBOARD_ICON_ACCESS.includes(key)

  //for tooltipAccessor
  const toolTipTitleNameHandler = (event: any) => {
    let title = event?.title
    let extraInfo = leaveExtraInfoHandler(event)

    if (event?.type === 'notice') {
      title = event?.name
    }

    if (extraInfo) {
      title = event?.title + `\xa0(${extraInfo})`
    }

    return title
  }
  return (
    <Auxiliary>
      <Row>
        {NavigationDashboard?.viewTotalCoworkers && (
          <Col
            xl={calCulateWidth(NavigationDashboard)}
            lg={12}
            md={12}
            sm={12}
            xs={24}
          >
            <TotalCountCard
              isLink={NavigationDashboard?.makeclicakbleTotalCoworkers}
              className="gx-bg-cyan-green-gradient"
              totalCount={ActiveUsers?.data?.data?.user || 0}
              label="Total Co-workers"
              onClick={
                !NavigationDashboard?.makeclicakbleTotalCoworkers
                  ? null
                  : () => navigate('/coworkers')
              }
            />
          </Col>
        )}

        {NavigationDashboard?.viewCoworkersPunhedInToday && (
          <Col
            xl={calCulateWidth(NavigationDashboard)}
            lg={12}
            md={12}
            sm={12}
            xs={24}
          >
            <TotalCountCard
              isLink={NavigationDashboard?.makeclickableCoworkersPunchIn}
              icon={LoginOutlined}
              className="gx-bg-pink-purple-corner-gradient"
              totalCount={AttendanceCount?.data?.attendance?.[0]?.count || 0}
              label="Co-workers Punched In Today"
              onClick={
                !NavigationDashboard?.makeclickableCoworkersPunchIn
                  ? null
                  : () => navigate('/todays-overview', {state: 2})
              }
            />
          </Col>
        )}
        {NavigationDashboard?.viewPendingLeaveRequest && (
          <Col
            xl={calCulateWidth(NavigationDashboard)}
            lg={12}
            md={12}
            sm={12}
            xs={24}
          >
            <TotalCountCard
              isLink={NavigationDashboard?.makeclickableLeavePendingRequest}
              icon={ExceptionOutlined}
              className="gx-bg-pink-orange-corner-gradient"
              totalCount={
                socketPendingLeaveCount === 0 || !socketPendingLeaveCount
                  ? PendingLeaves?.data?.data?.leaves || 0
                  : socketPendingLeaveCount
              }
              label="Pending Leave Request"
              onClick={() =>
                !NavigationDashboard?.makeclickableLeavePendingRequest
                  ? null
                  : navigate('/leave', {
                      state: {tabKey: '3', leaveStatus: 'pending'},
                    })
              }
            />
          </Col>
        )}
        {NavigationDashboard?.viewCoworkersOnLeave && (
          <Col
            xl={calCulateWidth(NavigationDashboard)}
            lg={12}
            md={12}
            sm={12}
            xs={24}
          >
            <TotalCountCard
              isLink={NavigationDashboard?.makeclickableCoworkersOnLeave}
              totalCount={
                socketApprovedLeaveCount === 0 || !socketApprovedLeaveCount
                  ? TodaysLeave?.data?.leaves?.[0]?.count || 0
                  : socketApprovedLeaveCount
              }
              label="Co-workers On Leave"
              icon={LogoutOutlined}
              onClick={
                !NavigationDashboard?.makeclickableCoworkersOnLeave
                  ? null
                  : () => navigate('/todays-overview', {state: 1})
              }
            />
          </Col>
        )}

        {(NavigationDashboard?.viewSalaryReview ||
          NavigationDashboard?.viewAnnouncement ||
          NavigationDashboard?.viewHolidays ||
          NavigationDashboard?.viewBirthdays) && (
          <Col
            xl={6}
            lg={24}
            md={24}
            sm={24}
            xs={24}
            className={`gx-order-lg-2 ${
              innerWidth > 1204 && 'announcement-card'
            }`}
          >
            <Widget>
              <EventsAndAnnouncements
                announcements={notices?.data?.data?.notices}
                holidays={Holidays?.data?.data?.data?.[0]?.holidays}
                birthdays={BirthMonthUsers?.data?.data?.users}
              />
            </Widget>
          </Col>
        )}

        <Col xl={18} lg={24} md={24} sm={24} xs={24} className="gx-order-lg-1">
          {NavigationDashboard?.viewCalendar && (
            <Card className="gx-card dashboard-calendar" title="Calendar">
              {leavesQuery?.isLoading ? (
                <div className="gx-d-flex gx-justify-content-around">
                  <Spin />
                </div>
              ) : (
                <div>
                  <div className="gx-rbc-calendar">
                    <Calendar
                      components={components}
                      localizer={localizer}
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      popup
                      eventPropGetter={handleEventStyle}
                      views={['month', 'week', 'day']}
                      onNavigate={monthChangeHandler}
                      // onShowMore={(e: any) => console.log(e)}
                      tooltipAccessor={toolTipTitleNameHandler}
                    />
                  </div>
                  <CalendarLegends />
                </div>
              )}
            </Card>
          )}
          <AccessWrapper role={NavigationDashboard?.viewProjectTimeLogReport}>
            <Card className="gx-card" title="Project Time Log Report">
              <div className="gx-d-flex gx-justify-content-between gx-flex-row gx-mb-3">
                <Form layout="inline" onFinish={generateChart} form={form}>
                  <FormItem name="chart">
                    <Select
                      style={{width: innerWidth <= 504 ? '100%' : 115}}
                      value={chart}
                      onChange={(c: any) => setChart(c)}
                      placeholder="Select Chart"
                      initialValues="Bar Chart"
                      options={[
                        {_id: '1', name: 'Bar Chart'},
                        {_id: '2', name: 'Pie Chart'},
                      ]?.map((x: {_id: string; name: string}) => ({
                        id: x._id,
                        value: x.name,
                      }))}
                    />
                  </FormItem>
                  <FormItem
                    name="project"
                    className="direct-form-project"
                    required
                    rules={[
                      {
                        required: true,
                        validator: async (rule, value) => {
                          try {
                            if (!value) {
                              throw new Error('Project is required.')
                            }
                            if (value?.trim() === '') {
                              throw new Error(
                                'Please enter a valid project name.'
                              )
                            }
                          } catch (err) {
                            throw new Error(err.message)
                          }
                        },
                      },
                    ]}
                  >
                    <Select
                      showSearchIcon={true}
                      value={project}
                      onChange={(c: any) => {
                        if (c) fetchChartQuery(c, logType)
                        setProject(c)
                      }}
                      handleSearch={optimizedFn}
                      placeholder="Search Project"
                      options={(projectArray || [])?.map(
                        (x: {_id: string; name: string}) => ({
                          id: x._id,
                          value: x.name,
                        })
                      )}
                      inputSelect
                    />
                  </FormItem>
                  <FormItem name="logType" className="direct-form-project">
                    <Select
                      value={logType}
                      onChange={(c: any) => setlogType(c)}
                      placeholder="Select Log Types"
                      mode="multiple"
                      options={logTypes?.data?.data?.data?.map(
                        (x: {_id: string; name: string}) => ({
                          id: x._id,
                          value: x.name,
                        })
                      )}
                    />
                  </FormItem>
                  <FormItem>
                    <Button type="primary" key="submit" htmlType="submit">
                      Generate Chart
                    </Button>
                  </FormItem>
                </Form>
              </div>
              {project && (
                <div>
                  {chartData && chartData.length ? (
                    <div>
                      {chart === '2' ? (
                        <CustomActiveShapePieChart
                          data={chartData?.map((x: any) => {
                            return {
                              name: x.logType[0].name,
                              color: x.logType[0].color,
                              value: +x.timeSpent?.toFixed(2),
                            }
                          })}
                        />
                      ) : (
                        <TinyBarChart
                          data={chartData?.map((x: any) => ({
                            name: x.logType[0].name,
                            color: x.logType[0].color,
                            time: +x.timeSpent?.toFixed(2),
                          }))}
                        />
                      )}
                    </div>
                  ) : isChartLoading ? (
                    <div
                      style={{
                        position: 'relative',
                        height: '50px',
                      }}
                    >
                      <Spin style={{position: 'absolute', inset: '40% 0'}} />
                    </div>
                  ) : chartData === undefined ? (
                    ''
                  ) : chartData.length === 0 ? (
                    'No Results Found.'
                  ) : (
                    ''
                  )}
                </div>
              )}
            </Card>
          </AccessWrapper>
        </Col>
      </Row>
    </Auxiliary>
  )
}

export default Dashboard
