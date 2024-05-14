import CustomIcon from 'components/Elements/Icons'
import moment from 'moment'
import React, {ReactElement} from 'react'

interface tableCol {
  title: string
  dataIndex?: string
  key: any
  width?: number
  sorter?: (a: any, b: any) => any
  sortOrder?: any
  render?: (text: any, record: any) => ReactElement | null
}

const OVERVIEW_LEAVES = (sortedInfo: any): tableCol[] => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    sorter: (a, b) => {
      return a.name.toString().localeCompare(b.name.toString())
    },
    sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
  },
  {
    title: 'Absent From',
    dataIndex: 'absentFrom',
    key: 'absentFrom',
    width: 150,
    sorter: (a, b) =>
      +moment(a.absentFrom, 'DD-MM-YYYY') - +moment(b.absentFrom, 'DD-MM-YYYY'),
    sortOrder: sortedInfo.columnKey === 'absentFrom' && sortedInfo.order,
  },
  {
    title: 'Till',
    dataIndex: 'till',
    key: 'till',
    width: 150,
    sorter: (a, b) =>
      +moment(a.till, 'DD-MM-YYYY') - +moment(b.till, 'DD-MM-YYYY'),
    sortOrder: sortedInfo.columnKey === 'till' && sortedInfo.order,
  },
  {
    title: 'Full/Half',
    dataIndex: 'fullHalf',
    width: 150,
    key: 'fullHalf',
    sorter: (a, b) =>
      a.fullHalf.toString().localeCompare(b.fullHalf.toString()),

    sortOrder: sortedInfo.columnKey === 'fullHalf' && sortedInfo.order,
  },
  {
    title: 'Period',
    dataIndex: 'period',
    width: 150,
    key: 'period',
    sorter: (a, b) => {
      let first = parseFloat(
        a.period
          .replace('/Days|Day/gi', '')
          .replace('First Half', '0.8')
          .replace('Second Half', '0.9')
      )
      let second = parseFloat(
        b.period
          .replace('/Days|Day/gi', '')
          .replace('First Half', '0.8')
          .replace('Second Half', '0.9')
      )
      return first - second
    },

    sortOrder: sortedInfo.columnKey === 'period' && sortedInfo.order,
  },
]

const OVERVIEW_CHECKEDIN = (
  sortedInfo: any,
  handleShowMap: any
): tableCol[] => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    sorter: (a, b) => {
      return a.name.toString().localeCompare(b.name.toString())
    },
    sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
  },
  {
    title: 'Punched In At',
    dataIndex: 'checkIn',
    key: 'checkIn',
    width: 150,
    sorter: (a, b) => a.checkIn.toString().localeCompare(b.checkIn.toString()),
    sortOrder: sortedInfo.columnKey === 'checkIn' && sortedInfo.order,
  },
  {
    title: 'Punched In IP',
    dataIndex: 'punchInIp',
    key: 'punchInIp',
    width: 150,
  },
  {
    title: 'Punch In Location',
    dataIndex: 'checkInLocation',
    key: 'checkInLocation',
    width: 150,
    render: (text, record) => (
      <span
        className="gx-link"
        onClick={() => {
          handleShowMap(record)
        }}
      >
        {text}
      </span>
    ),
  },
  {
    title: 'Punched Out At',
    dataIndex: 'checkOut',
    width: 150,
    key: 'checkOut',
    sorter: (a, b) =>
      a.checkOut.toString().localeCompare(b.checkOut.toString()),

    sortOrder: sortedInfo.columnKey === 'checkOut' && sortedInfo.order,
  },
  {
    title: 'Punched Out IP',
    dataIndex: 'punchOutIp',
    key: 'punchOutIp',
    width: 150,
  },
  {
    title: 'Punch Out Location',
    dataIndex: 'checkOutLocation',
    width: 150,
    key: 'checkOutLocation',
    render: (text, record) => (
      <span
        className="gx-link"
        onClick={() => {
          handleShowMap(record, 'out')
        }}
      >
        {text}
      </span>
    ),
  },
]

const OVERVIEW_NOTCHECKEDIN = (sortedInfo: any): tableCol[] => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    sorter: (a, b) => {
      return a.name.toString().localeCompare(b.name.toString())
    },
    sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
  },
  {
    title: 'Punched In At',
    dataIndex: 'checkIn',
    key: 'checkIn',
    width: 150,
    sorter: (a, b) => a.checkIn.toString().localeCompare(b.checkIn.toString()),
    sortOrder: sortedInfo.columnKey === 'checkIn' && sortedInfo.order,
  },

  {
    title: 'Punched Out At',
    dataIndex: 'checkOut',
    width: 150,
    key: 'checkOut',
    sorter: (a, b) =>
      a.checkOut.toString().localeCompare(b.checkOut.toString()),

    sortOrder: sortedInfo.columnKey === 'checkOut' && sortedInfo.order,
  },
]

const OVERVIEW_LATEPUNCHIN = (
  sortedInfo: any,
  handleToggleModal: any
): tableCol[] => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    sorter: (a, b) => {
      return a.name.toString().localeCompare(b.name.toString())
    },
    sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
  },
  {
    title: 'Punched In At',
    dataIndex: 'checkIn',
    key: 'checkIn',
    width: 150,
    sorter: (a, b) => a.checkIn.toString().localeCompare(b.checkIn.toString()),
    sortOrder: sortedInfo.columnKey === 'checkIn' && sortedInfo.order,
  },

  {
    title: 'Punched Out At',
    dataIndex: 'checkOut',
    width: 150,
    key: 'checkOut',
    sorter: (a, b) =>
      a.checkOut.toString().localeCompare(b.checkOut.toString()),

    sortOrder: sortedInfo.columnKey === 'checkOut' && sortedInfo.order,
  },

  {
    title: 'Late By',
    dataIndex: 'lateBy',
    width: 150,
    key: 'lateBy',
    sorter: (a, b) => a.lateByInMilliseconds - b.lateByInMilliseconds,

    sortOrder: sortedInfo.columnKey === 'lateBy' && sortedInfo.order,
  },
  {
    title: 'Action',
    key: 'action',
    width: 110,
    render: (text, record) => {
      return (
        <div className="gx-d-flex">
          <span
            className="gx-link"
            onClick={() => handleToggleModal(record?.lateReason)}
          >
            <CustomIcon name="view" />
          </span>
        </div>
      )
    },
  },
]

const DEADLINE_PROJECTS = (
  sortedInfo: any,
  navigateToProjectLogs: (a: string) => void
): tableCol[] => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    sorter: (a, b) => {
      return a.name.toString().localeCompare(b.name.toString())
    },
    sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
  },
  {
    title: 'Action',
    key: 'action',
    width: 250,
    render: (text, record) => {
      return (
        <span
          className="gx-link"
          onClick={() => navigateToProjectLogs(`${record._id}-${record.slug}`)}
        >
          Log Time
        </span>
      )
    },
  },
]

export {
  OVERVIEW_LEAVES,
  OVERVIEW_CHECKEDIN,
  OVERVIEW_NOTCHECKEDIN,
  DEADLINE_PROJECTS,
  OVERVIEW_LATEPUNCHIN,
}
