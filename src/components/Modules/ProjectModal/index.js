import '@ant-design/compatible/assets/index.css'
import {
  Button,
  Col,
  DatePicker,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Form,
  Spin,
  Tag,
} from 'antd'
import {emptyText} from 'constants/EmptySearchAntd'
import {filterOptions, scrollForm} from 'helpers/utils'
import moment from 'moment'
import Maintenance from 'pages/Projects/Maintainance'
import {useEffect, useState} from 'react'
import './style.css'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {HistoryOutlined} from '@ant-design/icons'
import EstimateHistoryModal from '../EstimateHistoryModal'
import {IoClose} from 'react-icons/io5'
import {PRIMARY_COLOR} from 'constants/ThemeSetting'

const FormItem = Form.Item
const Option = Select.Option
const {TextArea} = Input

function ProjectModal({
  toggle,
  onClose,
  types,
  statuses,
  onSubmit,
  initialValues,
  readOnly = false,
  loading = false,
  isEditMode = false,
  client,
  tags,
  developers,
  designers,
  qas,
  devops,
  isFromLog = false,
  clearModal,
  setClearModal,
}) {
  const [form] = Form.useForm()
  const [projectTypes, setProjectTypes] = useState([])
  const [projectStatuses, setProjectStatuses] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [startDate, setStartDate] = useState(undefined)
  const [endDate, setEndDate] = useState(undefined)
  const [estimatehourOpen, setEstimateHourOpen] = useState(false)

  const handleCancel = () => {
    if (isEditMode) {
      form.resetFields()
    }
    onClose()
  }

  const currentDesigners = designers?.data?.data?.data?.map((item) => item?._id)
  const currentDevelopers = developers?.data?.data?.data?.map(
    (item) => item?._id
  )
  const currentQas = qas?.data?.data?.data?.map((item) => item?._id)
  const currentDevOps = devops?.data?.data?.data?.map((item) => item?._id)

  const activeUsers = [
    ...(currentDesigners || []),
    ...(currentDevelopers || []),
    ...(currentQas || []),
    ...(currentDevOps || []),
  ]

  const regex = /^[0-9a-fA-F]{24}$/

  const preventClose = (event) => {
    if (event.key === 'Backspace') {
      return event.stopPropagation()
    }
  }

  const {_id: userId} = useSelector(selectAuthUser)

  function tagRender(props, position) {
    const {label, value, onClose} = props
    const isRoleChange = regex.test(label)
    const isActiveRole = isRoleChange && activeUsers.includes(label)
    const userName =
      isRoleChange &&
      initialValues[position]?.find((d) => d?._id === label)?.name

    return (
      <Tag
        closable={(!isRoleChange || isActiveRole) && !readOnly}
        onClose={onClose}
        style={{
          opacity: 1,
          marginTop: '4px',
          marginBottom: '4px',
          background: '#f5f5f5',
          fontSize: '14px',
          borderRadius: '6px',
          border: '1px solid #e8e8e8',
        }}
      >
        {isRoleChange ? userName : label}
      </Tag>
    )
  }

  const linksHandler = ({props, message, isReadOnly}) => {
    return (
      (message || props.value) && (
        <div
          style={{
            display: 'flex',
            background: 'rgb(245, 245, 245)',
            marginRight: '5px',
            paddingLeft: '2px',
            paddingRight: `${isReadOnly ? '0px' : '2px'}`,
            borderRadius: '6px',
            borderWidth: '1px',
            borderColor: 'red',
            pointerEvents: 'visible',
          }}
        >
          <a href={props.value} target="_blank" rel="noreferrer">
            <span className="staging-urls">{message || props.value}</span>
          </a>

          {!isReadOnly && (
            <span
              onClick={props.onClose}
              className="cross-icon"
              style={{
                cursor: 'pointer',
                alignSelf: 'center',
                display: 'flex',
                paddingRight: '1px',
              }}
            >
              <IoClose />
            </span>
          )}
        </div>
      )
    )
  }

  const changedRoleChecker = (type, key) => {
    const newList = type?.map((item) => {
      if (!regex.test(item)) {
        return initialValues?.[key]?.filter((val) => val?.name === item)?.[0]
          ?._id
      } else return item
    })
    return newList
  }

  let estimateHistory = []

  const handleSubmit = (type) => {
    form.validateFields().then((values) => {
      const updatedDesigners = changedRoleChecker(
        values?.designers,
        'designers'
      )
      const updatedQAs = changedRoleChecker(values?.qa, 'qa')
      const updatedDevelopers = changedRoleChecker(
        values?.developers,
        'developers'
      )
      const updatedDevOps = changedRoleChecker(values?.devOps, 'devOps')

      //check if edit mode
      if (!isEditMode) {
        if (values?.estimatedHours) {
          const estimate = {
            estimatedHours: values?.estimatedHours,
            updatedBy: userId,
            updatedAt: new Date(),
          }
          estimateHistory = [{...estimate}]
        }
      } else {
        //getting last estimate
        const lastEstimate = initialValues?.estimateHistory.at(-1)

        if (
          values?.estimatedHours &&
          +values?.estimatedHours !== lastEstimate?.estimatedHours
        ) {
          const estimate = {
            estimatedHours: values?.estimatedHours,
            updatedBy: userId,
            updatedAt: new Date(),
          }
          estimateHistory = [
            ...initialValues?.estimateHistory.map((d) => ({
              ...d,
              updatedBy: d?.updatedBy?._id,
            })),
            estimate,
          ]
        } else {
          estimateHistory = initialValues?.estimateHistory
        }
      }

      onSubmit({
        ...values,
        path: values?.path?.trim(),
        name:
          values?.name?.trim()?.[0].toUpperCase() +
          values?.name?.trim()?.slice(1),
        designers: updatedDesigners,
        estimateHistory,
        qa: updatedQAs,
        developers: updatedDevelopers,
        devOps: updatedDevOps,
        maintenance: [
          {
            ...maintenance[0],
            selectMonths:
              maintenance[0]?.selectMonths?.length === 13
                ? [...maintenance[0]?.selectMonths?.slice(1)]
                : maintenance[0]?.selectMonths,
          },
        ],
      })
    })
  }

  useEffect(() => {
    if (toggle) {
      // setProjectStatuses(statuses.data.data.data)
      setProjectTypes(types?.data?.data?.data)
      if (isEditMode) {
        setStartDate(moment(initialValues.startDate))
        setEndDate(moment(initialValues.endDate))
        setMaintenance([
          {
            selectMonths:
              initialValues.maintenance?.length > 0
                ? initialValues.maintenance[0].selectMonths.length === 12
                  ? ['Toggle All', ...initialValues.maintenance[0].selectMonths]
                  : initialValues.maintenance[0].selectMonths
                : [],
            emailDay:
              initialValues.maintenance?.length > 0
                ? initialValues.maintenance[0].emailDay
                : undefined,
            sendEmailTo:
              initialValues.maintenance?.length > 0
                ? initialValues.maintenance[0].sendEmailTo
                : undefined,
            enabled:
              initialValues.maintenance?.length > 0
                ? initialValues.maintenance[0].enabled
                : undefined,
          },
        ])

        form.setFieldsValue({
          name: initialValues.name ?? '',
          priority: initialValues.priority,
          path: initialValues.path,
          estimatedHours: initialValues?.estimateHistory.at(-1)?.estimatedHours,
          startDate: initialValues.startDate
            ? moment(initialValues.startDate)
            : null,
          endDate: initialValues.endDate ? moment(initialValues.endDate) : null,
          projectTypes: initialValues.projectTypes?.map((type) => type._id),
          projectStatus: initialValues.projectStatus?._id,
          projectTags:
            initialValues.projectTags?.length > 0
              ? initialValues.projectTags?.map((tags) => tags._id)
              : undefined,
          client: initialValues?.client?.hasOwnProperty('_id')
            ? initialValues.client?._id
            : undefined,
          developers:
            initialValues.developers?.length > 0
              ? initialValues.developers?.map((developer) => developer._id)
              : undefined,
          designers:
            initialValues.designers?.length > 0
              ? initialValues.designers?.map((designer) => designer._id)
              : undefined,
          devOps:
            initialValues.devOps?.length > 0
              ? initialValues.devOps?.map((devop) => devop._id)
              : undefined,
          qa:
            initialValues.qa?.length > 0
              ? initialValues.qa?.map((q) => q._id)
              : undefined,
          stagingUrls:
            initialValues.stagingUrls?.length > 0
              ? initialValues.stagingUrls
              : undefined,
          liveUrl:
            initialValues.liveUrl?.length > 0
              ? initialValues.liveUrl
              : undefined,
          notes: initialValues?.notes?.replace(/<\/?[^>]+(>|$)/g, '') || '',
          emailDay:
            initialValues.maintenance?.length > 0
              ? initialValues.maintenance[0].emailDay
              : undefined,
          sendEmailTo:
            initialValues.maintenance?.length > 0
              ? initialValues.maintenance[0].sendEmailTo?.split(',')
              : undefined,
        })
      }
      if (isFromLog) {
        setMaintenance([
          {
            selectMonths:
              initialValues.maintenance?.length > 0
                ? initialValues.maintenance[0].selectMonths.length === 12
                  ? ['Toggle All', ...initialValues.maintenance[0].selectMonths]
                  : initialValues.maintenance[0].selectMonths
                : [],
            emailDay:
              initialValues.maintenance?.length > 0
                ? initialValues.maintenance[0].emailDay
                : undefined,
            sendEmailTo:
              initialValues.maintenance?.length > 0
                ? initialValues.maintenance[0].sendEmailTo
                : undefined,
            enabled:
              initialValues.maintenance?.length > 0
                ? initialValues.maintenance[0].enabled
                : undefined,
          },
        ])

        form.setFieldsValue({
          name: initialValues.name ?? '',
          priority: initialValues.priority,
          path: initialValues.path,
          estimatedHours: initialValues?.estimateHistory.at(-1)?.estimatedHours,
          startDate: initialValues.startDate
            ? moment(initialValues.startDate)
            : null,
          endDate: initialValues.endDate ? moment(initialValues.endDate) : null,
          projectTypes: initialValues.projectTypes?.map((type) => type.name),
          projectStatus: initialValues.projectStatus?.name,
          projectTags:
            initialValues.projectTags?.length > 0
              ? initialValues.projectTags?.map((tags) => tags.name)
              : undefined,
          client: initialValues?.client?.hasOwnProperty('_id')
            ? initialValues.client?.name
            : undefined,
          developers:
            initialValues.developers?.length > 0
              ? initialValues.developers?.map((developer) => developer.name)
              : undefined,
          designers:
            initialValues.designers?.length > 0
              ? initialValues.designers?.map((designer) => designer.name)
              : undefined,
          devOps:
            initialValues.devOps?.length > 0
              ? initialValues.devOps?.map((devop) => devop.name)
              : undefined,
          qa:
            initialValues.qa?.length > 0
              ? initialValues.qa?.map((q) => q.name)
              : undefined,
          stagingUrls:
            initialValues.stagingUrls?.length > 0
              ? initialValues.stagingUrls
              : undefined,
          liveUrl:
            initialValues.liveUrl?.length > 0
              ? initialValues.liveUrl
              : undefined,
          notes: initialValues?.notes?.replace(/<\/?[^>]+(>|$)/g, '') || '',
          emailDay:
            initialValues.maintenance?.length > 0
              ? initialValues.maintenance[0].emailDay
              : undefined,
          sendEmailTo:
            initialValues.maintenance?.length > 0
              ? initialValues.maintenance[0].sendEmailTo
              : undefined,
        })
      }
    }
    if (!toggle) {
      setStartDate(undefined)
      setEndDate(undefined)
      if (isEditMode) {
        setMaintenance([])
        form.resetFields()
      }
    }
  }, [toggle])

  useEffect(() => {
    if (moment() < moment(startDate) || !startDate) {
      let removeCompleted = statuses?.data?.data?.data?.filter(
        (data) => data.name !== 'Completed'
      )
      let selectedStatus = statuses?.data?.data?.data?.filter(
        (status) => status._id === form.getFieldValue('projectStatus')
      )
      setProjectStatuses(removeCompleted)
      if (startDate && selectedStatus?.[0]?.name === 'Completed') {
        form.setFieldValue('projectStatus', null)
      }
    } else {
      setProjectStatuses(statuses?.data?.data?.data)
    }
  }, [startDate])

  useEffect(() => {
    if (clearModal) {
      form.resetFields()
      setMaintenance([])
      setClearModal(false)
    }
  }, [clearModal])

  const handleDateChange = (e, time) => {
    if (time === 'start') {
      if (!e) {
        form.setFieldValue('projectStatus', null)
      }
      setStartDate(e)
    } else setEndDate(e)
  }

  const handleReset = () => {
    form.resetFields()
    setMaintenance([])
  }

  const disableDate = (current, date, time) => {
    if (time === 'start' && date) {
      return current && current > date
    } else if (time === 'end' && date) {
      return current && current < date
    }
  }

  const handleEnterPress = (event) => {
    if (!event.target.value && event.key === 'Enter') {
      return event.stopPropagation()
    }
  }

  return (
    <Modal
      width={900}
      mask={false}
      title={
        (isEditMode && readOnly) || isFromLog
          ? 'Project Details'
          : isEditMode
          ? 'Update Project'
          : 'Add Project'
      }
      visible={toggle}
      onOk={handleSubmit}
      onCancel={handleCancel}
      footer={
        readOnly
          ? [
              <Button key="back" onClick={handleCancel}>
                Close
              </Button>,
            ]
          : [
              <Button
                key="back"
                onClick={isEditMode ? handleCancel : handleReset}
              >
                {isEditMode ? 'Close' : 'Reset'}
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                Submit
              </Button>,
            ]
      }
    >
      <EstimateHistoryModal
        open={estimatehourOpen}
        setEstimateHourOpen={setEstimateHourOpen}
        data={initialValues?.estimateHistory}
      />

      <Spin spinning={loading}>
        <Form layout="vertical" form={form}>
          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="Name"
                hasFeedback={readOnly ? false : true}
                name="name"
                rules={[
                  {
                    required: true,
                    validator: async (rule, value) => {
                      try {
                        if (!value) {
                          throw new Error('Name is required.')
                        }
                        const regex = /^[^*|\":<>[\]{}`\\';@&$!#%^]+$/
                        const isValid = regex.test(value)
                        if (value.trim().length === 0) {
                          throw new Error('Please enter a valid Name.')
                        }
                        if (
                          value?.split('')[0] === '-' ||
                          value?.split('')[0] === '(' ||
                          value?.split('')[0] === ')'
                        ) {
                          throw new Error(
                            'Please do not use special characters before project name.'
                          )
                        }

                        if (!isValid) {
                          throw new Error(
                            'Please do not use special characters.'
                          )
                        }
                      } catch (err) {
                        scrollForm(form, 'name')
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="Enter Name" disabled={readOnly} />
              </FormItem>
            </Col>
            <Col span={24} sm={12}>
              <FormItem label="Priority" name="priority">
                <Radio.Group buttonStyle="solid" disabled={readOnly}>
                  <Radio.Button value={true}>Yes</Radio.Button>
                  <Radio.Button value={false}>No</Radio.Button>
                </Radio.Group>
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="Path"
                hasFeedback={readOnly ? false : true}
                name="path"
                rules={[
                  {
                    required: true,
                    validator: async (rule, value) => {
                      try {
                        if (!value) {
                          throw new Error('Path is required.')
                        }
                      } catch (err) {
                        scrollForm(form, 'path')
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Input
                  className={`${readOnly ? 'path-disabled' : ''}`}
                  placeholder="Enter Path"
                  onFocus={readOnly ? (e) => e.target.select() : false}
                  readOnly={readOnly}
                />
              </FormItem>
            </Col>
            <Col span={24} sm={12}>
              <FormItem
                label={
                  <span>
                    Estimated Hours{' '}
                    <span onClick={() => setEstimateHourOpen(true)}>
                      <HistoryOutlined
                        className="history-icon"
                        style={{fontSize: 17, color: PRIMARY_COLOR}}
                      />
                    </span>
                  </span>
                }
                hasFeedback={readOnly ? false : true}
                name="estimatedHours"
                rules={[
                  {
                    whitespace: true,
                    validator: async (rule, value) => {
                      try {
                        const reg = new RegExp('^[0-9]+$')
                        if (value < 0 || (value && !reg.test(+value))) {
                          throw new Error('Please  enter a valid number')
                        }
                      } catch (err) {
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Input
                  placeholder="Enter Estimated Hours"
                  disabled={readOnly}
                />
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="Start Date"
                hasFeedback={readOnly ? false : true}
                name="startDate"
                rules={[
                  {
                    required: true,
                    validator: async (rule, value) => {
                      try {
                        if (!value) {
                          throw new Error('Start Date is required.')
                        }
                      } catch (err) {
                        scrollForm(form, 'startDate')
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <DatePicker
                  onChange={(e) => handleDateChange(e, 'start')}
                  disabledDate={(current) =>
                    disableDate(current, endDate, 'start')
                  }
                  className=" gx-w-100"
                  disabled={readOnly}
                />
              </FormItem>
            </Col>
            <Col span={24} sm={12}>
              <FormItem
                label="End Date"
                hasFeedback={readOnly ? false : true}
                name="endDate"
              >
                <DatePicker
                  onChange={(e) => handleDateChange(e, 'end')}
                  disabledDate={(current) =>
                    disableDate(current, startDate, 'end')
                  }
                  className=" gx-w-100"
                  disabled={readOnly}
                />
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="Type"
                hasFeedback={readOnly ? false : true}
                name="projectTypes"
              >
                <Select
                  notFoundContent={emptyText}
                  showSearch
                  filterOption={filterOptions}
                  placeholder="Select Type"
                  disabled={readOnly}
                  mode="multiple"
                >
                  {projectTypes?.map((type) => (
                    <Option value={type._id} key={type._id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={24} sm={12}>
              <FormItem
                label="Status"
                hasFeedback={readOnly ? false : true}
                name="projectStatus"
                rules={[
                  {
                    required: true,
                    validator: async (rule, value) => {
                      try {
                        if (!value) {
                          throw new Error('Status is required.')
                        }
                      } catch (err) {
                        scrollForm(form, 'projectStatus')
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Select
                  showSearch
                  notFoundContent={emptyText}
                  filterOption={filterOptions}
                  placeholder="Select Status"
                  disabled={readOnly}
                >
                  {projectStatuses?.map((status) => (
                    <Option value={status._id} key={status._id}>
                      {status.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="Tags"
                hasFeedback={readOnly ? false : true}
                name="projectTags"
              >
                <Select
                  showSearch
                  notFoundContent={emptyText}
                  filterOption={filterOptions}
                  placeholder="Select Tags"
                  disabled={readOnly}
                  mode="multiple"
                  size="large"
                >
                  {tags &&
                    tags?.data?.data?.data?.map((tag) => (
                      <Option value={tag._id} key={tag._id}>
                        {tag.name}
                      </Option>
                    ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={24} sm={12}>
              <FormItem
                label="Client"
                hasFeedback={readOnly ? false : true}
                name="client"
              >
                <Select
                  notFoundContent={emptyText}
                  placeholder="Select Client"
                  filterOption={filterOptions}
                  disabled={readOnly}
                  showSearch
                >
                  {client?.data?.data?.data?.map((tag) => (
                    <Option value={tag._id} key={tag._id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>

          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="Developers"
                hasFeedback={readOnly ? false : true}
                name="developers"
                className="dark-disabled"
              >
                <Select
                  tagRender={(props) => tagRender(props, 'developers')}
                  notFoundContent={emptyText}
                  showSearch
                  onInputKeyDown={preventClose}
                  filterOption={filterOptions}
                  placeholder="Select Developers"
                  disabled={readOnly}
                  mode="multiple"
                >
                  {developers?.data?.data?.data?.map((tag) => (
                    <Option value={tag._id} key={tag._id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={24} sm={12}>
              <FormItem
                label="Designers"
                hasFeedback={readOnly ? false : true}
                name="designers"
                className="dark-disabled"
              >
                <Select
                  tagRender={(props) => tagRender(props, 'designers')}
                  notFoundContent={emptyText}
                  showSearch
                  onInputKeyDown={preventClose}
                  filterOption={filterOptions}
                  placeholder="Select Designers"
                  disabled={readOnly}
                  mode="multiple"
                >
                  {designers?.data?.data?.data?.map((tag) => (
                    <Option value={tag._id} key={tag._id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="QA"
                hasFeedback={readOnly ? false : true}
                name="qa"
                className="dark-disabled"
              >
                <Select
                  tagRender={(props) => tagRender(props, 'qa')}
                  notFoundContent={emptyText}
                  showSearch
                  onInputKeyDown={preventClose}
                  filterOption={filterOptions}
                  placeholder="Select QA"
                  disabled={readOnly}
                  mode="multiple"
                >
                  {qas?.data?.data?.data?.map((tag) => (
                    <Option value={tag._id} key={tag._id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={24} sm={12}>
              <FormItem
                label="DevOps"
                hasFeedback={readOnly ? false : true}
                name="devOps"
                className="dark-disabled"
              >
                <Select
                  tagRender={(props) => tagRender(props, 'devOps')}
                  onInputKeyDown={preventClose}
                  notFoundContent={emptyText}
                  showSearch
                  filterOption={filterOptions}
                  placeholder="Select DevOps"
                  disabled={readOnly}
                  mode="multiple"
                >
                  {devops?.data?.data?.data?.map((tag) => (
                    <Option value={tag._id} key={tag._id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="Staging URL"
                hasFeedback={readOnly ? false : true}
                name="stagingUrls"
                style={
                  readOnly
                    ? {
                        pointerEvents: 'none',
                      }
                    : {}
                }
                className="dark-disabled"
                rules={[
                  {
                    required: false,
                    validator: async (rule, value) => {
                      if (!value) return
                      const regex = /^(http|https):[\/\\]{2}/

                      const validation =
                        value && value?.every((val) => regex.test(val.trim()))

                      try {
                        if (!validation) {
                          throw new Error('Please enter valid url.')
                        }
                      } catch (err) {
                        scrollForm(form, 'stagingUrls')
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Select
                  showSearch
                  filterOption={filterOptions}
                  placeholder="Select Staging Urls"
                  onInputKeyDown={handleEnterPress}
                  disabled={readOnly}
                  mode="tags"
                  tagRender={(props) =>
                    linksHandler({props, isReadOnly: readOnly})
                  }
                >
                  {[].map((item) => (
                    <Option key={item} value={item} />
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={24} sm={12}>
              <FormItem
                label="Live URL"
                hasFeedback={readOnly ? false : true}
                name="liveUrl"
                style={
                  readOnly
                    ? {
                        pointerEvents: 'none',
                      }
                    : {}
                }
                className="dark-disabled"
                rules={[
                  {
                    required: false,
                    validator: async (rule, value) => {
                      if (!value) return
                      const regex = /^(http|https):[\/\\]{2}/

                      const validation =
                        value && value?.every((val) => regex.test(val.trim()))

                      try {
                        if (!validation) {
                          throw new Error('Please enter valid url.')
                        }
                      } catch (err) {
                        scrollForm(form, 'stagingUrls')
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Select
                  showSearch
                  filterOption={filterOptions}
                  placeholder="Select Live Urls"
                  disabled={readOnly}
                  mode="tags"
                  onInputKeyDown={handleEnterPress}
                  tagRender={(props) =>
                    linksHandler({props, isReadOnly: readOnly})
                  }
                >
                  {[].map((item) => (
                    <Option key={item} value={item} />
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={24}>
              <FormItem label="Notes" name="notes">
                <TextArea
                  placeholder="Enter Notes"
                  rows={6}
                  disabled={readOnly}
                  size="middle"
                />
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={24}>
              <Maintenance
                readOnly={readOnly}
                maintenance={maintenance}
                setMaintenance={setMaintenance}
              />
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  )
}

export default ProjectModal
