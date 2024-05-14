import React, {Component} from 'react'
import {Form} from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import {Button, Input} from 'antd'
import IntlMessages from 'util/IntlMessages'

const FormItem = Form.Item

class ForgotPassword extends Component {
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
      }
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form

    return (
      <div className="gx-login-container">
        <div className="gx-login-content">
          <div className="gx-login-header">
            <img
              src={require('assets/images/logo-white.png')}
              alt="wieldy"
              title="wieldy"
            />
          </div>
          <div className="gx-mb-4">
            <h2>Forgot Your Password ?</h2>
            <p>
              <IntlMessages id="app.userAuth.forgot" />
            </p>
          </div>

          <Form
            layout="vertical"
            onSubmit={this.handleSubmit}
            className="gx-login-form gx-form-row0"
          >
            <FormItem>
              {getFieldDecorator('email', {
                rules: [
                  {
                    type: 'email',
                    message: 'Please enter a valid E-mail!',
                  },
                  {
                    required: true,
                    message: 'Please enter your E-mail!',
                  },
                ],
              })(<Input type="email" placeholder="E-Mail Address" />)}
            </FormItem>

            <FormItem>
              <Button type="primary" htmlType="submit">
                <IntlMessages id="app.userAuth.send" />
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
    )
  }
}

const WrappedForgotPasswordForm = Form.create()(ForgotPassword)

export default WrappedForgotPasswordForm
