import {changeDate, dateToDateFormat} from 'helpers/utils'

export const SALARY_REVIEW_COLUMN = (sortedInfo) => [
  {
    title: 'Co-workers',
    dataIndex: 'coworkers',
    key: 'coworkers',
    sorter: (a, b) => {
      return a.coworkers.toString().localeCompare(b.coworkers.toString())
    },
    sortOrder: sortedInfo.columnKey === 'coworkers' && sortedInfo.order,
  },
  {
    title: 'Upcoming Review Date',
    dataIndex: 'upcomingreviewdate',
    key: 'upcomingreviewdate',
    sorter: (a, b) =>
      new Date(dateToDateFormat(a.upcomingreviewdate)) -
      new Date(dateToDateFormat(b.upcomingreviewdate)),
    sortOrder:
      sortedInfo.columnKey === 'upcomingreviewdate' && sortedInfo.order,
  },
  {
    title: 'Past Review Dates',
    dataIndex: 'pastreview',
    key: 'pastreview',
    render: (text, record) => text?.map((d) => <div>{changeDate(d)}</div>),
  },
]

export const REVIEWDATES = [
  {id: 90, value: 'Upcoming 90 Days'},
  {id: 180, value: 'Upcoming 180 Days'},
  {id: 365, value: 'Upcoming 365 Days'},
  {id: '', value: 'All'},
]
