import React from 'react'
import {PROJECTS} from 'helpers/routePath'
import CustomIcon from 'components/Elements/Icons'

const WEEKLY_REPORT_COLUMNS = (sortedInfo, navigateToProjectLogs) => [
  {
    title: 'Project',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => {
      return a?.name?.toString().localeCompare(b?.name?.toString())
    },
    sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
  },
  {
    title: 'Client',
    dataIndex: 'client',
    key: 'client',
    sorter: (a, b) =>
      a?.client?.toString().localeCompare(b?.client?.toString()),
    sortOrder: sortedInfo.columnKey === 'client' && sortedInfo.order,
  },
  {
    title: 'Time Spent',
    dataIndex: 'timeSpent',
    key: 'timeSpent',
    sorter: (a, b) => a?.timeSpent - b?.timeSpent,

    sortOrder: sortedInfo.columnKey === 'timeSpent' && sortedInfo.order,
  },

  {
    title: 'Action',
    key: 'action',
    render: (text, record) => {
      if (record.key === 'Other' || !record.key) {
        return ''
      }
      return (
        <span>
          <span
            className="gx-link"
            onClick={() =>
              navigateToProjectLogs(`/${PROJECTS}/${record.key}`, true)
            }
          >
            <CustomIcon name="view" />
          </span>
        </span>
      )
    },
  },
]

export {WEEKLY_REPORT_COLUMNS}
