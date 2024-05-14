import {Avatar, Timeline} from 'antd'
import React from 'react'
import ActivityItem from '../dashboard/CRM/ActivityItem'
import {changeDate, dayCheck, oneWeekFilterCheck} from 'helpers/utils'
import {Collapse} from 'antd'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'

const TimeLineItem = Timeline.Item
const {Panel} = Collapse

export const events: any = ({
  announcementsData = [],
  holidaysData = [],
  birthdayData = [],
  SalaryReviewData = [],
}): any => [
  {
    id: 1,
    day: 'Announcements',
    Icon: <i className="icon icon-alert gx-fs-xxl" />,
    tasks: announcementsData || [],
  },
  {
    id: 2,
    day: 'Holidays',
    Icon: <i className="icon icon-calendar gx-fs-xxl" />,
    tasks: holidaysData || [],
  },
  {
    id: 3,
    day: 'Salary Review',
    Icon: <i className="icon icon-schedule gx-fs-xxl" />,
    tasks: SalaryReviewData,
  },
  {
    id: 4,
    day: 'Birthdays',
    Icon: <i className="icon icon-birthday-new gx-fs-xxl" />,
    tasks: birthdayData,
  },
]

function EventsAndAnnouncements({
  announcements,
  holidays,
  birthdays,
}: {
  announcements: any
  holidays: any
  birthdays: any[]
}) {
  const {role: {permission: {Dashboard = {}} = {}} = {}} =
    useSelector(selectAuthUser)
  const announcementsData = announcements?.map((x: any) => ({
    id: x._id,
    name: x.title,
    title: [
      <>
        <p className="gx-mb-0">{x.startDate && changeDate(x.startDate)}</p>
        {x?.title}
      </>,
    ],
    Icon: 'notification',
    imageList: x?.image,
    details: x?.details,
  }))

  const holidaysData = holidays?.filter(oneWeekFilterCheck)?.map((x: any) => ({
    id: x._id,
    name: x.title,
    title: [
      <div style={{marginTop: -5}}>
        <p className="gx-mb-0 gx-font-weight-medium">{x.title}</p>{' '}
        <p className="gx-mb-0 gx-font-weight-light">
          {x.date && changeDate(x.date)}
        </p>
      </div>,
    ],
    Icon: 'important-o',
  }))

  const sortedBirthdays = birthdays
    ?.map((birthday: any) => {
      const yearMonthAndDay = birthday.dob.split('T')[0].split('-')
      return {
        ...birthday,
        yearMonthDay:
          yearMonthAndDay[0] + yearMonthAndDay[1] + yearMonthAndDay[2],
      }
    })
    ?.sort(function (a, b) {
      var af = a?.yearMonthDay
      var bf = b?.yearMonthDay
      var as = a?.name
      var bs = b?.name

      if (af === bf) {
        return as < bs ? -1 : as > bs ? 1 : 0
      } else {
        return af < bf ? -1 : 1
      }
    })

  const birthdayData = sortedBirthdays?.map((x: any) => ({
    id: x._id,
    name: x.name,
    title: [
      <>
        <p className="gx-mb-0 gx-font-weight-medium">{x.name}</p>{' '}
        <p className="gx-mb-0 gx-font-weight-light">{dayCheck(x.dob)}</p>
      </>,
    ],
    avatar: x.photoURL || '',
  }))

  function getName(task: any, shape: any) {
    if (task?.imageList?.url) {
      return (
        <Avatar
          shape={shape}
          size="large"
          className="gx-size-30 gx-bg-primary"
          src={task?.imageList?.url}
        />
      )
    } else if (task?.avatar === '') {
      let nameSplit = task?.name.split(' ')
      if (task?.name.split(' ').length === 1) {
        const initials = nameSplit[0].charAt(0).toUpperCase()
        return (
          <Avatar
            shape={shape}
            size="large"
            className="gx-size-30 gx-bg-primary"
          >
            {initials}
          </Avatar>
        )
      } else {
        const initials =
          nameSplit[0].charAt(0).toUpperCase() +
          nameSplit[1].charAt(0).toUpperCase()
        return (
          <Avatar
            shape={shape}
            size="large"
            className="gx-size-30 gx-bg-primary"
          >
            {initials}
          </Avatar>
        )
      }
    } else if (task?.avatar === undefined || task.avatar === null) {
      return <i className={`icon icon-${task.Icon} gx-fs-xl`} />
    } else {
      return (
        <Avatar
          shape={shape}
          size="large"
          className="gx-size-30 gx-bg-primary"
          src={task.avatar}
        />
      )
    }
  }
  return (
    <div className="gx-entry-sec">
      {/* <WidgetHeader title="Upcoming Events" /> */}
      {events({
        announcementsData,
        holidaysData,
        birthdayData,
      })
        ?.filter((data: any) => {
          if (data?.day === 'Announcements' && Dashboard?.viewAnnouncement)
            return true
          else if (data?.day === 'Holidays' && Dashboard?.viewHolidays)
            return true
          else if (data?.day === 'Birthdays' && Dashboard?.viewBirthdays)
            return true
          else return false
        })
        .map((activity: any, index: number) => (
          <div className="gx-timeline-info" key={'activity' + index}>
            <div className="gx-flex-row gx-align-items-center gx-column-gap-10 gx-mb-3 gx-border-bottom gx-pb-2 ">
              {activity.Icon}
              <h3 className=" gx-mb-1 ">{activity?.day}</h3>
            </div>
            {activity.day === 'Announcements' ? (
              activity?.tasks?.map((task: any, index: number) => {
                return (
                  <Collapse
                    expandIconPosition="end"
                    bordered={false}
                    className="gx-dashboard-collapse"
                    key={'timeline' + index}
                  >
                    <Panel
                      header={
                        <TimeLineItem dot={getName(task, '')}>
                          <ActivityItem task={task} />
                        </TimeLineItem>
                      }
                      key=""
                    >
                      {task?.details}
                    </Panel>
                  </Collapse>
                )
              })
            ) : (
              <Timeline>
                {activity?.tasks?.map((task: any, index: number) => {
                  return (
                    <TimeLineItem
                      key={'timeline' + index}
                      dot={getName(task, '')}
                    >
                      <ActivityItem task={task} key={'timeline' + index} />
                      {/* <p>bob2</p> */}
                    </TimeLineItem>
                  )
                })}
              </Timeline>
            )}
          </div>
        ))}
    </div>
  )
}

export default EventsAndAnnouncements
