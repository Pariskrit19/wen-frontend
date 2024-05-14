import React from 'react'
import Widget from 'components/Elements/Widget/index'
import {connect} from 'react-redux'

const IconWithTextCard = (props) => {
  const {icon, title, subTitle, cardColor} = props
  let {iconColor} = props
  // if (props.themeType === THEME_TYPE_DARK) {
  iconColor = 'white'
  // }

  return (
    <Widget styleName={`gx-bg-${cardColor}`}>
      <div className={`gx-media gx-align-items-center gx-flex-nowrap`}>
        <div className="gx-mr-lg-4 gx-mr-3">
          <i
            className={`icon icon-${icon} gx-fs-xlxl gx-text-${iconColor} gx-d-flex`}
            style={{fontSize: 45}}
          />
        </div>
        <div className="gx-media-body">
          <h1
            className={`gx-fs-xxxl gx-font-weight-medium gx-mb-1 gx-text-${iconColor}`}
          >
            {title}
          </h1>
          <p className={`gx-mb-0 gx-text-${iconColor}`}>{subTitle}</p>
        </div>
      </div>
    </Widget>
  )
}

const mapStateToProps = ({settings}) => {
  const {themeType} = settings
  return {themeType}
}
export default connect(mapStateToProps, null)(IconWithTextCard)
