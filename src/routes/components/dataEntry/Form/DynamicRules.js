import React, {Component} from 'react'
import {Form} from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import {Button, Card, Checkbox, Input} from 'antd'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {xs: 24, sm: 6},
  wrapperCol: {xs: 24, sm: 14},
}
const formTailLayout = {
  labelCol: {xs: 24, sm: 6},
  wrapperCol: {xs: 24, sm: {span: 14, offset: 6}},
}

class DynamicRules extends Component {
  state = {
    checkNick: false,
  }
  check = () => {
    this.props.form.validateFields((err) => {
      if (!err) {
        console.info('success')
      }
    })
  }
  handleChange = (e) => {
    this.setState(
      {
        checkNick: e.target.checked,
      },
      () => {
        this.props.form.validateFields(['nickname'], {force: true})
      }
    )
  }

  render() {
    const {getFieldDecorator} = this.props.form
    return (
      <Card className="gx-card" title="Dynamic Rules">
        <Form>
          <FormItem {...formItemLayout} label="Name">
            {getFieldDecorator('username', {
              rules: [
                {
                  required: true,
                  message: 'Please enter your name',
                },
              ],
            })(<Input placeholder="Please enter your name" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="Nickname">
            {getFieldDecorator('nickname-1', {
              rules: [
                {
                  required: this.state.checkNick,
                  message: 'Please enter your nickname',
                },
              ],
            })(<Input placeholder="Please enter your nickname" />)}
          </FormItem>
          <FormItem {...formTailLayout}>
            <Checkbox value={this.state.checkNick} onChange={this.handleChange}>
              Nickname is required
            </Checkbox>
          </FormItem>
          <FormItem {...formTailLayout}>
            <Button type="primary" onClick={this.check}>
              Check
            </Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
}

const WrappedDynamicRule = Form.create()(DynamicRules)

export default WrappedDynamicRule
