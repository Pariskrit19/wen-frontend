import React from 'react'
import {HeartOutlined} from '@ant-design/icons'
import {Card, Rate} from 'antd'

const OtherCharactor = () => {
  return (
    <Card className="gx-card" title="Other Charactor">
      <div className="gx-mb-2">
        <Rate character={<HeartOutlined />} allowHalf />
      </div>
      <div className="gx-mb-2">
        <Rate character="A" allowHalf style={{fontSize: 36}} />
      </div>
      <div className="gx-mb-0">
        <Rate character="好" allowHalf />
      </div>
    </Card>
  )
}

export default OtherCharactor
