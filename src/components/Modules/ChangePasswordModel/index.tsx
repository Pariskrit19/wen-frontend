import React from 'react'
import {Button, Form, Modal, Input, Spin} from 'antd'
import {useMutation} from '@tanstack/react-query'
import {UpdateUserPassword} from 'services/users/userDetails'
import {notification} from 'helpers/notification'
import {CANCEL_TEXT} from 'constants/Common'

function ChangePasswordModel({open, onClose}: {open: boolean; onClose: any}) {
  const [form] = Form.useForm()

  const updatePasswordMutation: any = useMutation(
    (payload) => UpdateUserPassword(payload),
    {
      onSuccess: (response) => {
        if (response.status) {
          handleClose()
          notification({
            message: 'Password Updated.',
            type: 'success',
          })
        } else {
          notification({
            message: `${response?.data?.message}`,
            type: 'error',
          })
        }
      },
      onError: (error) => {
        notification({message: 'Could not update password', type: 'error'})
      },
    }
  )

  const updaetPassword = (values: {
    password: string
    passwordConfirm: string
    passwordCurrent: string
  }): void => {
    updatePasswordMutation.mutate(values)
  }

  const handleClose = () => {
    onClose()
    form.resetFields()
  }

  return (
    <Modal
      visible={open}
      title={'Update Your Password'}
      onCancel={handleClose}
      mask={false}
      footer={[
        <Button
          key="submit"
          type="primary"
          disabled={updatePasswordMutation.isLoading}
          htmlType="submit"
          form="chnagePasswordForm"
        >
          Update Password
        </Button>,
        <Button key="back" onClick={handleClose}>
          {CANCEL_TEXT}
        </Button>,
      ]}
    >
      <Spin spinning={updatePasswordMutation.isLoading}>
        <Form
          form={form}
          id="chnagePasswordForm"
          layout="vertical"
          onFinish={updaetPassword}
        >
          <Form.Item
            hasFeedback
            label="Current Password"
            name="passwordCurrent"
            rules={[{required: true, message: 'Required!'}]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            hasFeedback
            label="New Password"
            name="password"
            rules={[
              {required: true, message: 'Required!'},
              {min: 8, message: 'Must be atleast 8 characters'},
            ]}
          >
            <Input.Password />
          </Form.Item>{' '}
          <Form.Item
            hasFeedback
            label="Confirm New Password"
            name="passwordConfirm"
            rules={[
              {required: true, message: 'Required!'},
              {
                message: 'Must match Password',
                validator: (_, val) => {
                  if (form.getFieldValue('password') === val || !val) {
                    return Promise.resolve()
                  } else {
                    return Promise.reject('Must match Password')
                  }
                },
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  )
}

export default ChangePasswordModel
