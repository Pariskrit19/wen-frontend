import React from 'react'
import {LoadingOutlined} from '@ant-design/icons'
import {Card, Spin} from 'antd'

const antIcon = <LoadingOutlined style={{fontSize: 24}} spin />

const Custom = () => {
  return (
    <Card title="Custom" className="gx-card">
      <Spin indicator={antIcon} />
    </Card>
  )
}

export default Custom
