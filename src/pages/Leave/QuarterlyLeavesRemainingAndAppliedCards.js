import {Col, Row} from 'antd'
import IconAndInfoCard from 'components/Modules/Metrics/IconAndInfoCard'
import React from 'react'
import useWindowsSize from 'hooks/useWindowsSize'

function QuarterlyLeavesRemainingAndAppliedCards({
  firstType,
  secondType,
  firstNumber,
  secondNumber,
  approvedLeaves,
  nonCasualSickLeaveCardHeight,
}) {
  const {innerWidth} = useWindowsSize()
  return (
    <Row gutter={[20, 20]}>
      <Col
        xxl={12}
        xl={12}
        lg={12}
        md={12}
        sm={12}
        xs={24}
        className="gx-col-full"
      >
        <IconAndInfoCard
          cardColor="cyan"
          icon="product-list"
          number={firstNumber}
          text={firstType}
          nonCasualSickLeaveCardHeight={nonCasualSickLeaveCardHeight}
          firstType="Days Remaining"
          secondType="Leave adjustment"
          firstTypeCount={firstNumber}
          secondTypeCount={secondNumber}
          style={{minHeight: '131px'}}
          isQuarterlyRemaining={true}
        />
      </Col>
      <Col
        xxl={12}
        xl={12}
        lg={12}
        md={12}
        sm={12}
        xs={24}
        className="gx-col-full"
      >
        <IconAndInfoCard
          cardColor="orange"
          icon="tasks"
          firstType="Sick"
          secondType="Casual"
          title={secondType}
          firstTypeCount={approvedLeaves.sickLeaves}
          secondTypeCount={approvedLeaves.casualLeaves}
          nonCasualSickLeaveCardHeight={nonCasualSickLeaveCardHeight}
          style={innerWidth < 1600 ? {minHeight: '135px'} : {}}
        />
      </Col>
    </Row>
  )
}

export default QuarterlyLeavesRemainingAndAppliedCards
