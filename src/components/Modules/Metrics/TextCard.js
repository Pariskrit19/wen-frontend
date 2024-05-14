import React from 'react'
import Widget from 'components/Elements/Widget/index'
import {connect} from 'react-redux'

const TextCard = (props) => {
  const {title, subTitle, cardColor, colorTitle, colorSubTitle} = props
  // if (props.themeType === THEME_TYPE_DARK) {
  // iconColor = "white";
  // }

  return (
    <Widget styleName={`gx-bg-${cardColor}`}>
      <div className={`gx-media gx-align-items-center gx-flex-nowrap`}>
        <div className="gx-text-center">
          <h1
            className={`gx-fs-xxxl gx-font-weight-medium gx-mb-1 gx-text-${colorTitle}`}
          >
            {title}
          </h1>
          <p className={`gx-mb-0 gx-text-${colorSubTitle}`}>{subTitle}</p>
        </div>
      </div>
    </Widget>
  )
}

const mapStateToProps = ({settings}) => {
  const {themeType} = settings
  return {themeType}
}
export default connect(mapStateToProps, null)(TextCard)
