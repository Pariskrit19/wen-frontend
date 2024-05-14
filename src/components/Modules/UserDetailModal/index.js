import React, {useEffect, useState} from 'react'
import '@ant-design/compatible/assets/index.css'
import {
  Button,
  DatePicker,
  Input,
  Modal,
  Select,
  Spin,
  Form,
  TimePicker,
  Tooltip,
  Radio,
  Popconfirm,
  Checkbox,
} from 'antd'
import moment from 'moment'
import {
  changeDate,
  dateToDateFormat,
  filterOptions,
  scrollForm,
} from 'helpers/utils'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {CANCEL_TEXT} from 'constants/Common'

const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    xs: {span: 0},
    sm: {span: 8},
  },
  wrapperCol: {
    xs: {span: 0},
    sm: {span: 16},
  },
}

function UserDetailForm({
  toggle,
  onToggleModal,
  roles,
  position,
  positionTypes,
  onSubmit,
  intialValues,
  readOnly = false,
  loading = false,
  currentQuarter,
}) {
  const [form] = Form.useForm()

  const [status, setStatus] = useState(false)
  const handleCancel = () => {
    form.resetFields()
    onToggleModal({})
  }

  const isAdmin = intialValues?.role?.key === 'admin'

  const user = useSelector(selectAuthUser)

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      let prevReviewDate =
        intialValues?.lastReviewDate?.length > 0
          ? intialValues?.lastReviewDate?.map((d) => moment(d))
          : []
      if (!!values?.lastReviewDate) {
        if (
          intialValues?.lastReviewDate?.length === 0 ||
          !prevReviewDate[prevReviewDate.length - 1].isSame(
            values?.lastReviewDate
          )
        ) {
          prevReviewDate.push(values.lastReviewDate)
        }
      }
      onSubmit({
        ...intialValues,
        ...values,
        status,
        lastReviewDate: prevReviewDate,
        officeTime: {
          utcDate: moment(values.officeTime._d).utc().format(),
          hour: moment(values.officeTime._d).add(10, 'm').utc().format('h'),
          minute: moment(values.officeTime._d).add(10, 'm').utc().format('m'),
        },
        officeEndTime: moment(values.officeEndTime._d).utc().format(),
      })
    })
  }

  const disableDate = (current) => {
    return current && current > moment().endOf('day')
  }

  const disableExitDate = (current) => {
    const joinDate = form.getFieldValue('joinDate')
    return (
      current && (current < moment(joinDate) || current > moment().endOf('day'))
    )
  }

  const disableJoinDate = (current) => {
    return (
      (current && current < moment('2012-1-2')) ||
      (current && current > moment().endOf('day'))
    )
  }

  const disableReviewDate = (current) => {
    return (
      (current && current > moment().endOf('day')) ||
      (intialValues?.lastReviewDate.length > 0 &&
        current <
          moment(
            intialValues?.lastReviewDate[
              intialValues?.lastReviewDate?.length - 1
            ]
          ))
    )
  }

  useEffect(() => {
    if (toggle) {
      const joinDateValidation = !dateToDateFormat(intialValues?.joinDate)
        ?.split('-')
        ?.includes('NaN')
      form.setFieldsValue({
        name: intialValues.name ? intialValues.name : '',
        role:
          intialValues.role && intialValues.role._id
            ? intialValues.role._id
            : undefined,
        position:
          intialValues.position && intialValues.position._id
            ? intialValues.position._id
            : undefined,
        positionType:
          intialValues.positionType && intialValues.positionType._id
            ? intialValues.positionType._id
            : undefined,

        panNumber: intialValues.panNumber && intialValues.panNumber,
        citNumber: intialValues.citNumber && intialValues.citNumber,
        bankAccNumber: intialValues.bankAccNumber && intialValues.bankAccNumber,
        bankName: intialValues.bankName && intialValues.bankName,
        lastReviewDate:
          intialValues?.lastReviewDate?.length > 0 &&
          moment(
            intialValues.lastReviewDate[intialValues.lastReviewDate.length - 1]
          ),
        joinDate:
          joinDateValidation && moment(dateToDateFormat(intialValues.joinDate)),
        exitDate: intialValues.exitDate && moment(intialValues.exitDate),
        officeTime: intialValues?.officeTime?.utcDate
          ? moment(new Date(intialValues?.officeTime?.utcDate), 'h:mm:ss a')
          : moment('09:00:00 AM', 'HH:mm:ss a'),
        isPartTime: intialValues?.isPartTime,
        officeEndTime: intialValues?.officeEndTime
          ? moment(new Date(intialValues?.officeEndTime), 'h:mm:ss a')
          : moment('06:00:00 PM', 'HH:mm:ss a'),
      })
      setStatus(intialValues?.status)
    }

    if (!toggle) form.resetFields()
  }, [toggle])
  return (
    <Modal
      title={readOnly ? 'Details' : 'Update Co-worker'}
      visible={toggle}
      mask={false}
      onOk={handleSubmit}
      onCancel={handleCancel}
      footer={
        readOnly
          ? [
              <Button key="back" onClick={handleCancel}>
                {CANCEL_TEXT}
              </Button>,
            ]
          : [
              <Button key="back" onClick={handleCancel}>
                {CANCEL_TEXT}
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
      <Spin spinning={loading}>
        <Form form={form}>
          <FormItem
            {...formItemLayout}
            label="Name"
            hasFeedback={readOnly ? false : true}
            name="name"
            rules={[
              {
                required: true,
                validator: async (_, value) => {
                  try {
                    if (!value) {
                      throw new Error('Name is required.')
                    }
                    const regex = /^[A-Za-z ]+$/
                    const isValid = regex.test(value)
                    if (value.trim().length === 0) {
                      throw new Error('Please enter a valid Name.')
                    }

                    if (!isValid) {
                      throw new Error('Please enter a valid Name.')
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
          <FormItem
            {...formItemLayout}
            label="Role"
            hasFeedback={readOnly ? false : true}
            name="role"
            rules={[{required: true, message: 'Role is required.'}]}
          >
            <Select
              showSearch
              placeholder="Select Role"
              disabled={readOnly || isAdmin}
              filterOption={filterOptions}
            >
              {roles &&
                roles?.data?.data?.data
                  ?.filter((role) => {
                    return !(
                      user?.role?.key !== 'admin' && role?.key === 'admin'
                    )
                  })
                  .map((role) => (
                    <Option value={role._id} key={role._id}>
                      {role.value}
                    </Option>
                  ))}
            </Select>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Office Start Time"
            name="officeTime"
            hasFeedback={readOnly ? false : true}
            rules={[
              {
                required: true,
                validator: async (rule, value) => {
                  let startTime = `${value.format('HH:mm:ss ')}`
                  let endTime = `${form
                    .getFieldValue('officeEndTime')
                    .format('HH:mm:ss ')}`
                  try {
                    if (!value) {
                      throw new Error('Office Start Time is required.')
                    } else if (endTime <= startTime) {
                      throw new Error(
                        'Office start time shoule be before office end time'
                      )
                    }
                  } catch (err) {
                    scrollForm(form, 'officeTime')
                    throw new Error(err.message)
                  }
                },
              },
            ]}
          >
            <TimePicker
              disabled={readOnly}
              style={{width: '100%'}}
              format="h:mm:ss A"
              initialValues={moment('09:00:00 AM', 'HH:mm:ss a')}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Office End Time"
            name="officeEndTime"
            hasFeedback={readOnly ? false : true}
            rules={[
              {
                required: true,
                validator: async (rule, value) => {
                  let endTime = `${value.format('HH:mm:ss ')}`
                  let startTime = `${form
                    .getFieldValue('officeTime')
                    .format('HH:mm:ss ')}`
                  try {
                    if (!value) {
                      throw new Error('Office End Time is required.')
                    } else if (endTime <= startTime) {
                      throw new Error(
                        'Office end time should be after office start time.'
                      )
                    }
                  } catch (err) {
                    scrollForm(form, 'officeEndTime')
                    throw new Error(err.message)
                  }
                },
              },
            ]}
          >
            <TimePicker
              disabled={readOnly}
              style={{width: '100%'}}
              format="h:mm:ss A"
              initialValues={moment('06:00:00 PM', 'HH:mm:ss a')}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Position"
            hasFeedback={readOnly ? false : true}
            name="position"
            rules={[
              {
                required: true,
                message: 'Position is required.',
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Select Position"
              disabled={readOnly || isAdmin}
              filterOption={filterOptions}
            >
              {position &&
                position?.data?.data?.data?.map((position) => (
                  <Option value={position._id} key={position._id}>
                    {position.name}
                  </Option>
                ))}
            </Select>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Position Type"
            hasFeedback={readOnly ? false : true}
            name="positionType"
            rules={[
              {
                required: true,
                message: 'Position Type is required.',
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Select Position Type"
              disabled={readOnly}
              filterOption={filterOptions}
            >
              {positionTypes &&
                positionTypes?.data?.data?.data?.map((positionType) => (
                  <Option value={positionType._id} key={positionType._id}>
                    {positionType.name}
                  </Option>
                ))}
            </Select>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Status"
            rules={[
              {
                required: true,
                message: 'Status is required.',
              },
            ]}
          >
            <Radio.Group
              buttonStyle="solid"
              value={status}
              id="radio"
              disabled={readOnly}
            >
              <Popconfirm
                title="Are you sure you want to switch Co-Worker Status to Permanent?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => setStatus('Permanent')}
              >
                <Radio.Button value="Permanent">Permanent</Radio.Button>
              </Popconfirm>

              <Popconfirm
                title="Are you sure you want to switch Co-worker Status to Probation?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => setStatus('Probation')}
              >
                <Radio.Button value="Probation">Probation</Radio.Button>
              </Popconfirm>
            </Radio.Group>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="Part Time"
            hasFeedback={readOnly ? false : true}
            name="isPartTime"
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="Last Review Date"
            hasFeedback={readOnly ? false : true}
            name="lastReviewDate"
            rules={[
              {
                required: false,
                message: 'Last Review Date is required.',
              },
            ]}
          >
            <DatePicker
              disabledDate={disableReviewDate}
              className=" gx-w-100"
              disabled={readOnly}
            />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="Join Date"
            hasFeedback={readOnly ? false : true}
            name="joinDate"
            rules={[
              {
                required: true,
                validator: async (rule, value) => {
                  try {
                    if (!value) {
                      throw new Error('Join Date is required.')
                    }
                  } catch (err) {
                    scrollForm(form, 'joinDate')
                    throw new Error(err.message)
                  }
                },
              },
            ]}
          >
            <DatePicker
              disabledDate={disableJoinDate}
              className=" gx-w-100"
              disabled={readOnly}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Exit Date"
            hasFeedback={readOnly ? false : true}
            name="exitDate"
          >
            <DatePicker
              disabledDate={disableExitDate}
              className=" gx-w-100"
              disabled={readOnly}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="PAN Number"
            hasFeedback={readOnly ? false : true}
            name="panNumber"
            rules={[
              {
                pattern: new RegExp(/^[0-9]+$/),
                message: 'PAN must be a number.',
              },
            ]}
          >
            <Input
              placeholder="Enter Pan Number"
              type="number"
              disabled={readOnly}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="CIT Number"
            hasFeedback={readOnly ? false : true}
            name="citNumber"
            rules={[
              {
                pattern: new RegExp(/^[0-9]+$/),
                message: 'CIT must be a number!',
              },
            ]}
          >
            <Input
              placeholder="Enter Cit Number"
              type="number"
              disabled={readOnly}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Bank Name"
            hasFeedback={readOnly ? false : true}
            name="bankName"
          >
            <Input placeholder="Enter Bank Name" disabled={readOnly} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Bank Account Number"
            hasFeedback={readOnly ? false : true}
            name="bankAccNumber"
          >
            <Input
              placeholder="Enter Bank Account Number"
              disabled={readOnly}
            />
          </FormItem>
        </Form>
      </Spin>
    </Modal>
  )
}

export default UserDetailForm
