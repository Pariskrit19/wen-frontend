import React from 'react'
import {Col, Row} from 'antd'

import IconWithTextCard from 'components/Modules/Metrics/IconWithTextCard'

function TimeSummary({est, ts, tsw}) {
  return (
    <Col xl={24} lg={24} md={24} sm={24} xs={24} className="gx-order-sm-1">
      <Row>
        <Col xl={8} lg={8} md={8} sm={12} xs={24}>
          <IconWithTextCard
            cardColor="cyan"
            icon="diamond"
            title={est}
            subTitle="Estimated Time"
          />
        </Col>
        <Col xl={8} lg={8} md={8} sm={12} xs={24}>
          <IconWithTextCard
            cardColor="orange"
            icon="tasks"
            title={ts}
            subTitle="Time Spent"
          />
        </Col>
        <Col xl={8} lg={8} md={8} sm={12} xs={24}>
          <IconWithTextCard
            cardColor="teal"
            icon="team"
            title={tsw}
            subTitle="Time Spent This Week"
          />
        </Col>
      </Row>
    </Col>
  )
}

export default TimeSummary
