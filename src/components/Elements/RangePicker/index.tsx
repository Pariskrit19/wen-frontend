import React from 'react'
import {DatePicker} from 'antd'
import useWindowsSize from 'hooks/useWindowsSize'
import moment from 'moment'

const {RangePicker: DateRangePicker} = DatePicker

function RangePicker({
  handleChangeDate,
  date,
  disabledDate,
}: {
  handleChangeDate: any
  date: any
  disabledDate?: any
}) {
  const {innerWidth} = useWindowsSize()

  return (
    <DateRangePicker
      onChange={handleChangeDate}
      value={date}
      style={{width: innerWidth <= 640 ? '100%' : '240px'}}
      disabledDate={disabledDate ? disabledDate : false}
    />
  )
}

export default RangePicker
