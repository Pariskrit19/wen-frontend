import {Button, Form, Input, Modal, Spin} from 'antd'
import {CANCEL_TEXT} from 'constants/Common'
import React, {useEffect} from 'react'

interface modalInterface {
  isEditMode: boolean
  toggle: boolean
  onSubmit: (input: {title: string; content: string}) => void
  onCancel: React.MouseEventHandler<HTMLElement>
  type: string
  isLoading: boolean
  editData: any
}

const layout = {
  // labelCol: { span: 8 },
  // wrapperCol: { span: 16 }
}

function CommonResourceModal({
  isEditMode,
  toggle,
  onSubmit,
  onCancel,
  type,
  isLoading,
  editData,
}: modalInterface) {
  const [form] = Form.useForm()
  const {TextArea} = Input

  const handleSubmit = () => {
    form.validateFields().then((values) => onSubmit(values))
  }

  useEffect(() => {
    if (toggle) {
      if (isEditMode) {
        form.setFieldValue('title', editData?.title)
        form.setFieldValue('content', editData?.content)
      }
    }
    if (!toggle) form.resetFields()
  }, [toggle])
  return (
    <Modal
      title={isEditMode ? `Update ${type}` : `Add ${type}`}
      visible={toggle}
      onOk={handleSubmit}
      mask={false}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
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
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                whitespace: true,
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
            <Input
              // value={editData?.title ?? ""}
              placeholder={`Enter ${type} Name`}
              // onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="Description"
            rules={[
              {
                required: true,
                whitespace: true,
                validator: async (rule, value) => {
                  try {
                    if (!value) {
                      throw new Error('Description is required.')
                    }
                    if (value?.trim() === '') {
                      throw new Error('Please enter a valid description.')
                    }
                    if (value?.trim()?.length < 10) {
                      throw new Error(
                        'Description should contain at least 10 characters.'
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
              placeholder={`Enter ${type} Description`}
              rows={10}
              //   value={editData?.content ?? ''}
            />
            {/* // value={input}
							placeholder={type}
							// onChange={handleInputChange}
						/> */}
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  )
}

export default CommonResourceModal
