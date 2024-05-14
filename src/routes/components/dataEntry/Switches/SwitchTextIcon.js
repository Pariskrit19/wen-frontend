import React from 'react'
import {CheckOutlined, CloseOutlined} from '@ant-design/icons'
import {Card, Switch} from 'antd'

const SwitchTextIcon = () => {
  return (
    <Card className="gx-card" title="Switch Text Icon">
      <div className="gx-mb-3">
        <Switch
          checkedChildren="open"
          unCheckedChildren="turn off"
          defaultChecked
        />
      </div>
      <div className="gx-mb-3">
        <Switch checkedChildren="1" unCheckedChildren="0" />
      </div>
      <div className="gx-mb-0">
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          defaultChecked
        />
      </div>
    </Card>
  )
}

export default SwitchTextIcon
