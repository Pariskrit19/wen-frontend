import React from 'react'
import {FrownOutlined, SmileOutlined} from '@ant-design/icons'
import {Card, Slider} from 'antd'

class SliderWithIcon extends React.Component {
  state = {
    value: 0,
  }
  handleChange = (value) => {
    this.setState({value})
  }

  render() {
    const {max, min} = this.props
    const {value} = this.state
    const mid = ((max - min) / 2).toFixed(5)
    const preColor = value >= mid ? '' : 'rgba(0, 0, 0, .45)'
    const nextColor = value >= mid ? 'rgba(0, 0, 0, .45)' : ''
    return (
      <Card className="gx-card" title="Slider With Icon">
        <FrownOutlined style={{color: preColor}} />
        <Slider {...this.props} onChange={this.handleChange} value={value} />
        <SmileOutlined style={{color: nextColor}} />
      </Card>
    )
  }
}

export default SliderWithIcon
