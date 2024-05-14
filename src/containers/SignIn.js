import React, {useEffect, useRef} from 'react'
// import "@ant-design/compatible/assets/index.css";
import {Button, Input, Form} from 'antd'
import {connect} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {hideMessage, showAuthLoader, userSignIn} from 'appRedux/actions/Auth'
import IntlMessages from 'util/IntlMessages'
import {FORGOT_PASSWORD} from 'helpers/routePath'
import signInBackground from 'assets/images/signInImage.jpg'
import {notification} from 'helpers/notification'

const FormItem = Form.Item

function SignIn(props) {
  const navigate = useNavigate()
  const offlineRef = useRef(true)

  const handleSubmit = (values) => {
    values = {
      ...values,
      email: values.emails.trim().toLowerCase(),
      password: values?.passwords,
    }

    props.showAuthLoader()
    props.userSignIn(values)
  }

  useEffect(() => {
    if (props.showMessage) {
      setTimeout(() => {
        props.hideMessage()
      }, 100)
    }
    if (props.authUser !== null) {
      navigate('/dashboard')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.authUser, props.showMessage, navigate])

  useEffect(() => {
    const getOfflineStatus = () => {
      offlineRef.current = !offlineRef.current
    }
    window.addEventListener('offline', getOfflineStatus)
    window.addEventListener('online', getOfflineStatus)

    return () => {
      window.removeEventListener('offline', getOfflineStatus)
      window.removeEventListener('online', getOfflineStatus)
    }
  }, [])

  const {showMessage, showLoader, alertMessage} = props

  return (
    <div className="gx-app-login-wrap">
      <div className="gx-app-login-container">
        <div className="gx-app-login-main-content">
          <div className="gx-app-logo-content">
            <div className="gx-app-logo-content-bg">
              <img
                src={signInBackground}
                alt="Neature"
                style={{opacity: '0.3'}}
              />
            </div>
            <div className="gx-app-logo-wid">
              <h1>
                <IntlMessages id="app.userAuth.signIn" />
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
              onFinish={handleSubmit}
              className="gx-signin-form gx-form-row0"
              layout="vertical"
              autoComplete="off"
            >
              <FormItem
                label="Username or Email Address"
                hasFeedback
                name="emails"
                rules={[
                  {
                    required: true,
                    validator: async (rule, value) => {
                      try {
                        if (!value)
                          throw new Error(
                            'Please enter your email or username!'
                          )
                      } catch (err) {
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Input className="ant-input-email" />
              </FormItem>
              <FormItem
                label="Password"
                hasFeedback
                name="passwords"
                rules={[
                  {required: true, message: 'Please enter your Password!'},
                ]}
              >
                <Input.Password />
              </FormItem>
              <FormItem style={{marginTop: '-15px', marginBottom: '4px'}}>
                <span
                  className="gx-link"
                  onClick={() => navigate(`/${FORGOT_PASSWORD}`)}
                >
                  Forgot Password?
                </span>
              </FormItem>

              <FormItem>
                <Button
                  type="primary"
                  className="gx-mb-0"
                  htmlType="submit"
                  disabled={showLoader}
                >
                  {showLoader ? (
                    'Signing In...'
                  ) : (
                    <IntlMessages id="app.userAuth.signIn" />
                  )}
                </Button>
              </FormItem>

              <span className="gx-text-light gx-fs-sm">
                <a
                  href="https://www.webexpertsnepal.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @webexpertsnepal
                </a>
              </span>
            </Form>
          </div>

          {showMessage
            ? notification({
                message: offlineRef.current
                  ? alertMessage.toString()
                  : "You're offline. Check your internet connection",
                type: 'error',
                placement: 'top',
              })
            : null}
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = ({auth}) => {
  const {showLoader, alertMessage, showMessage, authUser} = auth
  return {showLoader, alertMessage, showMessage, authUser}
}

export default connect(mapStateToProps, {
  userSignIn,
  hideMessage,
  showAuthLoader,
})(SignIn)
