import {Col, Row} from 'antd'
import IconAndInfoCard from 'components/Modules/Metrics/IconAndInfoCard'
import {AnnualApprovedLeaveCardClassName} from 'constants/DOM'
import React from 'react'

function AnnualLeavesRemainingAndAppliedCards(props) {
  return (
    <Row gutter={[20, 20]}>
      <Col
        xxl={12}
        lg={12}
        xl={12}
        md={12}
        sm={12}
        xs={24}
        className="gx-col-full"
      >
        <IconAndInfoCard
          index={1}
          cardColor="cyan"
          icon="product-list"
          title={props.firstTitle}
          firstTypeCount={props.sickDayRemaining}
          secondTypeCount={props.casualDayRemaining}
          {...props}
        />
      </Col>
      <Col
        xxl={12}
        lg={12}
        xl={12}
        sm={12}
        xs={24}
        md={12}
        className="gx-col-full"
      >
        <IconAndInfoCard
          index={2}
          cardColor="orange"
          icon="tasks"
          title={props.secondTitle}
          firstTypeCount={props.sickDayApplied}
          secondTypeCount={props.casualDayApplied}
          uniqueClassName={AnnualApprovedLeaveCardClassName}
          {...props}
        />
      </Col>
    </Row>
  )
}

export default AnnualLeavesRemainingAndAppliedCards
