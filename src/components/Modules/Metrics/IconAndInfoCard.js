import React from 'react'
import Widget from 'components/Elements/Widget/index'
import {connect} from 'react-redux'
import {Col, Row} from 'antd'
import useWindowsSize from 'hooks/useWindowsSize'

const IconAndInfoCard = (props) => {
  const {
    icon,
    title,
    cardColor,
    firstType,
    firstTypeCount,
    secondType,
    secondTypeCount,
    nonCasualSickLeaveCardHeight,
    style,
    showIcon = true,
    bodyStyle = {},
    uniqueClassName = '',
    isQuarterlyRemaining = false,
  } = props
  let {iconColor, YearlyLeaveExceptCasualandSick, index} = props
  // if (props.themeType === THEME_TYPE_DARK) {
  iconColor = 'white'
  // }
  const {innerWidth} = useWindowsSize()
  const isMacSize =
    innerWidth > 1200 && innerWidth < 1400 && isQuarterlyRemaining
  const styleObject =
    !title && innerWidth > 1600
      ? {
          row: {
            //marginTop: '17px',
            alignItems: 'center',
          },
          icon: {
            marginBottom: '10px',
          },
        }
      : {flexWarp: isMacSize ? 'nowrap' : 'wrap'}

  return (
    <Widget
      styleName={`gx-bg-${cardColor} no-margin leave-card ${uniqueClassName}`}
      style={{height: nonCasualSickLeaveCardHeight}}
      bodyStyle={{
        padding: 20,
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        display: 'flex',
      }}
    >
      <div
        style={{height: '100%', justifyContent: 'center'}}
        className="gx-flex-column"
      >
        <Row>
          <p className={`gx-text-${iconColor}`}>{title}</p>
        </Row>
        {/* <Row>
          <Col>
            <div className="gx-mr-lg-4 gx-mr-3">
              <i
                className={`icon icon-${icon} gx-fs-xlxl gx-text-${iconColor} gx-d-flex`}
                style={{
                  fontSize: 45,
                  marginLeft: icon === 'tasks' ? '-7px' : '',
                }}
              />
            </div>
          </Col>
        </Row> */}
        <Row style={styleObject?.row}>
          {showIcon && (
            <Col>
              <div className="leave-card-margin gx-mr-lg-4 gx-mr-3">
                <i
                  className={`icon icon-${icon} gx-fs-xlxl gx-text-${iconColor} gx-d-flex`}
                  style={{
                    fontSize: icon === 'product-list' ? 38 : 45,
                    marginLeft: icon === 'tasks' ? '-7px' : '',
                  }}
                />
              </div>
            </Col>
          )}

          <Col>
            <div
              className="gx-d-flex gx-justify-content-between"
              style={{
                gap: isMacSize ? '6px' : '2rem',
                marginBottom: '0.2rem',
              }}
            >
              <p className={`gx-mb-0 gx-text-${iconColor}`} style={{flex: 1}}>
                {firstType}
              </p>
              <p className={`gx-mb-0 gx-text-${iconColor}`}>{firstTypeCount}</p>
            </div>
            {(secondTypeCount > 0 || title) && (
              <div
                className="gx-d-flex gx-justify-content-between"
                style={{
                  gap: isMacSize ? '6px' : '2rem',
                  marginBottom: '0.2rem',
                }}
              >
                <p className={`gx-mb-0 gx-text-${iconColor}`}>{secondType}</p>
                <p className={`gx-mb-0 gx-text-${iconColor}`}>
                  {secondTypeCount}
                </p>
              </div>
            )}
            {index === 2 &&
              YearlyLeaveExceptCasualandSick?.map((data, index) => (
                <div
                  key={index}
                  className="gx-d-flex gx-justify-content-between"
                  style={{
                    gap: isMacSize ? '6px' : '2rem',
                    marginBottom: '0.2rem',
                  }}
                >
                  <p
                    className={`gx-mb-0 gx-text-${iconColor}`}
                    style={{flex: 1}}
                  >
                    {data[0]?.replace('Leave', '')}
                  </p>
                  <p className={`gx-mb-0 gx-text-${iconColor}`}>{data?.[1]}</p>
                </div>
              ))}
          </Col>
        </Row>
      </div>
    </Widget>
  )
}

const mapStateToProps = ({settings}) => {
  const {themeType} = settings
  return {themeType}
}
export default connect(mapStateToProps, null)(IconAndInfoCard)
