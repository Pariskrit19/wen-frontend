import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons'
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Spin,
  Table,
} from 'antd'

import {CANCEL_TEXT} from 'constants/Common'
import {notification} from 'helpers/notification'
import useWindowsSize from 'hooks/useWindowsSize'
import moment from 'moment'
import React, {useEffect, useState} from 'react'

interface modalType {
  dataSource: any
  isEditMode: boolean
  toggle: boolean
  onSubmit: (holiday: any) => void
  onCancel: React.MouseEventHandler<HTMLElement>
  isLoading: boolean
  editData: any
}

interface holidayType {
  date: string
  title: string
  remarks: string
}

const CommonModal = (props: modalType) => {
  const [form] = Form.useForm()
  const {
    isEditMode,
    toggle = true,
    onCancel,
    onSubmit,
    isLoading,
    editData,
    dataSource,
  } = props

  const [indexes, setIndexes] = useState<boolean[]>([])

  const {innerWidth} = useWindowsSize()

  const handleSubmit = () => {
    let values = form.getFieldsValue()
    let holidays = values?.holidays?.map(
      (data: {date: any; title: string; remarks: string}, index: number) => {
        if (data?.date || data?.title || data?.remarks) {
          return true
        } else return false
      }
    )
    if (holidays.length === 0) {
      return notification({type: 'info', message: 'Please Add Holiday Field'})
    }
    if (!holidays.includes(true)) {
      holidays[0] = true
    }
    setIndexes(holidays)
    form
      .validateFields()
      .then((values) => {
        onSubmit({
          holidays: form
            .getFieldsValue()
            .holidays.filter((holiday: holidayType) => holiday)
            .map((holiday: holidayType) => ({
              ...holiday,
              date: moment(holiday.date)?.format()?.split('T')?.[0],
            })),
        })
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    if (toggle) {
      if (isEditMode)
        form.setFieldsValue({
          holidays: editData?.map((holiday: any) => ({
            ...holiday,
            date: moment(holiday.date),
          })),
        })
    }
    if (!toggle) form.resetFields()
  }, [toggle])

  return (
    <Modal
      width={1200}
      bodyStyle={{overflowX: 'scroll'}}
      title={isEditMode ? `Update Holidays` : `Add Holidays`}
      className="gx-table-responsive"
      visible={toggle}
      onOk={handleSubmit}
      onCancel={onCancel}
      mask={false}
      footer={[
        <Button key="back" onClick={onCancel}>
          {CANCEL_TEXT}
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit
        </Button>,
      ]}
    >
      <Spin spinning={isLoading}>
        <Row
          style={{
            columnGap: 5,
            marginLeft: innerWidth <= 748 ? '' : '1rem',
            marginBottom: '0.4rem',
          }}
        >
          <Col lg={5} md={5} sm={5} xs={5}>
            <label>Date</label>
          </Col>
          <Col lg={7} md={6} sm={6} xs={5}>
            <label>Title</label>
          </Col>
          <Col lg={7} md={7} sm={7} xs={6}>
            <label>Remarks</label>
          </Col>
          <Col lg={4} md={5} sm={5} xs={5}>
            <label style={{whiteSpace: 'nowrap'}}>Allow Leave</label>
          </Col>
        </Row>
        <Form
          form={form}
          name="dynamic_form_nest_item"
          autoComplete="off"
          style={{marginLeft: 10}}
          className="add-holiday"
        >
          <Form.List
            name="holidays"
            initialValue={[
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
            ]}
          >
            {(fields, {add, remove}) => (
              <>
                {fields.map((field, index) => (
                  <Row
                    key={field.key}
                    style={{
                      columnGap: 8,
                      marginLeft: innerWidth <= 748 ? '' : '1rem',
                    }}
                  >
                    <Col span={5} sm={5} lg={5}>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, curValues) =>
                          prevValues.area !== curValues.area ||
                          prevValues.sights !== curValues.sights
                        }
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, 'date']}
                          required={false}
                          rules={[
                            {
                              required: indexes[index],
                              message: 'Date is required.',
                            },
                          ]}
                        >
                          <DatePicker className=" gx-w-100" />
                        </Form.Item>
                      </Form.Item>
                    </Col>
                    <Col span={5} sm={6} md={6} lg={7}>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, curValues) =>
                          prevValues.area !== curValues.area ||
                          prevValues.sights !== curValues.sights
                        }
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, 'title']}
                          required={false}
                          rules={[
                            {
                              required: indexes[index],
                              message: 'Title is required.',
                            },
                            {
                              whitespace: true,
                              message: 'Please enter a valid title',
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Form.Item>
                    </Col>
                    <Col span={5} sm={7} lg={7} md={7}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'remarks']}
                        // rules={[{ required: true, message: "required!" }]}
                      >
                        <Input.TextArea rows={1} />
                      </Form.Item>
                    </Col>
                    <Col span={2} sm={3} md={2} lg={2}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'allowLeaveApply']}
                        required={false}
                        valuePropName="checked"
                      >
                        <Checkbox style={{marginLeft: '2rem'}} />
                      </Form.Item>
                    </Col>

                    <Col span={2} sm={1} md={2} lg={2}>
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                        style={{marginBottom: 20, marginTop: 10}}
                        className="svg-clear"
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add More
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Spin>
    </Modal>
  )
}

export default CommonModal
