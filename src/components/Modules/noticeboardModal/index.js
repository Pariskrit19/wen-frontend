import {useQuery} from '@tanstack/react-query'
import {
  Button,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  TimePicker,
  Form,
} from 'antd'
import moment from 'moment'
import {useEffect} from 'react'
import {filterOptions} from 'helpers/utils'
import {disabledBeforeToday} from 'util/antDatePickerDisabled'
import {emptyText} from 'constants/EmptySearchAntd'
import {getNoticeboardTypes} from 'services/settings/noticeBoard'
import {CANCEL_TEXT} from 'constants/Common'
import DragAndDropFile from '../DragAndDropFile'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import {storage} from 'firebase'

const FormItem = Form.Item
const {TextArea} = Input

function NoticeModal({
  toggle,
  onClose,
  types,
  statuses,
  onSubmit,
  initialValues,
  readOnly = false,
  loading = false,
  isEditMode = false,
  files,
  setFiles,
  setDeletedFile,
  deletedFile,
  setLoading,
}) {
  const noticeTypesQuery = useQuery(['noticeTypes'], getNoticeboardTypes, {
    enabled: false,
  })

  const [form] = Form.useForm()

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      let intermediate = values
      if (deletedFile) {
        const imageRef = ref(storage, deletedFile)
        await deleteObject(imageRef)
        intermediate = {
          ...values,
          image: null,
        }
      }

      setLoading(true)

      if (files[0]?.originFileObj) {
        const storageRef = ref(
          storage,
          `notice/${files[0]?.originFileObj?.name}`
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
            // setIsLoading(false)
            setLoading(false)
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              onSubmit({
                ...values,
                image: {
                  url: downloadURL,
                  name: `notice/${files[0]?.originFileObj?.name}`,
                },
              })
            })
          }
        )
      } else {
        onSubmit(intermediate, noticeTypesQuery?.data?.data?.data?.data)
      }
    })
  }
  const dateFormat = 'YYYY/MM/DD'

  useEffect(() => {
    if (toggle) {
      noticeTypesQuery.refetch()
      if (isEditMode) {
        form.setFieldsValue({
          title: initialValues?.title,
          details: initialValues?.details,
          noticeType: initialValues?.categoryId,
          startDate: initialValues?.startDate
            ? moment(initialValues?.startDate)
            : null,
          endDate: initialValues?.endDate
            ? moment(initialValues?.endDate)
            : null,
          startTime: initialValues?.startTime
            ? moment(initialValues?.startTime)
            : null,
          endTime: initialValues?.endTime
            ? moment(initialValues?.endTime)
            : null,
        })
        if (initialValues?.image?.url) {
          setFiles([{...initialValues?.image, uid: 1}])
        }
      }
    }
    if (!toggle) form.resetFields()
  }, [toggle])

  return (
    <Modal
      width={900}
      title={readOnly ? 'Notice' : isEditMode ? 'Update Notice' : 'Add Notice'}
      visible={toggle}
      onOk={handleSubmit}
      onCancel={handleCancel}
      mask={false}
      footer={
        readOnly
          ? [
              <Button key="back" onClick={handleCancel}>
                {CANCEL_TEXT}
              </Button>,
            ]
          : [
              <Button key="back" onClick={handleCancel}>
                Close
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                Submit
              </Button>,
            ]
      }
    >
      <Spin spinning={loading}>
        <Form layout="vertical" form={form} className="noticeboard-style">
          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="Title"
                hasFeedback={readOnly ? false : true}
                name="title"
                rules={[
                  {
                    required: true,
                    validator: async (rule, value) => {
                      try {
                        if (!value) {
                          throw new Error('Title is required.')
                        }
                        if (value?.trim() === '') {
                          throw new Error('Please enter a valid title.')
                        }
                      } catch (err) {
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="Enter Title" disabled={readOnly} />
              </FormItem>
            </Col>

            <Col span={24} sm={12}>
              <FormItem
                label="Category"
                hasFeedback={readOnly ? false : true}
                name="noticeType"
                rules={[
                  {
                    required: true,
                    validator: async (rule, value) => {
                      try {
                        if (!value) {
                          throw new Error('Category is required.')
                        }
                        if (value?.trim() === '') {
                          throw new Error('Please enter a valid category.')
                        }
                      } catch (err) {
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <Select
                  notFoundContent={emptyText}
                  showSearch
                  filterOption={filterOptions}
                  placeholder="Select Category"
                  disabled={readOnly}
                >
                  {noticeTypesQuery.data &&
                    noticeTypesQuery?.data?.data?.data?.data?.map((tag) => (
                      <Select.Option value={tag._id} key={tag._id}>
                        {tag.name}
                      </Select.Option>
                    ))}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="Start Date"
                hasFeedback={readOnly ? false : true}
                name="startDate"
                rules={[
                  {
                    required: true,
                    validator: async (rule, value) => {
                      try {
                        if (!value) {
                          throw new Error(`Start Date is required.`)
                        }
                        if (
                          form.getFieldValue('endDate') &&
                          !moment(value.startOf('day')).isSameOrBefore(
                            moment(
                              form.getFieldValue('endDate')?.startOf('day')
                            )
                          )
                        ) {
                          throw new Error(
                            'Start Date should be before End Date'
                          )
                        }
                      } catch (err) {
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <DatePicker
                  onChange={() => {
                    if (form.getFieldValue('endDate')) {
                      form.validateFields(['endDate'])
                    }
                  }}
                  className=" gx-w-100"
                  disabled={readOnly}
                  format={dateFormat}
                  disabledDate={disabledBeforeToday}
                />
              </FormItem>
            </Col>
            <Col span={24} sm={12}>
              <FormItem
                label="End Date"
                hasFeedback={readOnly ? false : true}
                name="endDate"
                rules={[
                  {required: true, message: 'End Date is required.'},
                  ({getFieldValue}) => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.resolve()
                      }

                      if (
                        getFieldValue('startDate') &&
                        moment(value)
                          .endOf('day')
                          .isBefore(getFieldValue('startDate'))
                      ) {
                        return Promise.reject(
                          new Error('End Date should be after Start Date.')
                        )
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <DatePicker
                  onChange={() => {
                    if (form.getFieldValue('startDate')) {
                      form.validateFields(['startDate'])
                    }
                  }}
                  className=" gx-w-100"
                  disabled={readOnly}
                  format={dateFormat}
                  disabledDate={disabledBeforeToday}
                />
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={12}>
              <FormItem
                label="Start Time"
                hasFeedback={readOnly ? false : true}
                name="startTime"
                rules={[
                  ({getFieldValue}) => {
                    let sameDate =
                      moment(getFieldValue('startDate')).format(dateFormat) ===
                      moment(getFieldValue('endDate')).format(dateFormat)
                    return {
                      validator(_, value) {
                        if (!value && !getFieldValue('endTime')) {
                          return Promise.resolve()
                        }

                        if (sameDate && value && getFieldValue('endTime')) {
                          if (!value.isBefore(getFieldValue('endTime'))) {
                            return Promise.reject(
                              new Error('End Time should not exceed Start Time')
                            )
                          }
                        }

                        if (!value && getFieldValue('endTime')) {
                          return Promise.reject(
                            new Error('Only End Time is not allowed')
                          )
                        }

                        return Promise.resolve()
                      },
                    }
                  },
                ]}
              >
                <TimePicker className=" gx-w-100" disabled={readOnly} />
              </FormItem>
            </Col>
            <Col span={24} sm={12}>
              <FormItem
                label="End Time"
                hasFeedback={readOnly ? false : true}
                name="endTime"
                rules={[
                  ({getFieldValue}) => {
                    let sameDate =
                      moment(getFieldValue('startDate')).format(dateFormat) ===
                      moment(getFieldValue('endDate')).format(dateFormat)

                    return {
                      validator(_, value) {
                        if (!value && !getFieldValue('startTime')) {
                          return Promise.resolve()
                        }

                        if (sameDate && value && getFieldValue('startTime')) {
                          if (value.isBefore(getFieldValue('startTime'))) {
                            return Promise.reject(
                              new Error('End Time should not exceed Start Time')
                            )
                          }
                        }
                        if (getFieldValue('startTime') && !value) {
                          return Promise.reject(
                            new Error('Only Start Time is not allowed')
                          )
                        }

                        return Promise.resolve()
                      },
                    }
                  },
                ]}
              >
                <TimePicker className=" gx-w-100" disabled={readOnly} />
              </FormItem>
            </Col>
          </Row>
          <Row type="flex">
            <Col span={24} sm={24}>
              <FormItem
                label="Details"
                hasFeedback={readOnly ? false : true}
                name="details"
                rules={[
                  {
                    required: true,
                    validator: async (rule, value) => {
                      try {
                        if (!value) {
                          throw new Error('Some detail is required.')
                        }
                        if (value?.trim() === '') {
                          throw new Error('Please enter valid details.')
                        }
                        if (value?.trim()?.length < 10) {
                          throw new Error(
                            'Detail must at least consist 10 characters.'
                          )
                        }
                      } catch (err) {
                        throw new Error(err.message)
                      }
                    },
                  },
                ]}
              >
                <TextArea
                  placeholder="Enter Details"
                  rows={5}
                  disabled={readOnly}
                />
              </FormItem>
            </Col>
          </Row>

          <Row type="flex">
            <Col span={24} sm={24}>
              <FormItem label="Select Image to Upload" name="leaveDocument">
                <div id="dg-eye">
                  <DragAndDropFile
                    files={files}
                    onRemove={setDeletedFile}
                    setFiles={setFiles}
                    allowMultiple={false}
                    displayType="picture-card"
                    accept="image/png, image/jpeg"
                    isEditMode={isEditMode}
                    readOnly={readOnly}
                  />
                </div>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  )
}

export default NoticeModal
