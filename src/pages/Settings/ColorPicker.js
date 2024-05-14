import React, {useEffect, useState} from 'react'
import {SketchPicker} from 'react-color'

const ColorPicker = ({displayColorPicker, setDisplayColorPicker, form, editData}) => {
  const [color, setColor] = useState('#f17013')
  const handleClick = () => {
    setDisplayColorPicker((prev) => !prev)
  }
  const handleClose = () => {
    setDisplayColorPicker(false)
    setColor('#f17013')
  }
  const handleChange = (color) => {
    setColor(color?.hex)
    form.setFieldValue('color', color?.hex)
    form.validateFields(['color'])
  }

  useEffect(() => {
    if (editData?.hasOwnProperty('color')) {
      setColor(editData?.color)
    }else{
      setColor('#f17013')
    }
  }, [editData])
  return (
    <div>
      <div className="cp-swatch" onClick={handleClick}>
        <div
          className="cp-color"
          style={{
            backgroundColor: color,
            height: 35,
            width: displayColorPicker ? '13.6rem' : '2rem',
            borderRadius: '6px',
          }}
        />
      </div>
      {displayColorPicker ? (
        <div className="cp-popover">
          <div className="cp-cover" onClick={handleClose} />
          <SketchPicker color={color} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  )
}

export default ColorPicker
