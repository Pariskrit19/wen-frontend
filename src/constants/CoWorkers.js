import React from 'react'
import {Divider, Popconfirm} from 'antd'
import CustomIcon from 'components/Elements/Icons'
import {getIsAdmin} from 'helpers/utils'
import {LOCALSTORAGE_USER} from './Settings'

const CO_WORKERCOLUMNS = (
  sortedInfo,
  openEditPopup,
  handleSwitchToUser,
  updatMutation,
  disableMutation,
  role
) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '15%',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: '23%',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'email' && sortedInfo.order,
  },
  {
    title: 'Primary Phone',
    dataIndex: 'primaryPhone',
    width: '14%',
    key: 'primaryPhone',
  },
  {
    title: 'DOB',
    dataIndex: 'dob',
    width: '14%',
    key: 'dob',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'dob' && sortedInfo.order,
  },
  {
    title: 'Join Date',
    dataIndex: 'joinDate',
    width: '14%',
    key: 'joinDate',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'joinDate' && sortedInfo.order,
  },
  {
    title: 'Action',
    key: 'action',
    width: '20%',
    render: (text, record) => {
      return (
        <div style={{display: 'flex'}}>
          {role?.['Co-Workers']?.viewCoworkers && (
            <>
              <span
                className="gx-link"
                onClick={() => openEditPopup(record, true)}
              >
                <CustomIcon name="view" />
              </span>
            </>
          )}

          {role?.['Co-Workers']?.disableCoworkers && !getIsAdmin() && (
            <>
              {role?.['Co-Workers']?.viewCoworkers && (
                <Divider type="vertical" />
              )}
              <Popconfirm
                title={`Are you sure to make Co-worker ${
                  record.active ? 'inactive' : 'active'
                } ?`}
                onConfirm={() => {
                  if (record.active) {
                    disableMutation.mutate(record._id)
                  } else {
                    updatMutation.mutate({
                      userId: record._id,
                      updatedData: {active: true},
                    })
                  }
                }}
                okText="Yes"
                cancelText="No"
              >
                <span className="gx-link">
                  {record.active ? (
                    <CustomIcon name="deactiveUser" />
                  ) : (
                    <CustomIcon name="activeUser" />
                  )}
                </span>
              </Popconfirm>
            </>
          )}
          {role?.['Co-Workers']?.editCoworkers && !getIsAdmin() && (
            <>
              {(role?.['Co-Workers']?.disableCoworkers ||
                role?.['Co-Workers']?.viewCoworkers) && (
                <Divider type="vertical" />
              )}

              <span
                className="gx-link"
                onClick={() => openEditPopup(record, false)}
              >
                <CustomIcon name="edit" />
              </span>
            </>
          )}

          {!getIsAdmin() &&
            role?.['Co-Workers']?.switchCoworkers &&
            !(
              record?._id ===
              JSON.parse(localStorage.getItem(LOCALSTORAGE_USER))
            ) && (
              <>
                {(role?.['Co-Workers']?.editCoworkers ||
                  role?.['Co-Workers']?.disableCoworkers ||
                  role?.['Co-Workers']?.viewCoworkers) && (
                  <Divider type="vertical" />
                )}
                <span
                  className="gx-link"
                  onClick={() => handleSwitchToUser(record)}
                >
                  <CustomIcon name="switchToUser" />
                </span>
              </>
            )}
        </div>
      )
    },
  },
]

export {CO_WORKERCOLUMNS}
