import React, {Component} from 'react'
import {LockOutlined, UserOutlined} from '@ant-design/icons'
import {Form} from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import {Button, Checkbox, Input} from 'antd'
import {Link} from 'react-router-dom'

const FormItem = Form.Item

class SignIn extends Component {
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      console.log('values', values)
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form

    return (
      <div className="gx-login-container">
        <div className="gx-login-content">
          <div className="gx-login-header gx-text-center">
            <h1 className="gx-login-title">Sign In</h1>
          </div>
          <Form
            onSubmit={this.handleSubmit}
            className="gx-login-form gx-form-row0"
          >
            <FormItem>
              {getFieldDecorator('email', {
                rules: [{required: true, message: 'Please enter your email!'}],
              })(
                <Input
                  prefix={<UserOutlined style={{color: 'rgba(0,0,0,.25)'}} />}
                  placeholder="Email"
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [
                  {required: true, message: 'Please enter your Password!'},
                ],
              })(
                <Input
                  prefix={<LockOutlined style={{color: 'rgba(0,0,0,.25)'}} />}
                  type="password"
                  placeholder="Password"
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true,
              })(<Checkbox>Remember me</Checkbox>)}
              <Link
                className="gx-login-form-forgot"
                to="/custom-views/user-auth/forgot-password"
              >
                Forgot password
              </Link>
            </FormItem>
            <FormItem className="gx-text-center">
              <Button type="primary" htmlType="submit">
                Log in
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
    )
  }
}

const WrappedNormalLoginForm = Form.create()(SignIn)

export default WrappedNormalLoginForm
