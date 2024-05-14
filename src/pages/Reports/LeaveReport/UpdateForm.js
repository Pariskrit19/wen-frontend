import {Button, Form, Input, Spin} from 'antd'
import React, {useEffect} from 'react'

function UpdateForm({title, handleSubmit, initialValue, name, loading}) {
  const [form] = Form.useForm()
  const FormItem = Form.Item

  const submitForm = () => {
    form.validateFields().then((values) => {
      handleSubmit(values)
    })
  }

  useEffect(() => {
    form.setFieldValue('input', initialValue ?? '0')
  }, [])

  return (
    <Spin spinning={loading}>
      <Form form={form} layout="vertical">
        <FormItem
          hasFeedback
          label={`${title} of ${name}`}
          name="input"
          rules={[
            {
              required: true,
              validator: async (rule, val) => {
                try {
                  if (!val) {
                    throw new Error(`${title} cannot be empty.`)
                  }
                  if (val < 0) {
                    throw new Error(`Please enter a value greater than 0.`)
                  }
                } catch (err) {
                  throw new Error(err.message)
                }
              },
            },
          ]}
        >
          <Input placeholder={`Update ${title}`} type="number" min={0} />
        </FormItem>
      </Form>
      <Button
        type="submit"
        className="gx-btn gx-btn-primary gx-text-white"
        onClick={submitForm}
      >
        Submit
      </Button>
    </Spin>
  )
}

export default UpdateForm
