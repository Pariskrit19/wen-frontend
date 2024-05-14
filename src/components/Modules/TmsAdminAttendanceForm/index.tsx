import React, {useEffect, useState} from 'react'
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
} from 'antd'
import moment, {Moment} from 'moment'
import type {Moment as Moments} from 'moment'
import {FieldTimeOutlined} from '@ant-design/icons'
import LiveTime from 'components/Elements/LiveTime'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {updateAttendance} from 'services/attendances'
import {handleResponse} from 'helpers/utils'
import {notification} from 'helpers/notification'
import Select from 'components/Elements/Select'
import getLocation from 'helpers/getLocation'
import useWindowsSize from 'hooks/useWindowsSize'
import {disabledAfterToday} from 'util/antDatePickerDisabled'
import {socket} from 'pages/Main'
import {CANCEL_TEXT} from 'constants/Common'

function TmsAdminAttendanceForm({
  toogle,
  handleCancel,
  users,
  AttToEdit,
}: {
  toogle: boolean
  handleCancel: any
  users: any[]
  AttToEdit: any
}) {
  const [PUnchInform] = Form.useForm()
  const [PUnchOutform] = Form.useForm()
  const {innerWidth} = useWindowsSize()
  const [user, setUser] = useState(undefined)
  const [date, setDate] = useState<null | Moment>(null)

  useEffect(() => {
    if (AttToEdit) {
      setDate(moment(AttToEdit.attendanceDate))
      setUser(AttToEdit.user)

      PUnchInform.resetFields()
      PUnchOutform.resetFields()
    }
  }, [AttToEdit])

  const queryClient = useQueryClient()

  const updateAttendances: any = useMutation(
    (payload: any) => updateAttendance(payload.id, payload.payload),
    {
      onSuccess: (response: any) => {
        handleResponse(
          response,
          'Punch Updated Successfully',
          'Punch  failed',
          [
            () => queryClient.invalidateQueries(['adminAttendance']),
            () => queryClient.invalidateQueries(['userAttendance']),
            () => queryClient.invalidateQueries(['lateAttendaceAttendance']),
            () => {
              socket.emit('CUD')
            },
          ]
        )
      },
      onError: (error) => {
        notification({message: 'Punch Update  failed', type: 'error'})
      },
    }
  )

  const handleUserChange = (userId: any) => {
    setUser(userId)
  }

  const handlePunchIn = async (values: any) => {
    const punchInTime = moment.utc(values.punchInTime).format()

    const payload =
      user === AttToEdit?.user
        ? {
            attendanceDate: moment(date).startOf('day').format().split('T')[0],
            punchInTime:
              moment(date).startOf('day').format().split('T')[0] +
              'T' +
              punchInTime.split('T')[1],
            punchInNote: values.punchInNote,
            isLateArrival: values?.isLateArrival,
          }
        : {
            attendanceDate: moment(date).startOf('day').format().split('T')[0],
            punchInTime:
              moment(date).startOf('day').format().split('T')[0] +
              'T' +
              punchInTime.split('T')[1],

            punchInNote: values.punchInNote,
            punchInLocation: await getLocation(),
            isLateArrival: values?.isLateArrival,
            user: user,
          }
    updateAttendances.mutate({
      id: AttToEdit?._id,
      payload,
    })
  }

  const handlePunchOut = async (values: any) => {
    const punchOutTime = moment.utc(values.punchOutTime).format()

    const payload =
      user === AttToEdit?.user
        ? {
            attendanceDate: moment(date).startOf('day').format().split('T')[0],
            punchOutTime:
              moment(date).startOf('day').format().split('T')[0] +
              'T' +
              punchOutTime.split('T')[1],
            punchOutNote: values.punchOutNote,
            midDayExit: values.midDayExit ? true : false,
          }
        : {
            attendanceDate: moment(date).startOf('day').format().split('T')[0],
            punchOutTime:
              moment(date).startOf('day').format().split('T')[0] +
              'T' +
              punchOutTime.split('T')[1],
            punchOutNote: values.punchOutNote,
            midDayExit: values.midDayExit ? true : false,
            punchOutLocation: await getLocation(),
            user: user,
          }
    updateAttendances.mutate({
      id: AttToEdit?._id,
      payload,
    })
  }

  const closeModel = () => {
    PUnchInform.resetFields()
    PUnchOutform.resetFields()
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
        <Button key="back" onClick={closeModel}>
          {CANCEL_TEXT}
        </Button>,
      ]}
    >
      <Spin spinning={updateAttendances.isLoading}>
        <div className="gx-d-flex gx-mb-4 gx-flex-row" style={{gap: 4}}>
          <Select
            disabled={AttToEdit}
            placeholder="Select Co-worker"
            onChange={handleUserChange}
            value={user}
            options={users?.map((x: any) => ({
              id: x._id,
              value: x.name,
            }))}
            style={{
              width: innerWidth <= 540 ? '100%' : '200px',
              marginBottom: innerWidth <= 540 ? '16px' : 0,
            }}
          />
          <DatePicker
            className="attDatePicker"
            disabled={AttToEdit}
            disabledDate={disabledAfterToday}
            placeholder="Select Date"
            value={date}
            onChange={(d) => setDate(d)}
            style={{width: innerWidth <= 540 ? '100%' : '200px'}}
          />
        </div>
        <Row>
          <Col span={24} sm={12} xs={24}>
            <Form
              layout="vertical"
              onFinish={handlePunchIn}
              form={PUnchInform}
              initialValues={{
                punchInTime: moment(AttToEdit?.punchInTime, 'HH:mm:ss a'),
                punchInNote: AttToEdit?.punchInNote,
                isLateArrival: AttToEdit?.isLateArrival,
              }}
            >
              <div className="gx-d-flex" style={{gap: 20}}>
                <Form.Item
                  name="punchInTime"
                  rules={[
                    ({getFieldValue}) => ({
                      validator(_, value) {
                        if (!value) {
                          return Promise.reject('Required!')
                        }
                        if (
                          value &&
                          !PUnchOutform.getFieldValue('punchOutTime')
                        ) {
                          return Promise.resolve()
                        }

                        if (
                          value.isBefore(
                            PUnchOutform.getFieldValue('punchOutTime')
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
                  <TimePicker use12Hours format="h:mm:ss A" />
                </Form.Item>
                <Form.Item name="isLateArrival" valuePropName="checked">
                  <Checkbox>Late Arrival</Checkbox>
                </Form.Item>
              </div>
              <Form.Item label="Punch In Note" name="punchInNote" hasFeedback>
                <Input.TextArea rows={5} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Punch In
                </Button>
              </Form.Item>
            </Form>
          </Col>
          <Col span={24} sm={12}>
            <Form
              layout="vertical"
              onFinish={handlePunchOut}
              form={PUnchOutform}
              initialValues={{
                punchOutTime: AttToEdit?.punchOutTime
                  ? moment(AttToEdit?.punchOutTime, 'HH:mm:ss a')
                  : null,
                punchOutNote: AttToEdit?.punchOutNote,
                midDayExit: AttToEdit?.midDayExit,
              }}
            >
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
                          value.isAfter(
                            PUnchInform.getFieldValue('punchInTime')
                          )
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
                  <TimePicker use12Hours format="h:mm:ss A" />
                </Form.Item>
                <Form.Item name="midDayExit" valuePropName="checked">
                  <Checkbox>Mid-day Exit</Checkbox>
                </Form.Item>
              </div>
              <Form.Item label="Punch Out Note" name="punchOutNote" hasFeedback>
                <Input.TextArea rows={5} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Punch Out
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Spin>
    </Modal>
  )
}

export default TmsAdminAttendanceForm
