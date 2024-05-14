import {Button, Form, Input, Modal, Spin, Typography} from 'antd'
import {CANCEL_TEXT} from 'constants/Common'
import React, {useEffect, useState} from 'react'
import {Checkbox} from 'antd'
import type {CheckboxValueType} from 'antd/es/checkbox/Group'
import type {CheckboxChangeEvent} from 'antd/es/checkbox'
import type {RadioChangeEvent} from 'antd'
import {Radio} from 'antd'
import {SickCasualLeaves} from 'constants/LeaveTypes'

interface modalInterface {
  isEditMode: boolean
  toggle: boolean
  currentData: any
  duplicateValue: boolean
  setDuplicateValue: (a: boolean) => void
  onSubmit: (leave: {
    name: string
    leaveDays: string
    gender: Array<string>
    Probation: Boolean
    IsSpecial: Boolean
  }) => void
  onCancel: (setDuplicateValue: any) => void
  isLoading: boolean
  editData: any
}

interface GenderCheckInterface {
  label: string
  value: string
}

function LeaveModal({
  isEditMode,
  toggle,
  currentData,
  onSubmit,
  duplicateValue,
  setDuplicateValue,
  onCancel,
  isLoading,
  editData,
}: modalInterface) {
  const [form] = Form.useForm()

  const [nameChanged, setNameChanged] = useState<boolean | undefined>()
  const [genderDefault, setgenderDefault] = useState<CheckboxValueType[]>([
    'Male',
    'Female',
  ])
  const [IsSpecial, setIsSpecial] = useState<boolean>(false)
  const [probationStatus, setProbationStatus] = useState<boolean>(false)
  const [isgenderEmpty, setgenderEmpty] = useState<boolean>(false)

  const GenderCheckboxOptions: GenderCheckInterface[] = [
    {
      label: 'Male',
      value: 'Male',
    },
    {
      label: 'Female',
      value: 'Female',
    },
  ]

  const handleGenderCheckboxChange = (checkedValues: CheckboxValueType[]) => {
    setgenderEmpty(false)
    setgenderDefault(checkedValues)
  }

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

  const onProbationChange = (e: RadioChangeEvent) => {
    setProbationStatus(e.target.value)
  }

  const handleSubmit = () => {
    form.validateFields()
    const availableData = currentData?.data?.data?.data?.map(
      (item: {id: any; name: any}) => item?.name?.toLowerCase()
    )
    if (
      !isEditMode &&
      availableData?.includes(form.getFieldValue('name')?.toLowerCase())
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
    if (genderDefault.length === 0) {
      setgenderEmpty(true)
      return
    }
    // console.log({...form.getFieldsValue(),gender:genderDefault,Probation:probationStatus})
    form.validateFields().then((values) =>
      onSubmit({
        ...form.getFieldsValue(),
        gender: genderDefault,
        Probation: probationStatus,
        isSpecial: IsSpecial,
      })
    )
  }

  useEffect(() => {
    if (toggle) {
      if (isEditMode) {
        form.setFieldsValue({
          name: editData?.name,
          leaveDays: editData?.leaveDays,
        })
        setgenderDefault(editData?.gender)
        setProbationStatus(editData?.Probation)
        setIsSpecial(editData?.isSpecial)
      }
    }
    if (!toggle) form.resetFields()
  }, [toggle])
  return (
    <Modal
      title={isEditMode ? `Update Leave Type` : `Add Leave Type`}
      visible={toggle}
      onOk={handleSubmit}
      onCancel={() => {
        setNameChanged(undefined)
        onCancel(setDuplicateValue)
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            setNameChanged(undefined)
            onCancel(setDuplicateValue)
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
          form={form}
          name="control-hooks"
          layout="vertical"
          onValuesChange={(allValues) => formFieldChanges(allValues)}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                whitespace: true,
                validator: async (rule, value) => {
                  try {
                    if (!value) {
                      throw new Error('Leave name is required.')
                    }
                    if (value?.trim() === '') {
                      throw new Error('Please enter a valid name.')
                    }
                    if (value?.trim()?.length > 100) {
                      throw new Error(
                        'Leave name cannot exceed more than 100 characters'
                      )
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
              placeholder="Name"
              // onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item
            name="leaveDays"
            label="Leave Days"
            rules={[
              {
                required: true,
                validator: async (rule, value) => {
                  try {
                    if (!value)
                      throw new Error('Number of leave days is required.')
                    if (value < 0) {
                      throw new Error('Leave Days cannot be negative.')
                    }
                    if (value < 1) {
                      throw new Error('At least 1 leave day is required.')
                    }
                    if (value - Math.floor(value) !== 0) {
                      throw new Error('Leave Days cannot be decimal.')
                    }
                    if (value > 365) {
                      throw new Error(
                        'Number of leave days cannot exceed 365 days.'
                      )
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
              placeholder="Leave days"
              type="number"
              min={1}
              // onChange={handleInputChange}
            />
          </Form.Item>

          <Form.Item label="Gender" required>
            <Checkbox.Group
              options={GenderCheckboxOptions}
              onChange={handleGenderCheckboxChange}
              value={genderDefault}
            />
          </Form.Item>

          {isgenderEmpty && <p style={{color: 'red'}}>Gender is required.</p>}

          <Form.Item label="Probation" required>
            <Radio.Group onChange={onProbationChange} value={probationStatus}>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>

          <Checkbox
            checked={IsSpecial}
            onChange={(e: CheckboxChangeEvent) =>
              setIsSpecial(e.target.checked)
            }
          >
            Special Leave Type
          </Checkbox>

          {duplicateValue && (
            <p style={{color: 'red'}}>Duplicate names cannot be accepted.</p>
          )}
        </Form>
      </Spin>
    </Modal>
  )
}

export default LeaveModal
