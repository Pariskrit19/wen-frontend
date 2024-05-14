import React from 'react'
import {Col, Row} from 'antd'

import IconWithTextCard from 'components/Modules/Metrics/IconWithTextCard'

function TimeSummary({tsw, tst}) {
  return (
    <Row>
      <Col xl={12} lg={12} md={12} sm={12} xs={24} className="gx-col-full">
        <IconWithTextCard
          cardColor="cyan"
          icon="diamond"
          title={tsw}
          subTitle="Time Spent This Week"
        />
      </Col>
      <Col xl={12} lg={12} md={12} sm={12} xs={24} className="gx-col-full">
        <IconWithTextCard
          cardColor={tst ? 'orange' : 'danger'}
          icon="tasks"
          title={tst}
          subTitle="Time Spent Today"
        />
      </Col>
    </Row>
  )
}

export default TimeSummary
