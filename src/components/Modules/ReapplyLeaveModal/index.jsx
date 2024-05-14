import React, {useEffect, useState} from 'react'
import {Button, Modal, Form, Input, Row, Col, Spin} from 'antd'
import 'moment/locale/en-gb'
import {THEME_TYPE_DARK} from 'constants/ThemeSetting'
import {useSelector} from 'react-redux'
import 'react-multi-date-picker/styles/backgrounds/bg-dark.css'
import useWindowsSize from 'hooks/useWindowsSize'

const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
}

const formItemLayout = {
  labelCol: {
    xs: {span: 0},
    sm: {span: 16},
  },
  wrapperCol: {
    xs: {span: 0},
    sm: {span: 24},
  },
}

function ReapplyLeaveModal({
  open,
  onClose,
  onSubmit,
  leaveData,
  loader,
  setLoader,
  title = 'Reapply Leave',
  isRequired = false,
  label = 'Leave Reapply Reason',
  name = 'reapplyreason',
}) {
  const [form] = Form.useForm()
  const {themeType} = useSelector((state) => state.settings)
  const darkCalendar = themeType === THEME_TYPE_DARK

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open])

  const onFinish = () => {
    form.validateFields().then((values) => {
      setLoader(true)
      onSubmit({...leaveData, ...values})
    })
  }

  return (
    <Modal
      width={1100}
      title={title}
      style={{flexDirection: 'row'}}
      visible={open}
      mask={false}
      onOk={onFinish}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onFinish}>
          Submit
        </Button>,
      ]}
    >
      <Spin spinning={loader}>
        <Form
          {...layout}
          form={form}
          name="control-hooks"
          layout="vertical"
          className="padding-lt-0"
        >
          <Row>
            <Col xs={24} sm={24} xl={24}>
              <Form.Item
                {...formItemLayout}
                name={name}
                label={label}
                rules={[
                  {
                    required: isRequired,
                    validator: async (rule, value) => {
                      try {
                        if (!value && isRequired)
                          throw new Error(`${label} is required.`)

                        const trimmedValue = value && value.trim()
                        if (trimmedValue?.length < 10 && isRequired) {
                          throw new Error(
                            'Reason should be at least 10 letters!'
                          )
                        }
                        if (trimmedValue?.length > 500 && isRequired) {
                          throw new Error(
                            'Reason should be less than 500 letters!'
                          )
                        }
                      } catch (err) {
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Input.TextArea
                  allowClear
                  rows={10}
                  style={{
                    background: darkCalendar ? '#434f5a' : '',
                  }}
                  placeholder={!isRequired ? 'Additional Message (If Any)' : ''}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  )
}

export default ReapplyLeaveModal
