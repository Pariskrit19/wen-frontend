import {Button, Form, Input, Spin} from 'antd'
import React from 'react'
import IntlMessages from 'util/IntlMessages'
import {useMutation} from '@tanstack/react-query'
import {forgotPassword} from 'services/users/userDetails'
import {notification} from 'helpers/notification'
import {handleResponse} from 'helpers/utils'
import {useNavigate} from 'react-router-dom'
import {SIGNIN} from 'helpers/routePath'

const FormItem = Form.Item

function ForgotPassword() {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const forgetPasswordMutation = useMutation(
    (payload: {email: string}) => forgotPassword(payload),
    {
      onSuccess: (response) => {
        handleResponse(
          response,
          'Link sent ! Please check your Email',
          'Could not send link to your email account',
          [() => {}]
        )
        if (response.status) {
          navigate(`/${SIGNIN}`)
        }
      },
      onError: (error) => {
        notification({
          message: 'Could not send link to your email account',
          type: 'error',
        })
      },
    }
  )

  const handleSubmit = (values: {email: string}) => {
    forgetPasswordMutation.mutate(values)
  }
  return (
    <div className="gx-login-container">
      <Spin spinning={forgetPasswordMutation.isLoading}>
        <div className="gx-login-content">
          <div className="gx-login-header">
            <img
              src={require('assets/images/wenlogo.png')}
              alt="WebExperts Nepal"
              title="'"
            />
          </div>
          <div className="gx-mb-4">
            <h2>Forgot Your Password ?</h2>
            <p>
              <IntlMessages id="app.userAuth.forgot" />
            </p>
          </div>{' '}
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            className="gx-login-form gx-form-row0"
            form={form}
          >
            <FormItem
              hasFeedback
              name="email"
              rules={[
                {
                  type: 'email',
                  message: 'Please enter a valid E-mail!',
                },
                {
                  required: true,
                  message: 'Please enter your E-mail!',
                },
              ]}
            >
              <Input type="email" placeholder="E-Mail Address" />
            </FormItem>

            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                disabled={forgetPasswordMutation.isLoading}
              >
                <IntlMessages id="app.userAuth.send" />
              </Button>
            </FormItem>
          </Form>
          <span>
            Already have login and password?{' '}
            <span className="gx-link" onClick={() => navigate(`/${SIGNIN}`)}>
              Sign In
            </span>
          </span>
        </div>
      </Spin>
    </div>
  )
}

export default ForgotPassword
