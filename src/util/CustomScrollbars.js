import React from 'react'
import {Scrollbars} from 'react-custom-scrollbars'
import useWindowsSize from 'hooks/useWindowsSize'

const CustomScrollbars = (props) => {
  const {innerHeight} = useWindowsSize()

  return (
    <Scrollbars
      {...props}
      autoHide
      autoHeight
      autoHeightMin={innerHeight - 100}
      renderTrackHorizontal={(props) => (
        <div
          {...props}
          style={{display: 'none'}}
          className="track-horizontal"
        />
      )}
    />
  )
}
export default CustomScrollbars
