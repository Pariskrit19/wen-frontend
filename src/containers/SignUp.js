import React from 'react'
import {Form} from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import {Button, Checkbox, Input} from 'antd'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import {hideMessage, showAuthLoader, userSignUp} from 'appRedux/actions/Auth'
import IntlMessages from 'util/IntlMessages'
import {message} from 'antd/lib/index'
import CircularProgress from 'components/Elements/CircularProgress/index'

const FormItem = Form.Item

class SignUp extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      values = {...values,email:values.email.trim()}
      if (!err) {
        this.props.showAuthLoader()
        this.props.userSignUp(values)
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

  componentDidUpdate() {
    if (this.props.showMessage) {
      setTimeout(() => {
        this.props.hideMessage()
      }, 100)
    }
    if (this.props.authUser !== null) {
      this?.props?.history?.push('/')
    }
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const {showMessage, loader, alertMessage} = this.props
    return (
      <div className="gx-app-login-wrap">
        <div className="gx-app-login-container">
          <div className="gx-app-login-main-content">
            <div className="gx-app-logo-content">
              <div className="gx-app-logo-content-bg">
                <img
                  src="https://images.unsplash.com/photo-1658989236602-8f6a443a904d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80"
                  alt="Neature"
                />
              </div>
              <div className="gx-app-logo-wid">
                <h1>
                  <IntlMessages id="app.userAuth.signUp" />
                </h1>
                <p>
                  <IntlMessages id="app.userAuth.bySigning" />
                </p>
                <p>
                  <IntlMessages id="app.userAuth.getAccount" />
                </p>
              </div>
              <div className="gx-app-logo">
                <img alt="example" src={require('assets/images/wenlogo.png')} />
              </div>
            </div>

            <div className="gx-app-login-content">
              <Form
                onSubmit={this.handleSubmit}
                className="gx-signup-form gx-form-row0"
              >
                <FormItem>
                  {getFieldDecorator('userName', {
                    rules: [
                      {required: true, message: 'Please enter your username!'},
                    ],
                  })(<Input placeholder="Username" />)}
                </FormItem>

                <FormItem>
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        required: true,
                        type: 'email',
                        message: 'Please enter a valid E-mail!',
                      },
                    ],
                  })(<Input placeholder="Email" />)}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('password', {
                    rules: [
                      {required: true, message: 'Please enter your Password!'},
                    ],
                  })(<Input type="password" placeholder="Password" />)}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('remember', {
                    valuePropName: 'checked',
                    initialValue: true,
                  })(
                    <Checkbox>
                      <IntlMessages id="appModule.iAccept" />
                    </Checkbox>
                  )}
                  <span className="gx-link gx-signup-form-forgot">
                    <IntlMessages id="appModule.termAndCondition" />
                  </span>
                </FormItem>
                <FormItem>
                  <Button type="primary" className="gx-mb-0" htmlType="submit">
                    <IntlMessages id="app.userAuth.signUp" />
                  </Button>
                  <span>
                    <IntlMessages id="app.userAuth.or" />
                  </span>{' '}
                  <Link to="/signin">
                    <IntlMessages id="app.userAuth.signIn" />
                  </Link>
                </FormItem>
              </Form>
            </div>
            {loader && (
              <div className="gx-loader-view">
                <CircularProgress />
              </div>
            )}
            {showMessage && message.error(alertMessage)}
          </div>
        </div>
      </div>
    )
  }
}

const WrappedSignUpForm = Form.create()(SignUp)

const mapStateToProps = ({auth}) => {
  const {loader, alertMessage, showMessage, authUser} = auth
  return {loader, alertMessage, showMessage, authUser}
}

export default connect(mapStateToProps, {
  userSignUp,
  hideMessage,
  showAuthLoader,
})(WrappedSignUpForm)
