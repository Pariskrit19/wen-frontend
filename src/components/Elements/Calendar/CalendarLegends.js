import {DashboardCalendarColors} from 'constants/CalendarColors'
import React from 'react'

const calendarEvents = [
  {title: 'Approved Leave', color: DashboardCalendarColors?.approvedLeave},
  {title: 'Pending Leave', color: DashboardCalendarColors?.pendingLeave},
  {title: 'Leave Cut (Late)', color: DashboardCalendarColors?.lateArrival},
  {title: 'Notice', color: DashboardCalendarColors?.noticeBackground},
  {title: 'Holiday', color: DashboardCalendarColors?.holiday},
  {title: 'Birthday', color: DashboardCalendarColors?.birthday},
]

const CalendarLegends = () => {
  return (
    <div
      style={{
        border: '1px solid #ebebeb',
        borderRadius: '5px',
        padding: '0.5rem 1rem',
        paddingBottom: '0',
      }}
    >
      <p style={{fontSize: '12px', fontWeight: 500}}>Indicators</p>
      <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
        {calendarEvents.map((event) => (
          <div className="gx-d-flex" style={{gap: '0.4rem'}} key={event.color}>
            <div
              style={{
                background: event.color,
                color: event.color,
                width: 12,
                height: 12,
                borderRadius: 6,
              }}
            ></div>
            <p style={{fontSize: '10px'}}>{event.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalendarLegends
