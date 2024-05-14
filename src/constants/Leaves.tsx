import {Divider, Popconfirm} from 'antd'
import CustomIcon from 'components/Elements/Icons'
import AccessWrapper from 'components/Modules/AccessWrapper'
import {getIsAdmin, isLeavesBeforeToday} from 'helpers/utils'
import React from 'react'

export const LEAVES_COLUMN_REPORT = () => [
  {
    title: 'Co-worker',
    dataIndex: 'coWorker',
    key: 'Co-worker',
    width: 150,
  },
  {
    title: 'Dates',
    dataIndex: 'dates',
    key: 'dates',
    width: 10,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    width: 30,
  },
  {
    title: 'Reason',
    dataIndex: 'reason',
    width: 300,
    key: 'reason',
    render: (text: any, record: any) => {
      return (
        <div className="max-two-lines">
          <span>{record.reason}</span>
        </div>
      )
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 10,
    key: 'status',
  },
]

const LEAVES_COLUMN = ({
  onCancelLeave,
  onApproveClick,
  onEditClick,
  viewLeave = false,
  cancelLeave = false,
  isAdmin = false,
  approveLeave = false,
  editLeave = false,
  role,
}: {
  onCancelLeave?: (
    param: any,
    param2: boolean,
    param3?: boolean,
    param4?: boolean
  ) => void
  onApproveClick?: (param: any) => void
  onEditClick?: (param: any, param2: any) => void
  isAdmin?: boolean
  role?: any
  viewLeave?: boolean
  cancelLeave?: boolean
  approveLeave?: boolean
  editLeave?: boolean
}) =>
  role
    ? [
        {
          title: 'Co-worker',
          dataIndex: 'coWorker',
          key: 'Co-worker',
          width: 150,
        },
        {
          title: 'Dates',
          dataIndex: 'dates',
          key: 'dates',
          width: 10,
          render: (text: any, record: any) => {
            return (
              <div>
                <span>{text}</span>
              </div>
            )
          },
        },
        {
          title: 'Type',
          dataIndex: 'type',
          key: 'type',
          width: 10,
        },
        {
          title: 'Reason',
          dataIndex: 'reason',
          width: 300,
          key: 'reason',
          render: (text: any, record: any) => {
            return (
              <div className="max-two-lines">
                <span>{record.reason}</span>
              </div>
            )
          },
        },
        {
          title: 'Added By',
          dataIndex: 'addedBy',
          width: 150,
          key: 'addedBy',
        },
        {
          title: 'Status',
          dataIndex: 'status',
          width: 10,
          key: 'status',
        },
        {
          title: 'Action',
          key: 'action',
          width: 10,
          render: (text: any, record: any) => {
            if (isAdmin && onEditClick && onApproveClick) {
              return (
                <div style={{display: 'flex'}}>
                  <AccessWrapper role={viewLeave}>
                    <>
                      <span
                        className="gx-link gx-text-primary"
                        onClick={() => onEditClick(record, true)}
                      >
                        <CustomIcon name="view" />
                      </span>
                    </>
                  </AccessWrapper>

                  <>
                    <AccessWrapper
                      role={
                        !getIsAdmin() &&
                        ![
                          STATUS_TYPES[1].id,
                          STATUS_TYPES[3].id,
                          STATUS_TYPES[4].id,
                          STATUS_TYPES[5].id,
                        ].includes(record.leaveStatus) &&
                        approveLeave
                      }
                    >
                      <>
                        {viewLeave && <Divider type="vertical" />}

                        <span
                          onClick={() => onApproveClick(record)}
                          className="gx-link gx-text-green"
                        >
                          Approve
                        </span>
                      </>
                    </AccessWrapper>

                    <AccessWrapper
                      role={
                        ![STATUS_TYPES[3].id, STATUS_TYPES[4].id].includes(
                          record.leaveStatus
                        ) &&
                        !getIsAdmin() &&
                        cancelLeave
                      }
                    >
                      <>
                        {(viewLeave || approveLeave) && (
                          <Divider type="vertical" />
                        )}

                        <span
                          className="gx-link gx-text-danger"
                          onClick={() =>
                            onCancelLeave
                              ? onCancelLeave(record, false)
                              : () => {}
                          }
                        >
                          Cancel
                        </span>
                      </>
                    </AccessWrapper>

                    <AccessWrapper
                      role={
                        !getIsAdmin() &&
                        [STATUS_TYPES[2].id].includes(record.leaveStatus)
                      }
                    >
                      <>
                        {(viewLeave || cancelLeave || approveLeave) && (
                          <Divider type="vertical" />
                        )}

                        <span
                          className="gx-link gx-text-danger"
                          onClick={() =>
                            onCancelLeave
                              ? onCancelLeave(record, true)
                              : () => {}
                          }
                        >
                          Reject
                        </span>
                      </>
                    </AccessWrapper>

                    <AccessWrapper
                      role={
                        !getIsAdmin() &&
                        ![
                          STATUS_TYPES[1].id,
                          STATUS_TYPES[3].id,
                          STATUS_TYPES[4].id,
                          STATUS_TYPES[5].id,
                        ].includes(record.leaveStatus) &&
                        editLeave
                      }
                    >
                      <>
                        {(viewLeave || cancelLeave || approveLeave) && (
                          <Divider type="vertical" />
                        )}
                        <i
                          className="icon icon-edit gx-link"
                          onClick={() => onEditClick(record, false)}
                        />
                      </>
                    </AccessWrapper>
                  </>
                </div>
              )
            }
            return record.leaveStatus === STATUS_TYPES[2].id &&
              cancelLeave &&
              !getIsAdmin() ? (
              <span
                className="gx-link gx-text-danger"
                onClick={() =>
                  onCancelLeave ? onCancelLeave(record, false) : () => {}
                }
              >
                Cancel
              </span>
            ) : null
          },
        },
      ]
    : [
        {
          title: 'Co-worker',
          dataIndex: 'coWorker',
          key: 'Co-worker',
          width: 150,
        },
        {
          title: 'Dates',
          dataIndex: 'dates',
          key: 'dates',
          width: 1,
          render: (text: any, record: any) => {
            return (
              <div style={{maxWidth: '6rem'}}>
                <span>{text}</span>
              </div>
            )
          },
        },
        {
          title: 'Type',
          dataIndex: 'type',
          key: 'type',
          width: 30,
        },
        {
          title: 'Reason',
          dataIndex: 'reason',
          width: 300,
          key: 'reason',
          render: (text: any, record: any) => {
            return (
              <div className="max-two-lines">
                <span>{record.reason}</span>
              </div>
            )
          },
        },
        {
          title: 'Status',
          dataIndex: 'status',
          width: 10,
          key: 'status',
        },

        {
          title: 'Action',
          key: 'action',
          width: 10,
          render: (text: any, record: any) => {
            if (isAdmin && onEditClick && onApproveClick)
              return (
                <div style={{display: 'flex'}}>
                  <span
                    className="gx-link gx-text-primary"
                    onClick={() => onEditClick(record, true)}
                  >
                    <CustomIcon name="view" />
                  </span>
                  <Divider type="vertical" />
                  {!getIsAdmin() &&
                    ![STATUS_TYPES[1].id, STATUS_TYPES[3].id].includes(
                      record.leaveStatus
                    ) && (
                      <>
                        <Popconfirm
                          title="Are you sure you want to approve?"
                          onConfirm={() => onApproveClick(record)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <span className="gx-link gx-text-green">Approve</span>
                        </Popconfirm>
                        <Divider type="vertical" />

                        <i
                          className="icon icon-edit gx-link"
                          onClick={() => onEditClick(record, false)}
                        />
                      </>
                    )}
                </div>
              )
            return (
              <div style={{display: 'flex'}}>
                <AccessWrapper role={viewLeave}>
                  <span
                    className="gx-link gx-text-primary"
                    onClick={() =>
                      onEditClick ? onEditClick(record, true) : () => {}
                    }
                  >
                    <CustomIcon name="view" />
                  </span>
                </AccessWrapper>

                <AccessWrapper
                  role={
                    record.leaveStatus === STATUS_TYPES[4].id &&
                    isLeavesBeforeToday(record.leaveDates) &&
                    !getIsAdmin()
                  }
                >
                  <>
                    {viewLeave && <Divider type="vertical" />}

                    <span
                      className="gx-link gx-text-primary"
                      onClick={() =>
                        onApproveClick ? onApproveClick(record) : {}
                      }
                    >
                      Reapply
                    </span>
                  </>
                </AccessWrapper>

                <AccessWrapper
                  role={
                    (cancelLeave &&
                      record.leaveStatus === STATUS_TYPES[2].id &&
                      !getIsAdmin()) ||
                    (record.leaveStatus === STATUS_TYPES[1].id &&
                      isLeavesBeforeToday(record.leaveDates) &&
                      !getIsAdmin())
                  }
                >
                  <>
                    {' '}
                    <Divider type="vertical" />{' '}
                    <span
                      className="gx-link gx-text-danger"
                      onClick={() =>
                        onCancelLeave
                          ? onCancelLeave(
                              record,
                              false,
                              record.leaveStatus === STATUS_TYPES[1].id,
                              true
                            )
                          : () => {}
                      }
                    >
                      Cancel
                    </span>{' '}
                  </>
                </AccessWrapper>

                <AccessWrapper role={record.leaveStatus === STATUS_TYPES[2].id}>
                  <>
                    {' '}
                    <Divider type="vertical" />{' '}
                    <i
                      className="icon icon-edit gx-link"
                      onClick={() =>
                        onEditClick ? onEditClick(record, false) : () => {}
                      }
                    />
                  </>
                </AccessWrapper>
              </div>
            )
          },
        },
      ]

const STATUS_TYPES = [
  {id: '', value: 'All'},
  {id: 'approved', value: 'Approved'},
  {id: 'pending', value: 'Pending'},
  {id: 'cancelled', value: 'Cancelled'},
  {id: 'rejected', value: 'Rejected'},
  {id: 'user cancelled', value: 'User Cancelled'},
]

export {LEAVES_COLUMN, STATUS_TYPES}

export const LATE_LEAVE_TYPE_ID = '631192ec8194d8f22afe6685'
export const LATE_ARRIVAL = 'Late Arrival'
export const CASUAL_LEAVE = 'Casual Leave'

export const FIRST_HALF = 'first-half'
export const SECOND_HALF = 'second-half'
export const FULL_DAY = 'full-day'
export const PAID_TIME_OFF = 'Paid Time Off'

export const LEAVES_TYPES = {
  Casual: 'casual',
  Sick: 'sick',
  Maternity: 'maternity',
  Paternity: 'paternity',
  PTO: 'paid time off',
  LateArrival: 'late arrival',
  Bereavement: 'bereavement',
  Substitute: 'substitute',
}
