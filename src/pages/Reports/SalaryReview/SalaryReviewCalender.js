import {useQuery} from '@tanstack/react-query'
import {Spin} from 'antd'
import moment from 'moment'
import React from 'react'

import {Calendar, momentLocalizer} from 'react-big-calendar'
import {getSalaryReviewUsers} from 'services/users/userDetails'

const localizer = momentLocalizer(moment)

const SalaryReviewCalender = () => {
  const {
    data: salaryReview,
    isLoading,
    isFetching,
  } = useQuery(
    ['usersSalaryReview'],
    () =>
      getSalaryReviewUsers({
        days: '',
        user: '',
      }),
    {
      select: (res) =>
        res?.data?.data?.users?.map((d) => ({
          title: d?.name,
          allDay: true,
          start: new Date(d?.newSalaryReviewDate),
          end: new Date(d?.newSalaryReviewDate),
        })),
    }
  )

  const handleEventStyle = (event) => {
    let style = {
      color: 'white',
      padding: '1px 10px',
      width: event.fullWidth ? '100%' : 'fit-content',
      margin: 'auto',
      marginBottom: '0.2rem',
      height: 'auto',
    }

    return {
      style,
    }
  }

  return (
    <div>
      <Spin spinning={isLoading || isFetching}>
        <div className="gx-rbc-calendar">
          <Calendar
            eventPropGetter={handleEventStyle}
            localizer={localizer}
            events={salaryReview}
            startAccessor="start"
            endAccessor="end"
            popup
            views={['month', 'week', 'day']}
          />
        </div>
      </Spin>
    </div>
  )
}

export default SalaryReviewCalender
