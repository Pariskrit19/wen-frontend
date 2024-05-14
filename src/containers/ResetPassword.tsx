import {Button, Form, Input, Spin} from 'antd'
import React from 'react'
import IntlMessages from 'util/IntlMessages'
import {useMutation} from '@tanstack/react-query'
import {resetPassword} from 'services/users/userDetails'
import {notification} from 'helpers/notification'
import {handleResponse} from 'helpers/utils'
import {useNavigate, useParams} from 'react-router-dom'
import {SIGNIN} from 'helpers/routePath'

const FormItem = Form.Item

function ResetPassword() {
  const {token} = useParams()
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const resetPasswordMutation = useMutation(
    (payload: {
      token: string
      data: {passwordConfirm: string; password: string}
    }) => resetPassword(payload.token, payload.data),
    {
      onSuccess: (response) => {
        handleResponse(
          response,
          'Password Reset Successfully',
          'Could not reset password',
          [() => {}]
        )
        if (response.status) {
          navigate(`/${SIGNIN}`)
        }
      },
      onError: (error) => {
        notification({message: 'Could not reset password', type: 'error'})
      },
    }
  )

  const handleSubmit = (values: {
    password: string
    passwordConfirm: string
  }) => {
    resetPasswordMutation.mutate({data: values, token: token || ''})
  }
  return (
    <div className="gx-login-container">
      <Spin spinning={resetPasswordMutation.isLoading}>
        <div className="gx-login-container">
          <div className="gx-login-content">
            <div className="gx-login-header">
              <img
                src={require('assets/images/wenlogo.png')}
                alt="Webexperts Nepal"
                title=""
              />
            </div>
            <div className="gx-mb-4">
              <h2>Reset Password</h2>
              <p>
                <IntlMessages id="appModule.enterPasswordReset" />
              </p>
            </div>

            <Form
              form={form}
              onFinish={handleSubmit}
              className="gx-login-form gx-form-row0"
            >
              <FormItem
                style={{minWidth: '330px'}}
                hasFeedback
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your password!',
                  },
                  {min: 8, message: 'Must be atleast 8 characters'},
                ]}
              >
                <Input.Password placeholder="New Password" />
              </FormItem>

              <FormItem
                style={{minWidth: '330px'}}
                hasFeedback
                name="passwordConfirm"
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
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
                <Input.Password placeholder="Retype New Password" />
              </FormItem>

              <FormItem>
                <Button type="primary" htmlType="submit">
                  <IntlMessages id="app.userAuth.reset" />
                </Button>
              </FormItem>
            </Form>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default ResetPassword
