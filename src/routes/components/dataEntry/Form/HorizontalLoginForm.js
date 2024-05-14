import React, {Component} from 'react'
import {connect} from 'react-redux'
import {LockOutlined, UserOutlined} from '@ant-design/icons'
import {Form} from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import {Button, Card, Checkbox, Input, message} from 'antd'

import {hideMessage, showAuthLoader, userSignIn} from 'appRedux/actions/Auth'
import './horizontalLoginForm.less'
import CircularProgress from 'components/Elements/CircularProgress/index'

const FormItem = Form.Item

class HorizontalLoginForm extends Component {
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.showAuthLoader()
        this.props.userSignIn(values)
      }
    })
  }

  constructor() {
    super()
    this.state = {
      email: 'demo@example.com',
      password: 'demo#123',
    }
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const {showMessage, loader, alertMessage} = this.props

    return (
      <Card className="gx-card" title="Horizontal Login Form">
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
              rules: [{required: true, message: 'Please enter your Password!'}],
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
            <span className="gx-link login-form-forgot">Forgot password</span>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Log in
            </Button>
            Or <span className="gx-link">register now!</span>
          </FormItem>
        </Form>

        {loader && (
          <div className="gx-loader-view">
            <CircularProgress />
          </div>
        )}
        {showMessage && message.error(alertMessage)}
      </Card>
    )
  }
}

const WrappedNormalLoginForm = Form.create()(HorizontalLoginForm)
const mapStateToProps = ({auth}) => {
  const {loader, alertMessage, showMessage, authUser} = auth
  return {loader, alertMessage, showMessage, authUser}
}

export default connect(mapStateToProps, {
  userSignIn,
  hideMessage,
  showAuthLoader,
})(WrappedNormalLoginForm)
