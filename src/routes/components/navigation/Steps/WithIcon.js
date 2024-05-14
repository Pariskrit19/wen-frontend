import React from 'react'
import {
  LoadingOutlined,
  SmileOutlined,
  SolutionOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {Card, Steps} from 'antd'

const Step = Steps.Step

const WithIcon = () => {
  return (
    <Card className="gx-card" title="With Icon">
      <Steps>
        <Step status="finish" title="Login" icon={<UserOutlined />} />
        <Step
          status="finish"
          title="Verification"
          icon={<SolutionOutlined />}
        />
        <Step status="process" title="Pay" icon={<LoadingOutlined />} />
        <Step status="wait" title="Done" icon={<SmileOutlined />} />
      </Steps>
    </Card>
  )
}

export default WithIcon
