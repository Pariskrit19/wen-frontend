import React from 'react'
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Checkbox,
  Spin,
  DatePicker,
  TimePicker,
  Select,
} from 'antd'
import moment from 'moment'
import {FieldTimeOutlined} from '@ant-design/icons'
import LiveTime from 'components/Elements/LiveTime'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {addUserAttendance} from 'services/attendances'
import {filterOptions, handleResponse} from 'helpers/utils'
import {notification} from 'helpers/notification'
import useWindowsSize from 'hooks/useWindowsSize'
import getLocation from 'helpers/getLocation'
import {disabledAfterToday} from 'util/antDatePickerDisabled'
import {emptyText} from 'constants/EmptySearchAntd'
import {socket} from 'pages/Main'
import {CANCEL_TEXT} from 'constants/Common'

function TmsAdminAddAttendanceForm({
  toogle,
  handleCancel,
  users,
}: {
  toogle: boolean
  handleCancel: any
  users: any[]
}) {
  const [PUnchform] = Form.useForm()
  const queryClient = useQueryClient()
  const {innerWidth} = useWindowsSize()

  const addAttendances: any = useMutation(
    (payload: any) => addUserAttendance(payload.id, payload.payload),
    {
      onSuccess: (response: any) => {
        if (response.status) {
          closeModel()
        }
        handleResponse(
          response,
          'Punch added Successfully',
          'Punch add failed',
          [
            () => queryClient.invalidateQueries(['adminAttendance']),
            () => queryClient.invalidateQueries(['userAttendance']),
            () => {
              socket.emit('CUD')
            },
          ]
        )
      },
      onError: (error) => {
        notification({message: 'Punch add failed', type: 'error'})
      },
    }
  )

  const handleAdd = async (values: any) => {
    const attendanceDate = moment(values.attendanceDate)
      .startOf('day')
      .format()
      .split('T')[0]
    const punchInTime =
      moment.utc(attendanceDate).format().split('T')[0] +
      'T' +
      moment.utc(values.punchInTime).format().split('T')[1]
    const punchOutTime = values.punchOutTime
      ? moment.utc(attendanceDate).format().split('T')[0] +
        'T' +
        moment.utc(values.punchOutTime).format().split('T')[1]
      : undefined
    if (!values?.isLateArrival) {
      delete values.isLateArrival
    }
    const payload = {
      ...values,
      attendanceDate,
      punchInTime,
      punchOutTime: punchOutTime,
      punchOutLocation: await getLocation(),
      punchInLocation: await getLocation(),
    }
    addAttendances.mutate({id: values.user, payload})
  }

  const closeModel = () => {
    PUnchform.resetFields()
    handleCancel()
  }

  return (
    <Modal
      width={'85%'}
      title={
        <div className="gx-d-flex gx-flex-row">
          <FieldTimeOutlined style={{fontSize: '24px'}} />
          <LiveTime />
          <span style={{marginLeft: '0.5rem'}}>
            {moment().format('dddd, MMMM D, YYYY')}
          </span>
        </div>
      }
      mask={false}
      visible={toogle}
      onCancel={closeModel}
      footer={[
        <>
          <Button
            type="primary"
            form="myForm"
            key="submit"
            htmlType="submit"
            disabled={addAttendances.isLoading}
          >
            Add
          </Button>
          <Button key="back" onClick={closeModel}>
            {CANCEL_TEXT}
          </Button>
        </>,
      ]}
    >
      <Spin spinning={addAttendances.isLoading}>
        <Form
          layout="vertical"
          onFinish={handleAdd}
          form={PUnchform}
          id="myForm"
          initialValues={{
            punchInTime: moment('09:00:00 AM', 'HH:mm:ss a'),
            punchOutTime: moment('06:00:00 PM', 'HH:mm:ss a'),
          }}
        >
          <Row>
            <Col span={24} sm={12}>
              <Row>
                <Form.Item
                  name="user"
                  rules={[{required: true, message: 'Co-worker is required.'}]}
                  className="direct-form-item"
                  style={{marginRight: innerWidth <= 748 ? 0 : '1rem'}}
                >
                  <Select
                    notFoundContent={emptyText}
                    showSearch
                    filterOption={filterOptions}
                    placeholder="Select Co-worker"
                  >
                    {users?.map((type) => (
                      <Select.Option value={type._id} key={type._id}>
                        {type.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="attendanceDate"
                  rules={[
                    {required: true, message: 'Attendance Date is required.'},
                  ]}
                >
                  <DatePicker
                    style={{width: innerWidth <= 748 ? '100%' : '200px'}}
                    disabledDate={disabledAfterToday}
                  />
                </Form.Item>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={24} sm={12} xs={24}>
              <div className="gx-d-flex" style={{gap: 20}}>
                <Form.Item
                  name="punchInTime"
                  rules={[
                    ({getFieldValue}) => ({
                      validator(_, value) {
                        if (!value) {
                          return Promise.reject('Required!')
                        }
                        if (value && !PUnchform.getFieldValue('punchOutTime')) {
                          return Promise.resolve()
                        }

                        if (
                          value.isBefore(
                            PUnchform.getFieldValue('punchOutTime')
                          )
                        ) {
                          return Promise.resolve()
                        }
                        return Promise.reject(
                          new Error(
                            'Punch In Time should be before Punch Out Time'
                          )
                        )
                      },
                    }),
                  ]}
                  hasFeedback
                >
                  <TimePicker
                    use12Hours
                    format="h:mm:ss A"
                    defaultValue={moment('09:00:00 AM', 'HH:mm:ss a')}
                  />
                </Form.Item>
                <Form.Item name="isLateArrival" valuePropName="checked">
                  <Checkbox>Late Arrival</Checkbox>
                </Form.Item>
              </div>
              <Form.Item
                label="Punch In Note"
                name="punchInNote"
                hasFeedback
                rules={[
                  {required: true, message: 'Punch In Note is required.'},
                ]}
              >
                <Input.TextArea rows={5} />
              </Form.Item>
            </Col>
            <Col span={24} sm={12}>
              <div className="gx-d-flex" style={{gap: 20}}>
                <Form.Item
                  name="punchOutTime"
                  rules={[
                    ({getFieldValue}) => ({
                      validator(_, value) {
                        if (!value) {
                          return Promise.reject(new Error('Required!'))
                        }
                        if (
                          value.isAfter(PUnchform.getFieldValue('punchInTime'))
                        ) {
                          return Promise.resolve()
                        }
                        return Promise.reject(
                          new Error(
                            'Punch Out Time should be after Punch In Time'
                          )
                        )
                      },
                    }),
                  ]}
                  hasFeedback
                >
                  <TimePicker
                    use12Hours
                    format="h:mm:ss A"
                    defaultValue={moment('06:00:00 PM', 'HH:mm:ss a')}
                  />
                </Form.Item>
                <Form.Item name="midDayExit" valuePropName="checked">
                  <Checkbox>Mid-day Exit</Checkbox>
                </Form.Item>
              </div>
              <Form.Item label="Punch Out Note" name="punchOutNote" hasFeedback>
                <Input.TextArea rows={5} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  )
}

export default TmsAdminAddAttendanceForm
