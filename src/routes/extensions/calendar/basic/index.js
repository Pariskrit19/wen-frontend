import React from 'react'
import {Calendar, momentLocalizer} from 'react-big-calendar'
import moment from 'moment'
import {events} from '../events'

const localizer = momentLocalizer(moment)

const Basic = (props) => {
  return (
    <div className="gx-main-content">
      <div className="gx-rbc-calendar">
        <Calendar
          {...props}
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
        />
      </div>
    </div>
  )
}

export default Basic
