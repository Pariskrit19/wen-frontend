import React from 'react'
import {Divider, Popconfirm} from 'antd'
import CustomIcon from 'components/Elements/Icons'
import {Input} from 'antd'
import {getIsAdmin} from 'helpers/utils'
import {Link} from 'react-router-dom'

const PROJECT_COLUMNS = (
  sortedInfo,
  openModal,
  confirmDelete,
  navigateToProjectLogs,
  role
) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    render: (text, record) => {
      return (
        <div>
          <p
            className="project-name"
            onClick={() =>
              role?.Projects?.viewProjects && openModal(record, true)
            }
          >
            {record.name}
          </p>
        </div>
      )
    },
  },
  {
    title: 'Path',
    dataIndex: 'path',
    key: 'path',
    width: 180,
    render: (text, record) => {
      return (
        <div>
          <Input
            className="pathinput"
            onFocus={(e) => e.target.select()}
            value={record.path || ''}
          />
        </div>
      )
    },
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    width: 150,
    key: 'startDate',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'startDate' && sortedInfo.order,
  },
  {
    title: 'End Date',
    dataIndex: 'endDate',
    width: 150,
    key: 'endDate',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'endDate' && sortedInfo.order,
  },
  {
    title: 'Project Type',
    dataIndex: 'projectTypes',
    width: 150,
    render: (text, record) => (
      <span>{record?.projectTypes?.[0]?.props?.children}</span>
    ),
  },
  {
    title: 'Project Status',
    dataIndex: 'projectStatus',
    width: 150,
    key: 'projectStatus',
  },
  {
    title: 'Action',
    key: 'action',
    width: 250,
    render: (text, record) => {
      return (
        <div style={{display: 'flex'}}>
          {role?.Navigation?.logTime && (
            <Link className="gx-link" to={`${record._id}-${record.slug}`}>
              Log Time
            </Link>
          )}
          {role?.Projects?.viewProjects && (
            <>
              {role?.Navigation?.logTime && <Divider type="vertical" />}
              <span className="gx-link" onClick={() => openModal(record, true)}>
                <CustomIcon name="view" />
              </span>
            </>
          )}
          {role?.Projects?.editProjects && !getIsAdmin() && (
            <>
              {(role?.Navigation?.logTime || role?.Projects?.viewProjects) && (
                <Divider type="vertical" />
              )}
              <span
                className="gx-link"
                onClick={() => openModal(record, false)}
              >
                <CustomIcon name="edit" />
              </span>
            </>
          )}
          {role?.Projects?.deleteProjects && (
            <>
              {(role?.Navigation?.logTime ||
                role?.Projects?.viewProjects ||
                role?.Projects?.editProjects) && <Divider type="vertical" />}
              <Popconfirm
                title="Are you sure to delete this project?"
                onConfirm={() => confirmDelete(record)}
                okText="Yes"
                cancelText="No"
              >
                <span className="gx-link gx-text-danger">
                  <CustomIcon name="delete" />
                </span>
              </Popconfirm>
            </>
          )}
        </div>
      )
    },
  },
]

export {PROJECT_COLUMNS}

export const POSITION_TYPES = {
  developer: 'developer',
  designer: 'designer',
  devops: 'devops',
  qa: 'qa',
  management: 'management',
}
