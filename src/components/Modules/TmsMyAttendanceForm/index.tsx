import React, {useState} from 'react'
import {Button, Col, Form, Input, Modal, Row, Checkbox, Spin} from 'antd'
import moment from 'moment'
import {FieldTimeOutlined} from '@ant-design/icons'
import LiveTime from 'components/Elements/LiveTime'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {addAttendance, getIpAddres, updatePunchout} from 'services/attendances'
import {handleResponse, isNotValidTimeZone, sortFromDate} from 'helpers/utils'
import {notification} from 'helpers/notification'
import {useDispatch, useSelector} from 'react-redux'
import {PUNCH_IN, PUNCH_OUT} from 'constants/ActionTypes'
import {fetchLoggedInUserAttendance} from 'appRedux/actions/Attendance'
import {Dispatch} from 'redux'
import getLocation, {checkLocationPermission} from 'helpers/getLocation'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {getLeavesOfUser} from 'services/leaves'
import {FIRST_HALF} from 'constants/Leaves'
import {CANCEL_TEXT} from 'constants/Common'

function TmsMyAttendanceForm({
  title,
  toogle,
  handleCancel,
}: {
  title: string
  toogle: boolean
  handleCancel: any
}) {
  const user = useSelector(selectAuthUser)

  const [PUnchInform] = Form.useForm()
  const [PUnchOutform] = Form.useForm()

  const [disableButton, setdisableButton] = useState(false)
  const queryClient = useQueryClient()
  const dispatch: Dispatch<any> = useDispatch()
  const reduxuserAttendance = useSelector((state: any) => state.attendance)

  const {punchIn, latestAttendance} = reduxuserAttendance

  const {data: leavesData, isFetching} = useQuery(
    ['userLeaves'],
    () =>
      getLeavesOfUser(
        user?._id,
        'approved',
        undefined,
        1,
        30,
        `${moment().startOf('day').format().split('+')?.[0]}Z`,
        `${moment().add(1, 'd').startOf('day').format().split('+')?.[0]}Z`
      ),
    {enabled: !!toogle}
  )

  const addAttendances: any = useMutation((payload) => addAttendance(payload), {
    onSuccess: (response: any) => {
      if (response.status) {
        closeModel()
      }

      handleResponse(response, 'Punched Successfully', 'Punch  failed', [
        () => {
          dispatch(fetchLoggedInUserAttendance(user._id))
        },
        () => {
          dispatch({type: PUNCH_OUT})
        },
        () => queryClient.invalidateQueries(['userAttendance']),
        () => queryClient.invalidateQueries(['adminAttendance']),
      ])
    },
    onError: (error) => {
      notification({message: 'Punch  failed', type: 'error'})
    },
  })

  const punchOutAttendances: any = useMutation(
    (payload: any) => updatePunchout(payload?.userId, payload.payload),
    {
      onSuccess: (response: any) => {
        if (response.status) {
          closeModel()
        }

        handleResponse(response, 'Punched Successfully', 'Punch  failed', [
          () => {
            dispatch(fetchLoggedInUserAttendance(user._id))
          },
          () => {
            dispatch({type: PUNCH_IN})
          },
          () => queryClient.invalidateQueries(['userAttendance']),
          () => queryClient.invalidateQueries(['adminAttendance']),
        ])
      },
      onError: (error) => {
        notification({message: 'Punch  failed', type: 'error'})
      },
    }
  )

  const handlePunchIn = async (values: any) => {
    if (isNotValidTimeZone()) {
      notification({
        message: 'Your timezone is not a valid timezone',
        type: 'error',
      })
      return
    }

    setdisableButton(true)
    const location = await getLocation()

    if (location && (await checkLocationPermission())) {
      const IP = await getIpAddres()

      let attendanceParams: any = {
        punchInTime: moment.utc().format(),
        punchInNote: values.punchInNote,
        punchInLocation: location,
        punchInIp: IP?.data?.IPv4,
        attendanceDate: moment.utc().startOf('day').format(),
      }
      if (leavesData?.data?.data?.data?.[0]?.halfDay !== 'first-half') {
        if (!latestAttendance || latestAttendance.length === 0) {
          attendanceParams = {...attendanceParams, isLateArrival: true}
        }
      }

      addAttendances.mutate(attendanceParams)
    } else {
      notification({
        message: 'Please allow Location Access to Punch for Attendance',
        type: 'error',
      })
    }
    setdisableButton(false)
  }

  const handlePunchOut = async (values: any) => {
    if (isNotValidTimeZone()) {
      notification({
        message: 'Your timezone is not valid timezone',
        type: 'error',
      })
      return
    }

    setdisableButton(true)
    const location = await getLocation()
    const lastattendace = sortFromDate(latestAttendance, 'punchInTime').at(-1)

    if (location && (await checkLocationPermission())) {
      const IP = await getIpAddres()

      punchOutAttendances.mutate({
        userId: lastattendace._id,
        payload: {
          punchOutNote: values.punchOutNote,
          midDayExit: values.midDayExit ? true : false,
          punchOutTime: moment.utc().format(),
          punchOutLocation: location,
          punchOutIp: IP?.data?.IPv4,
        },
      })
    } else {
      notification({
        message: 'Please allow Location Access to Punch for Attendance',
        type: 'error',
      })
    }
    setdisableButton(false)
  }

  const closeModel = () => {
    PUnchInform.resetFields()
    PUnchOutform.resetFields()
    handleCancel()
  }

  return (
    <Modal
      title={
        <span className="gx-flex-row" style={{gap: 10, fontWeight: '400'}}>
          {title}
        </span>
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
      <Spin
        spinning={addAttendances.isLoading || punchOutAttendances.isLoading}
      >
        <Row>
          <Col span={24} sm={24} xs={24}>
            <div
              className="gx-flex-row gx-mb-4"
              style={{gap: 10, fontWeight: '400'}}
            >
              {' '}
              <FieldTimeOutlined
                style={{fontSize: '24px', marginTop: '-2px'}}
              />
              <LiveTime />
              <span style={{marginLeft: '0.5rem'}}>
                {moment().format('dddd, MMMM D, YYYY')}
              </span>
            </div>
          </Col>
          {punchIn ? (
            <Col span={24} sm={24} xs={24}>
              <Form
                layout="vertical"
                onFinish={handlePunchIn}
                form={PUnchInform}
              >
                <Form.Item
                  label="Punch In Note"
                  name="punchInNote"
                  rules={[
                    {
                      validator: async (rule, value) => {
                        try {
                          if (!value) {
                            throw new Error('Punch In Note is required.')
                          }
                          const trimmedValue = value && value.trim()

                          if (trimmedValue?.length < 10) {
                            throw new Error(
                              'Please enter greator than 10 characters for Punch In Note.'
                            )
                          }
                        } catch (err) {
                          throw new Error(err.message)
                        }
                      },
                    },
                  ]}
                  hasFeedback
                >
                  <Input.TextArea rows={5} />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={!punchIn || disableButton}
                  >
                    Punch In
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          ) : (
            <Col span={24} sm={24}>
              <Form
                layout="vertical"
                onFinish={handlePunchOut}
                form={PUnchOutform}
              >
                <Form.Item
                  label="Punch Out Note"
                  name="punchOutNote"
                  rules={[
                    {
                      validator: async (rule, value) => {
                        try {
                          if (!value) {
                            throw new Error('Punch Out Note is required.')
                          }
                          const trimmedValue = value && value.trim()
                          if (trimmedValue?.length < 10) {
                            throw new Error(
                              'Please enter greator than 10 characters for Punch Out Note.'
                            )
                          }
                        } catch (err) {
                          throw new Error(err.message)
                        }
                      },
                    },
                  ]}
                  hasFeedback
                >
                  <Input.TextArea rows={5} />
                </Form.Item>
                <Form.Item name="midDayExit" valuePropName="checked">
                  <Checkbox>Mid-day Exit</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={punchIn || disableButton}
                  >
                    Punch Out
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          )}
        </Row>
      </Spin>
    </Modal>
  )
}

export default TmsMyAttendanceForm
