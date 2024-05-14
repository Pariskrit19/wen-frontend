import React, {useState} from 'react'
import '@ant-design/compatible/assets/index.css'
import {DatePicker, Input, Select, Card, Button, Form, Spin} from 'antd'
import DragAndDropFile from 'components/Modules/DragAndDropFile'
import moment from 'moment'
import './style.css'
import {signUp} from 'services/users/userDetails'
import {handleResponse} from 'helpers/utils'
import {useNavigate, useParams} from 'react-router-dom'
import {SIGNIN} from 'helpers/routePath'
import {disabledAfterToday} from 'util/antDatePickerDisabled'
import {officeDomain} from 'constants/OfficeDomain'
import {emailRegex} from 'constants/EmailTest'
import {ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage'
import {storage} from 'firebase'
import RoleAccess from 'constants/RoleAccess'
import {socket} from 'pages/Main'

const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    xs: {span: 8},
    sm: {span: 8},
  },
  wrapperCol: {
    xs: {span: 16},
    sm: {span: 16},
  },
}

function InviteUserSignup(props) {
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const params = useParams()

  const [form] = Form.useForm()

  const handleFormSubmit = (e) => {
    form
      .validateFields()
      .then(async (values) => {
        setIsLoading(true)
        let usernameArr = values?.emails?.split('@')[0].split('.')
        let username = usernameArr?.[1] + usernameArr?.[0]

        let updatedUser = {
          ...values,
          email: values?.emails?.trim(),
          password: values?.passwords,
          dob: moment.utc(values.dob._d).format(),
          joinDate: moment.utc(values.joinDate._d).format(),
          primaryPhone: +values.primaryPhone,
          secondaryPhone: values.secondaryPhone && +values.secondaryPhone,
          username,
        }

        //upload image
        if (files[0]?.originFileObj) {
          const storageRef = ref(
            storage,
            `profile/${files[0]?.originFileObj?.name}`
          )
          let uploadTask = uploadBytesResumable(
            storageRef,
            files[0]?.originFileObj
          )

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // const pg = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              // setProgress(() => pg);
            },
            (error) => {
              // Handle unsuccessful uploads
              setIsLoading(false)
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                updatedUser = {
                  ...updatedUser,
                  photoURL: downloadURL,
                }

                signUp(updatedUser, params?.token)
                  .then((response) => {
                    handleResponse(
                      response,
                      'Sign up successfull',
                      'Could not sign up',
                      [
                        () => {
                          socket.emit('signup-user', {
                            showTo: [
                              RoleAccess.Admin,
                              RoleAccess.HumanResource,
                            ],
                            remarks: `${response.data?.data?.user?.name} has signed up.`,
                            module: 'User',
                          })
                        },
                        () => navigate(`/${SIGNIN}`),
                        () => setIsLoading(false),
                      ]
                    )
                  })
                  .catch((error) => {
                    setIsLoading(false)
                  })
              })
            }
          )
        } else {
          const response = await signUp(updatedUser, params?.token)

          handleResponse(response, 'Sign up successfull', 'Could not sign up', [
            () => {
              socket.emit('signup-user', {
                showTo: [RoleAccess.Admin, RoleAccess.HumanResource],
                remarks: `${response.data?.data?.user?.name} has signed up.`,
                module: 'User',
              })
            },
            () => navigate(`/${SIGNIN}`),
            () => setIsLoading(false),
          ])
        }
      })
      .catch((err) => {
        setIsLoading(false)
      })
  }

  return (
    <div className="signup-wrapper">
      <div className="gx-app-login-container">
        <Card className="gx-card" title="Sign Up">
          <Spin spinning={isLoading}>
            <Form onFinish={handleFormSubmit} form={form}>
              <FormItem
                {...formItemLayout}
                label="Name"
                hasFeedback
                name="name"
                rules={[
                  {
                    required: true,
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject('Name is required.')
                      }
                      const regex = /^[A-Za-z ]+$/
                      const isValid = regex.test(value)
                      if (value.trim().length === 0) {
                        return Promise.reject('Contains whitespaces only')
                      }

                      if (!isValid) {
                        return Promise.reject('Please enter a valid name.')
                      } else {
                        return Promise.resolve()
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="Enter Name" />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="Email"
                hasFeedback
                name="emails"
                rules={[
                  {
                    required: true,
                    validator: async (rule, value) => {
                      try {
                        if (!value) throw new Error('Email is required.')
                        if (!emailRegex.test(value.trim())) {
                          throw new Error('Please enter a valid email.')
                        }

                        if (value.split('@')[1]?.trim() !== officeDomain) {
                          throw new Error(
                            'Please use the email provided by office.'
                          )
                        }
                      } catch (err) {
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="Enter Email" />
              </FormItem>
              <FormItem {...formItemLayout} label="Profile Photo">
                <DragAndDropFile
                  files={files}
                  setFiles={setFiles}
                  displayType="picture-card"
                  allowMultiple={false}
                />
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="DOB"
                hasFeedback
                name="dob"
                rules={[
                  {
                    type: 'object',
                    required: true,
                    message: 'Date of Birth is required.',
                    whitespace: true,
                  },
                ]}
              >
                <DatePicker
                  className=" gx-w-100"
                  disabledDate={disabledAfterToday}
                />
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="Gender"
                hasFeedback
                name="gender"
                rules={[
                  {
                    required: true,
                    message: 'Gender is required.',
                    whitespace: true,
                  },
                ]}
              >
                <Select placeholder="Select Gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="Primary Phone"
                hasFeedback
                name="primaryPhone"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    validator: async (rule, value) => {
                      const mobileRegex = /(\+977)?[9][6-9]\d{8}$/
                      try {
                        if (!value) {
                          throw new Error(
                            'Phone number is required.(Enter numbers only)'
                          )
                        }
                        if (value < 0) {
                          throw new Error(
                            'Please do not enter negative numbers.'
                          )
                        }

                        if (value - Math.floor(value) !== 0) {
                          throw new Error('Please do not enter decimal values.')
                        }
                        if (
                          !mobileRegex.test(value) ||
                          value.toString().length > 10
                        ) {
                          throw new Error('Not a Valid Phone Number')
                        }
                      } catch (err) {
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="Enter Primary Phone" type="number" />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="Secondary Phone"
                name="secondaryPhone"
                rules={[
                  {
                    whitespace: true,
                    validator: async (rule, value) => {
                      const mobileRegex =
                        /(?:\(?\+977\)?)?[9][6-9]\d{8}|01[-]?[0-9]{7}/
                      try {
                        if (!value) {
                          return
                        }
                        if (value < 0) {
                          throw new Error(
                            'Please do not enter negative numbers.'
                          )
                        }

                        if (value - Math.floor(value) !== 0) {
                          throw new Error('Please do not enter decimal values.')
                        }

                        if (
                          !mobileRegex.test(value) ||
                          value.toString().length > 10
                        ) {
                          throw new Error('Not a Valid Phone Number')
                        }
                      } catch (err) {
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="Enter Secondary Phone" type="number" />
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="Join Date"
                hasFeedback
                name="joinDate"
                rules={[
                  {
                    type: 'object',
                    required: true,
                    message: 'Join Date is required.',
                    whitespace: true,
                  },
                ]}
              >
                <DatePicker
                  className=" gx-w-100"
                  disabledDate={disabledAfterToday}
                />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="Marital Status"
                hasFeedback
                name="maritalStatus"
                rules={[
                  {
                    required: true,
                    message: 'Marital Status is required.',
                    whitespace: true,
                  },
                ]}
              >
                <Select placeholder="Select Marital Status">
                  <Option value="Married">Married</Option>
                  <Option value="Unmarried">Unmarried</Option>
                </Select>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="Password"
                hasFeedback
                name="passwords"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your password!',
                  },
                  {min: 8, message: 'Must be atleast 8 characters'},
                ]}
              >
                <Input.Password placeholder="Password" />
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="Confirm Password"
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
                      if (form.getFieldValue('passwords') === val || !val) {
                        return Promise.resolve()
                      } else {
                        return Promise.reject('Must match Password')
                      }
                    },
                  },
                ]}
              >
                <Input.Password placeholder="Retype Password" />
              </FormItem>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Sign Up
              </Button>
            </Form>
          </Spin>
        </Card>
      </div>
    </div>
  )
}

// const SignupForm = Form.create()(InviteUserSignup);

export default InviteUserSignup
