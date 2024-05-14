import {Button, Form, Input, Modal, Spin} from 'antd'
import {CANCEL_TEXT} from 'constants/Common'
import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'

interface modalInterface {
  toggle: boolean
  onSubmit: (name: string, value: string) => void
  onCancel: () => void
  type: string
  isLoading: boolean
}

const layout = {
  // labelCol: { span: 8 },
  // wrapperCol: { span: 16 }
}

function AttendanceModal({
  toggle,
  onSubmit,
  onCancel,
  type,
  isLoading,
}: modalInterface) {
  const [form] = Form.useForm()

  let category = ''

  if (type.includes('Late')) {
    category = 'lateArrivalThreshold'
  } else {
    category = 'officeHour'
  }
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => onSubmit(category, form.getFieldValue('name')))
  }

  const {lateArrivalThreshold, allocatedOfficeHours} = useSelector(
    (state: any) => state.configurations
  )

  if (type.includes('Late')) {
  }
  useEffect(() => {
    if (toggle) {
      if (type.includes('Late')) {
        form.setFieldValue('name', lateArrivalThreshold.toString())
      } else {
        form.setFieldValue('name', allocatedOfficeHours.toString())
      }
    }
    if (!toggle) form.resetFields()
  }, [toggle])
  return (
    <Modal
      title={`Update ${type}`}
      visible={toggle}
      onOk={handleSubmit}
      mask={false}
      onCancel={() => onCancel()}
      footer={[
        <Button key="back" onClick={() => onCancel()}>
          {CANCEL_TEXT}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          Submit
        </Button>,
      ]}
    >
      <Spin spinning={isLoading}>
        <Form {...layout} form={form} name="control-hooks" layout="vertical">
          <Form.Item
            name="name"
            label={`${type} ${
              category === 'lateArrivalThreshold' ? '(in minutes)' : ''
            }`}
            rules={[
              {
                required: true,
                validator: async (rule, value) => {
                  try {
                    if (!value) {
                      throw new Error(`${type} is required.`)
                    }
                    if (+value <= 0) {
                      throw new Error('Please enter a value greater than 0')
                    }
                    if (value?.trim() === '') {
                      throw new Error(`Please enter a valid ${type}.`)
                    }
                  } catch (err) {
                    throw new Error(err.message)
                  }
                },
              },
            ]}
          >
            <Input
              // value={input}
              placeholder={type}
              type="number"
              min={1}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  )
}

export default AttendanceModal
