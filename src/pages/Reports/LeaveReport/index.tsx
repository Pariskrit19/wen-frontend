import React from 'react'
import {Card, Tabs} from 'antd'

import SummaryReport from './SummaryReport'

function LeaveReport() {
  return (
    <div>
      <Card title="Leave Report">
        <Tabs>
          <Tabs.TabPane tab="Summary Report" key="1">
            <SummaryReport></SummaryReport>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default LeaveReport
