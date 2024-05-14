import React from 'react'
import {Divider, Popconfirm} from 'antd'
import {getIsAdmin, roundedToFixed} from 'helpers/utils'
import CustomIcon from 'components/Elements/Icons'
import AccessWrapper from 'components/Modules/AccessWrapper'
import moment from 'moment'

const OTHER_LOGTIMES_COLUMNS = (
  sortedInfo,
  onOpenEditModal,
  confirmDelete,
  user,
  role
) => [
  {
    title: 'Date',
    dataIndex: 'logDate',
    key: 'logDate',
    // width: 120,
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'logDate' && sortedInfo.order,
  },
  {
    title: 'Hours',
    dataIndex: 'totalHours',
    key: 'totalHours',
    // width: 70,
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'totalHours' && sortedInfo.order,
    render: (value) => roundedToFixed(value || 0, 2),
  },

  {
    title: 'Type',
    dataIndex: 'logType',
    // width: 100,
    key: 'logType',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'logType' && sortedInfo.order,
  },
  {
    title: 'Remarks',
    dataIndex: 'remarks',
    width: '40%',
    key: 'remarks',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'remarks' && sortedInfo.order,
    render: (text, record) => {
      return <span>{text}</span>
    },
  },
  {
    title: 'Added By',
    dataIndex: 'user',
    // width: 150,
    key: 'user',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'user' && sortedInfo.order,
  },

  {
    title: 'Action',
    key: 'action',
    width: 160,
    render: (text, record) => {
      let logDateTime = record?.logDate?.split('/')
      let sendDate = `${logDateTime[1]}/${logDateTime[0]}/${logDateTime[2]}`
      return (
        !getIsAdmin() && (
          <span style={{display: 'flex'}}>
            <span
              className="gx-link action-flex"
              onClick={() => onOpenEditModal(record, true)}
            >
              <CustomIcon name="view" />
              {(role?.[`Log Time`]?.deleteLogTime ||
                role?.[`Log Time`]?.editLogTime) && <Divider type="vertical" />}
            </span>

            {(record.user === user &&
              moment(sendDate) >=
                moment().subtract(1, 'days').startOf('day')) ||
            role?.[`Log Time`]?.editLogTime ? (
              <span
                className="gx-link action-flex"
                onClick={() => onOpenEditModal(record)}
              >
                <CustomIcon name="edit" />
                {role?.[`Log Time`]?.deleteLogTime && (
                  <Divider type="vertical" />
                )}
              </span>
            ) : (
              ''
            )}

            <AccessWrapper role={role?.[`Log Time`]?.deleteLogTime}>
              <Popconfirm
                title="Are you sure to delete this Log?"
                onConfirm={() => confirmDelete(record)}
                okText="Yes"
                cancelText="No"
              >
                <span className="gx-link gx-text-danger">
                  <CustomIcon name="delete" />
                </span>
              </Popconfirm>
            </AccessWrapper>
          </span>
        )
      )
    },
  },
]

export {OTHER_LOGTIMES_COLUMNS}
