import React from 'react'
import {HomeOutlined, UserOutlined} from '@ant-design/icons'
import {Breadcrumb, Card} from 'antd'

const WithIcon = () => {
  return (
    <Card className="gx-card" title="WithIcon">
      <Breadcrumb>
        <Breadcrumb.Item>
          <span className="gx-link">
            <HomeOutlined />
          </span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span className="gx-link">
            <UserOutlined />
            <span>Application List</span>
          </span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Application</Breadcrumb.Item>
      </Breadcrumb>
    </Card>
  )
}

export default WithIcon
