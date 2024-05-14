import React from 'react'
import {Divider, Popconfirm} from 'antd'
import {getIsAdmin, roundedToFixed} from 'helpers/utils'
import CustomIcon from 'components/Elements/Icons'
import AccessWrapper from 'components/Modules/AccessWrapper'
import moment from 'moment'

const LOGTIMES_COLUMNS = (
  sortedInfo,
  onOpenEditModal,
  confirmDelete,
  hideAdminFeature,
  user,
  role,
  navigateToProjectLogs
) =>
  hideAdminFeature
    ? [
        {
          title: 'Project',
          dataIndex: 'project',
          key: 'project',
          // width: 120,
          sorter: true,
          sortOrder: sortedInfo.columnKey === 'project' && sortedInfo.order,
          render: (text, record) => {
            return (
              <p
                onClick={() => {
                  if (!record?.projectId) return
                  navigateToProjectLogs(
                    `/projects/${record?.projectId}-${record?.slug}`
                  )
                }}
                className={record?.projectId && 'project-name'}
              >
                {text}
              </p>
            )
          },
        },
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
          // width: 400,
          key: 'remarks',
          sorter: true,
          sortOrder: sortedInfo.columnKey === 'remarks' && sortedInfo.order,
          render: (text, record) => {
            return (
              <p style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                {text}
              </p>
            )
          },
        },
        {
          title: 'Action',
          key: 'action',
          width: 150,
          render: (text, record) => {
            let logDateTime = record?.logDate?.split('/')
            let sendDate = `${logDateTime[1]}/${logDateTime[0]}/${logDateTime[2]}`
            return (
              !getIsAdmin() && (
                <span>
                  <span
                    className="gx-link"
                    onClick={() => onOpenEditModal(record, true)}
                  >
                    <CustomIcon name="view" />
                  </span>
                  {moment(sendDate) >=
                    moment().subtract(1, 'days').startOf('day') &&
                    record?.otStatus !== 'R' &&
                    record?.otStatus !== 'A' && (
                      <span
                        className="gx-link"
                        onClick={() => onOpenEditModal(record)}
                      >
                        <Divider type="vertical" />
                        <CustomIcon name="edit" />
                      </span>
                    )}

                  <AccessWrapper role={role?.[`Log Time`]?.deleteLogTime}>
                    <Popconfirm
                      title="Are you sure to delete this Log?"
                      onConfirm={() => confirmDelete(record)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <span className="gx-link gx-text-danger">
                        <Divider type="vertical" />
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
    : [
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
          // width: 400,
          key: 'remarks',
          sorter: true,
          sortOrder: sortedInfo.columnKey === 'remarks' && sortedInfo.order,
          render: (text, record) => {
            return (
              <p style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                {text}
              </p>
            )
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
          width: 150,
          render: (text, record) => {
            let logDateTime = record?.logDate?.split('/')
            let sendDate = `${logDateTime[1]}/${logDateTime[0]}/${logDateTime[2]}`
            return (
              !getIsAdmin() && (
                <span style={{display: 'flex'}}>
                  <span
                    className="gx-link"
                    onClick={() => onOpenEditModal(record, true)}
                  >
                    <CustomIcon name="view" />
                  </span>

                  {(record.user === user &&
                    moment(sendDate) >=
                      moment().subtract(1, 'days').startOf('day') &&
                    record?.otStatus !== 'R' &&
                    record?.otStatus !== 'A') ||
                  role?.[`Log Time`]?.editLogTime ? (
                    <span
                      className="gx-link"
                      onClick={() => onOpenEditModal(record)}
                    >
                      <Divider type="vertical" />
                      <CustomIcon name="edit" />
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
                        <Divider type="vertical" />
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

export {LOGTIMES_COLUMNS}

export const LOG_STATUS = {
  P: 'Pending',
  A: 'Approved',
  R: 'Rejected',
}
