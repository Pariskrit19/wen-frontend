import React, {useState} from 'react'
import {Card, Spin} from 'antd'
import {useNavigate} from 'react-router-dom'
import {Calendar, momentLocalizer} from 'react-big-calendar'
import moment from 'moment'
import {useQuery} from '@tanstack/react-query'
import {milliSecondIntoHours, MuiFormatDate, sortFromDate} from 'helpers/utils'
import {searchAttendacentOfUser} from 'services/attendances'
import {monthlyState} from 'constants/Attendance'
import {getLeavesOfAllUsers} from 'services/leaves'
import {ATTENDANCE} from 'helpers/routePath'
import {FIRST_HALF} from 'constants/Leaves'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {getAllHolidays} from 'services/resources'
import {useCleanCalendar} from 'hooks/useCleanCalendar'
import {THEME_TYPE_DARK} from 'constants/ThemeSetting'
import {F11PX} from 'constants/FontSizes'

const localizer = momentLocalizer(moment)

function AttendanceCalendar() {
  const navigate = useNavigate()

  const user = useSelector(selectAuthUser)
  const {allocatedOfficeHours} = useSelector(
    (state: any) => state.configurations
  )
  const [date, setDate] = useState(monthlyState)
  const {themeType} = useSelector((state: any) => state.settings)
  const darkMode = themeType === THEME_TYPE_DARK
  const {monthChangeHandler} = useCleanCalendar()

  const {data, isLoading} = useQuery(['userAttendance', user, date], () =>
    searchAttendacentOfUser({
      userId: user._id,
      fromDate: date?.[0] ? MuiFormatDate(date[0]) + 'T00:00:00Z' : '',
      toDate: date?.[1] ? MuiFormatDate(date[1]) + 'T00:00:00Z' : '',
    })
  )
  const {data: userLeaves} = useQuery(
    ['userLeaves', user],
    () => getLeavesOfAllUsers('approved', user._id),
    {
      select: (res) => {
        return res?.data?.data?.data
      },
    }
  )
  const {data: Holidays} = useQuery(['DashBoardHolidays'], () =>
    getAllHolidays({sort: '-createdAt', limit: '1'})
  )
  const holidaysCalendar = Holidays?.data?.data?.data?.[0]?.holidays?.map(
    (x: any) => ({
      title: x.title,
      start: new Date(x.date),
      end: new Date(x.date),
      type: 'holiday',
    })
  )

  const handleCalendarRangeChange = (calendarDate: any) => {
    const mom = moment(moment(calendarDate[0]).add(1, 'days')).utc().format()
    const filterByWeek = calendarDate.length === 7
    const filterByDay = calendarDate.length === 1
    if (filterByWeek) {
      setDate([calendarDate[0], calendarDate[6]])
    } else if (filterByDay) {
      setDate([calendarDate[0], mom])
    } else {
      if (moment(calendarDate.start).date() !== 1) {
        const startDate = moment(calendarDate.start)
          .endOf('month')
          .add(1, 'day')
        const endDate = moment(startDate).endOf('month')
        setDate([startDate, endDate])
      } else {
        setDate([calendarDate.start, moment(calendarDate.start).endOf('month')])
      }
    }
  }

  const handleEventStyle = (event: any) => {
    let style: any = {
      fontSize: F11PX,
      margin: '0px auto',
      marginTop: '1.5px',
      fontWeight: '500',
      height: 'auto',
      padding: '6px 10px',
      color: darkMode ? 'white' : '#100c0ca6',
      backgroundColor: 'transparent',
      borderRadius: '16px',
      width: '90%',
      letterSpacing: '0.3px',
      paddingLeft: '15px',
    }

    if (event.type === 'leave') {
      style = {
        ...style,
        backgroundColor: '#DAF6F4',
        color: '#547362',
      }
    }

    if (event.isLessHourWorked)
      style = {
        ...style,
        backgroundColor: 'rgb(242 208 208)',
        color: '#b52325',
      }
    if (!event.isLessHourWorked && event.type !== 'leave')
      style = {
        ...style,
        backgroundColor: '#EFEBFF',
        color: '#3C3467',
      }
    if (event.type === 'holiday') {
      style = {
        ...style,
        backgroundColor: '#FFE8D0',
        color: 'rgb(99 92 92)',
      }
    }

    return {
      style,
    }
  }

  let leaves: any[] = []

  userLeaves?.forEach((leave: any) => {
    let extraInfo = ''

    if (leave?.halfDay) {
      extraInfo = leave?.halfDay === FIRST_HALF ? '1st' : `2nd`
    }

    leave?.leaveDates?.forEach((date: string) => {
      leaves.push({
        id: leave?._id,
        title: `${leave?.leaveType?.name}${
          extraInfo ? '(' + extraInfo + ')' : ''
        }`,
        start: new Date(date),
        end: new Date(date),
        type: 'leave',
        allDay: !!!leave?.halfDay,
      })
    })
  })

  const attendances = data?.data?.data?.attendances[0]?.data?.map(
    (attendance: any) => {
      const sortedAttendance = sortFromDate(
        attendance?.data,
        'punchInTime'
      ).filter((attendance: any) => attendance.punchOutTime)

      const totalHoursWorked = milliSecondIntoHours(
        sortedAttendance
          ?.map((x) =>
            x?.punchOutTime
              ? new Date(x?.punchOutTime).getTime() -
                new Date(x?.punchInTime).getTime()
              : ''
          )
          .filter(Boolean)
          ?.reduce((accumulator, value) => {
            return +accumulator + +value
          }, 0)
      )
      const hrsMin = totalHoursWorked
        ?.trim()
        ?.split(' ')
        ?.filter((item) => !isNaN(+item))

      const time = totalHoursWorked?.trim()?.split(' ')

      let totalTime = 0
      if (hrsMin?.length === 2) {
        totalTime = +hrsMin[0] + +hrsMin[1] / 60
      }
      if (hrsMin?.length === 1) {
        if (time?.[1] === 'hrs') {
          totalTime = +hrsMin[0]
        } else {
          totalTime = +hrsMin[0] / 60
        }
      }

      if (totalHoursWorked.trim() !== '') {
        return {
          id: attendance?._id,
          title: totalHoursWorked,
          start: new Date(attendance._id?.attendanceDate),
          end: new Date(attendance._id?.attendanceDate),
          isLessHourWorked: totalTime < allocatedOfficeHours,
          allDay: true,
        }
      } else return null
    }
  )

  const handleSelectEvent = (data: any) => {
    if (data.type === 'leave')
      navigate(`/leave`, {
        state: {tabKey: '2', date: new Date(data?.start).toJSON()},
      })
    else if (data.type === 'holiday') {
      navigate(`/resources/holiday`)
    } else {
      navigate(`/${ATTENDANCE}`, {
        state: {tab: '1', date: data?.id?.attendanceDate},
      })
    }
  }

  //process to show only one event in a day

  //to prioritize attendance, calculating dates where the user has attendance
  const datesWithAttendances = attendances
    ?.filter((attendance: any) => attendance?.id)
    ?.map((attendance: any) => MuiFormatDate(attendance?.start))

  const filteredHolidaysDates = holidaysCalendar?.map((holiday: any) =>
    MuiFormatDate(holiday?.start)
  )
  // leaves should be filtered based on both attendance and holidays dates

  //before that finding unique leaves i.e. one per day

  let uniqueLeaves: any[] = []

  for (let leave of leaves) {
    let isDuplicate = false

    // for (let uniqueLeave of uniqueLeaves) {
    //   if (MuiFormatDate(leave?.start) === MuiFormatDate(uniqueLeave?.start)) {
    //     isDuplicate = true
    //     break
    //   }
    // }

    if (!isDuplicate) {
      uniqueLeaves.push(leave)
    }
  }

  const filteredLeaves = uniqueLeaves?.filter(
    (leave: any) =>
      !(
        datesWithAttendances?.includes(MuiFormatDate(leave?.start)) ||
        filteredHolidaysDates?.includes(MuiFormatDate(leave?.start))
      ) || !leave?.allDay
  )

  return (
    <Card className="gx-card attendance-calendar" title="Calendar">
      <Spin spinning={isLoading}>
        <div className="gx-rbc-calendar">
          <Calendar
            localizer={localizer}
            events={[
              ...(attendances || []),
              ...(holidaysCalendar || []),
              ...(filteredLeaves || []),
            ]}
            startAccessor="start"
            endAccessor="end"
            onRangeChange={handleCalendarRangeChange}
            popup
            views={['month', 'week', 'day']}
            eventPropGetter={handleEventStyle}
            onSelectEvent={handleSelectEvent}
            onNavigate={monthChangeHandler}
            // dayPropGetter={DayPropGetter}
          />
        </div>
      </Spin>
    </Card>
  )
}

export default AttendanceCalendar
