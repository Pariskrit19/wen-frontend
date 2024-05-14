import {Divider, Popconfirm} from 'antd'
import CustomIcon from 'components/Elements/Icons'
import AccessWrapper from 'components/Modules/AccessWrapper'
import {getIsAdmin} from 'helpers/utils'

export const OVERTIME_COLUMNS = ({
  sort,
  handleApprove,
  handleOpenViewModal,
  handleOpenRejectModal,
}) => [
  {
    title: 'Project',
    dataIndex: 'project',
    key: 'project',
    sorter: true,
    sortOrder: sort.columnKey === 'project' && sort.order,
  },
  {
    title: 'Date',
    dataIndex: 'logDate',
    key: 'logDate',
    sorter: true,
    sortOrder: sort.columnKey === 'logDate' && sort.order,
  },
  {
    title: 'Hours',
    dataIndex: 'totalHours',
    key: 'totalHours',
    sorter: true,
    sortOrder: sort.columnKey === 'totalHours' && sort.order,
    width: '8%',
  },

  {
    title: 'Type',
    dataIndex: 'logType',
    key: 'logType',
    sorter: true,
    sortOrder: sort.columnKey === 'logType' && sort.order,
  },
  {
    title: 'Remarks',
    dataIndex: 'remarks',
    key: 'remarks',
    sorter: true,
    sortOrder: sort.columnKey === 'remarks' && sort.order,
    render: (text, record) => {
      return <p style={{whiteSpace: 'pre-wrap'}}>{text}</p>
    },
  },
  {
    title: 'Added By',
    dataIndex: 'user',
    key: 'user',
    sorter: true,
    sortOrder: sort.columnKey === 'user' && sort.order,
  },
  {
    title: 'Status',
    dataIndex: 'otStatus',
    key: 'otStatus',
    sorter: true,
    sortOrder: sort.columnKey === 'otStatus' && sort.order,
    width: '10%',
  },
  {
    title: 'Action',
    key: 'action',
    width: '17%',
    render: (text, record) => {
      return (
        !getIsAdmin() && (
          <div style={{display: 'flex'}}>
            {record?.otStatus === 'Rejected' ? (
              <span
                className="gx-link gx-text-primary"
                onClick={() => handleOpenViewModal(record, true)}
              >
                <CustomIcon name="view" />
              </span>
            ) : record?.otStatus === 'Pending' ? (
              <AccessWrapper role={!getIsAdmin()}>
                <>
                  {/* <Divider type="vertical" /> */}
                  <Popconfirm
                    title="Are you sure to approve this overtime?"
                    onConfirm={() => handleApprove(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <span className="gx-link gx-text-green">Approve</span>
                  </Popconfirm>
                  <Divider type="vertical" />
                  <span
                    onClick={() => handleOpenRejectModal(record)}
                    className="gx-link gx-text-red"
                  >
                    Reject
                  </span>
                </>
              </AccessWrapper>
            ) : null}
          </div>
        )
      )
    },
  },
]

export const OT_STATUS = [
  {id: 'A', value: 'Approved'},
  {id: 'P', value: 'Pending'},
  {id: 'R', value: 'Rejected'},
  {id: '', value: 'All'},
]
