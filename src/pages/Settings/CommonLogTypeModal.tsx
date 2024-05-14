import {Button, Form, Input, Modal, Spin} from 'antd'
import React, {useEffect, useState} from 'react'
import ColorPicker from './ColorPicker'
import {CANCEL_TEXT} from 'constants/Common'

interface modalInterface {
  isEditMode: boolean
  toggle: boolean
  currentData: any
  duplicateValue: boolean
  setDuplicateValue: (a: boolean) => void
  onSubmit: (name: string, color: string) => void
  onCancel: (setDuplicateValue: any, setHexCode: any) => void
  hexCode: string
  setHexCode: (a: string) => void
  displayColorPicker: boolean
  setDisplayColorPicker: (a: boolean) => void
  type: string
  isLoading: boolean
  editData: any
}

const layout = {
  // labelCol: { span: 8 },
  // wrapperCol: { span: 16 }
}

function CommonLogTypeModal({
  isEditMode,
  toggle,
  currentData,
  onSubmit,
  setDuplicateValue,
  duplicateValue,
  hexCode,
  displayColorPicker,
  setDisplayColorPicker,
  setHexCode,
  onCancel,
  type,
  isLoading,
  editData,
}: modalInterface) {
  const [form] = Form.useForm()

  const [nameChanged, setNameChanged] = useState<boolean | undefined>()

  const formFieldChanges = (values: {name?: string}) => {
    if (values?.hasOwnProperty('name')) {
      if (values?.name?.toLowerCase() === editData?.name?.toLowerCase()) {
        setNameChanged(false)
      } else if (values?.name === editData?.name) {
        setNameChanged(true)
      } else {
        setNameChanged(true)
      }
    }
  }

  const handleSubmit = () => {
    form.validateFields()
    let availableData
    if (currentData?.hasOwnProperty('data')) {
      availableData = currentData?.data?.data?.data?.map(
        (item: {id: any; name: any}) => item?.name?.toLowerCase()
      )
    } else {
      availableData = currentData.map((item: {id: any; name: any}) =>
        item?.name?.toLowerCase()
      )
    }
    if (
      !isEditMode &&
      availableData?.includes(form.getFieldValue('name').toLowerCase())
    ) {
      setDuplicateValue(true)
      return
    }
    if (
      isEditMode &&
      nameChanged &&
      availableData
        ?.filter(
          (item: string) =>
            item?.toLowerCase() !== editData?.name?.toLowerCase()
        )
        ?.includes(form.getFieldValue('name').toLowerCase())
    ) {
      setDuplicateValue(true)
      return
    }
    if (
      isEditMode &&
      nameChanged === false &&
      editData?.name !== form.getFieldValue('name') &&
      availableData?.includes(form.getFieldValue('name').toLowerCase())
    ) {
      setDuplicateValue(true)
      return
    }
    form
      .validateFields()
      .then((values) =>
        onSubmit(form.getFieldValue('name'), form.getFieldValue('color'))
      )
  }

  useEffect(() => {
    if (toggle) {
      if (isEditMode) {
        form.setFieldValue('name', editData?.name)
        form.setFieldValue('color', editData?.color)
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
      onCancel={() => {
        setNameChanged(undefined)
        onCancel(setDuplicateValue, setHexCode)
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            setNameChanged(undefined)
            onCancel(setDuplicateValue, setHexCode)
          }}
        >
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
        <Form
          {...layout}
          form={form}
          name="control-hooks"
          layout="vertical"
          onValuesChange={(allValues) => formFieldChanges(allValues)}
        >
          <Form.Item
            name="name"
            label={type}
            rules={[
              {
                required: true,
                validator: async (rule, value) => {
                  try {
                    if (!value) {
                      throw new Error(`${type} is required.`)
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
            <Input placeholder={type} />
          </Form.Item>
          <Form.Item
            name="color"
            label="Select Color"
            rules={[
              {required: true, message: 'Color for log type is required.'},
            ]}
          >
            <Input
              value={hexCode ? hexCode : undefined}
              placeholder="Log Color"
              onClick={() => setDisplayColorPicker(false)}
              suffix={
                <ColorPicker
                  form={form}
                  editData={editData}
                  displayColorPicker={displayColorPicker}
                  setDisplayColorPicker={setDisplayColorPicker}
                />
              }
            />
          </Form.Item>

          {duplicateValue && (
            <p style={{color: 'red'}}>Duplicate names cannot be accepted.</p>
          )}
        </Form>
      </Spin>
    </Modal>
  )
}

export default CommonLogTypeModal
