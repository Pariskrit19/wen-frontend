import React from 'react'
import {Card, Tabs} from 'antd'
import SalaryReviewTab from './SalaryReviewTab'
import SalaryReviewCalender from './SalaryReviewCalender'
import {useSearchParams} from 'react-router-dom'

const SalaryReviewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.toString().split('=')[1] || '1'
  return (
    <Card title="Salary Review">
      <Tabs
        type="card"
        activeKey={activeTab}
        onChange={(tab) => {
          searchParams.set('reviewTab', tab)
          setSearchParams({reviewTab: tab})
        }}
      >
        <Tabs.TabPane tab="Salary Review" key="1">
          <SalaryReviewTab />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Salary Review Calendar" key="2">
          <SalaryReviewCalender />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  )
}

export default SalaryReviewPage
