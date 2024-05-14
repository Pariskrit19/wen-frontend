import CustomIcon from 'components/Elements/Icons'
import {Divider, Popconfirm} from 'antd'
import {getIsAdmin} from 'helpers/utils'

export const POSITION_COLUMN = (
  onDeleteClick: (param: any) => void,
  onEditClick: (param: any, param2: any) => void
) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 630,
  },
  {
    title: 'Action',
    key: 'action',
    width: 10,
    render: (text: any, record: any) => {
      return (
        !getIsAdmin() && (
          <div style={{display: 'flex'}}>
            <span
              className="gx-link gx-text-primary"
              onClick={() => onEditClick(record, true)}
            >
              <CustomIcon name="edit" />
            </span>
            <Divider type="vertical" />
            <Popconfirm
              title="Are you sure you want to delete?"
              onConfirm={() => onDeleteClick(record)}
              okText="Yes"
              cancelText="No"
            >
              <span className="gx-link gx-text-danger">
                <CustomIcon name="delete" />
              </span>
            </Popconfirm>
          </div>
        )
      )
    },
  },
]

export const ROLE_COLUMN = (
  onDeleteClick: (param: any) => void,
  onEditClick: (param: any, param2: any) => void,
  permission: Boolean
) =>
  permission
    ? [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          width: 630,
        },
        {
          title: 'Action',
          key: 'action',
          width: 10,
          render: (text: any, record: any) => {
            return (
              !getIsAdmin() && (
                <div style={{display: 'flex'}}>
                  <span
                    className="gx-link gx-text-primary"
                    onClick={() => onEditClick(record, true)}
                  >
                    <CustomIcon name="edit" />
                  </span>
                  <Divider type="vertical" />
                  <Popconfirm
                    title="Are you sure you want to delete?"
                    onConfirm={() => onDeleteClick(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <span className="gx-link gx-text-danger">
                      <CustomIcon name="delete" />
                    </span>
                  </Popconfirm>
                </div>
              )
            )
          },
        },
      ]
    : [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          width: 630,
        },
      ]

export const LOGTYPE_COLUMN = (
  onDeleteClick: (param: any) => void,
  onEditClick: (param: any, param2: any) => void
) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 500,
  },
  {
    title: 'Log Color',
    // dataIndex:'color',
    key: 'color',
    render: (text: any, record: any) => {
      return (
        <span
          style={{
            backgroundColor: record?.color,
            color: record?.color,
            width: '10px',
            height: '6px',
            borderRadius: '4px',
          }}
        >
          Here are the colors
        </span>
      )
    },
  },

  {
    title: 'Action',
    key: 'action',
    render: (text: any, record: any) =>
      !getIsAdmin() && (
        <div style={{display: 'flex'}}>
          <span
            className="gx-link gx-text-primary"
            onClick={() => onEditClick(record, true)}
          >
            <CustomIcon name="edit" />
          </span>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => onDeleteClick(record)}
            okText="Yes"
            cancelText="No"
          >
            <span className="gx-link gx-text-danger">
              <CustomIcon name="delete" />
            </span>
          </Popconfirm>
        </div>
      ),
  },
]

export const LATE_ATTENDANCE_COLUMN = (
  onEditClick: (param: any, param2: any) => void
) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 500,
  },
  {
    title: 'Duration',
    key: 'duration',
    width: 700,
    render: (text: any, record: any) => {
      return <span>{`${record.value} ${record.unit}`}</span>
    },
  },
  {
    title: 'Action',
    key: 'action',
    render: (text: any, record: any) =>
      !getIsAdmin() && (
        <span
          className="gx-link gx-text-primary"
          onClick={() => onEditClick(record, true)}
        >
          <CustomIcon name="edit" />
        </span>
      ),
  },
]

export const INVITED_EMPLOYEES_COLUMN = () => [
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 630,
  },
  {
    title: 'Status',
    key: 'status',
    width: 10,
    render: (text: any, record: any) => {
      return record?.inviteTokenUsed ? (
        <span>accepted</span>
      ) : (
        <span>pending</span>
      )
    },
  },
]

export const RESOURCES_COLUMN = (
  onDeleteClick: (param: any) => void,
  onEditClick: (param: any, param2: any) => void
) => [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    width: 'fit-content',
  },
  {
    title: 'Description',
    // dataIndex:"content",
    key: 'description',
    width: 315,
    render: (text: any, record: any) => {
      return (
        <div className="max-two-lines">
          <span>{record.content}</span>
        </div>
      )
    },
  },
  {
    title: 'Action',
    key: 'action',
    width: 10,
    render: (text: any, record: any) => {
      return (
        !getIsAdmin() && (
          <div style={{display: 'flex'}}>
            <span
              className="gx-link gx-text-primary"
              onClick={() => onEditClick(record, true)}
            >
              <CustomIcon name="edit" />
            </span>
            <Divider type="vertical" />
            <Popconfirm
              title="Are you sure you want to delete?"
              onConfirm={() => onDeleteClick(record)}
              okText="Yes"
              cancelText="No"
            >
              <span className="gx-link gx-text-danger">
                <CustomIcon name="delete" />
              </span>
            </Popconfirm>
          </div>
        )
      )
    },
  },
]

export const LEAVES_COLUMN = (
  onDeleteClick: (param: any) => void,
  onEditClick: (param: any, param2: any) => void
) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 315,
  },
  {
    title: 'Leave Days',
    dataIndex: 'leaveDays',
    key: 'leaveDays',
    width: 315,
  },

  {
    title: 'Action',
    key: 'action',
    width: 10,
    render: (text: any, record: any) => {
      return (
        !getIsAdmin() && (
          <div className="gx-d-flex">
            <span
              className="gx-link gx-text-primary"
              onClick={() => {
                onEditClick(record, true)
              }}
            >
              <CustomIcon name="edit" />
            </span>
            <Divider type="vertical" style={{color: 'blue'}} />
            <Popconfirm
              title="Are you sure you want to delete?"
              onConfirm={() => onDeleteClick(record)}
              okText="Yes"
              cancelText="No"
            >
              <span className="gx-link gx-text-danger">
                {' '}
                <CustomIcon name="delete" />
              </span>
            </Popconfirm>
          </div>
        )
      )
    },
  },
]

export const LEAVES_QUARTER_COLUMN = () => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 355,
  },
  {
    title: 'Start',
    dataIndex: 'start',
    key: 'start',
    // width: 315,
  },
  {
    title: 'End',
    dataIndex: 'end',
    key: 'end',
    // width: 315,
  },
  {
    title: 'Leaves',
    dataIndex: 'days',
    key: 'days',
    // width: 315,
  },
]

export const EMAIL_COLUMN = (
  onDeleteClick: (param: any) => void,
  onEditClick: (param: any, param2: any) => void
) => [
  {
    title: 'Module',
    dataIndex: 'module',
    key: 'module',
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Body',
    // dataIndex:"content",
    key: 'body',
    render: (text: any, record: any) => {
      return (
        <div className="max-two-lines">
          <span>{record.body}</span>
        </div>
      )
    },
  },
  {
    title: 'Action',
    key: 'action',
    width: 10,
    render: (text: any, record: any) => {
      return (
        !getIsAdmin() && (
          <div style={{display: 'flex'}}>
            <span
              className="gx-link gx-text-primary"
              onClick={() => onEditClick(record, true)}
            >
              <CustomIcon name="edit" />
            </span>
            <Divider type="vertical" />
            <Popconfirm
              title="Are you sure you want to delete?"
              onConfirm={() => onDeleteClick(record)}
              okText="Yes"
              cancelText="No"
            >
              <span className="gx-link gx-text-danger">
                <CustomIcon name="delete" />
              </span>
            </Popconfirm>
          </div>
        )
      )
    },
  },
]

export const LOCALSTORAGE_USER = 'user_id'
