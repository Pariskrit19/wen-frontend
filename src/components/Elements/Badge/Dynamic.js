import React from 'react'
import {MinusOutlined, PlusOutlined} from '@ant-design/icons'
import {Badge, Button, Card, Switch} from 'antd'

const ButtonGroup = Button.Group

class Dynamic extends React.Component {
  state = {
    count: 5,
    show: true,
  }

  increase = () => {
    const count = this.state.count + 1
    this.setState({count})
  }

  decline = () => {
    let count = this.state.count - 1
    if (count < 0) {
      count = 0
    }
    this.setState({count})
  }

  onChange = (show) => {
    this.setState({show})
  }

  render() {
    return (
      <Card className="gx-card" title="Dynamic">
        <div>
          <Badge count={this.state.count}>
            <div className="head-example" />
          </Badge>
          <ButtonGroup>
            <Button onClick={this.decline}>
              <MinusOutlined />
            </Button>
            <Button onClick={this.increase}>
              <PlusOutlined />
            </Button>
          </ButtonGroup>
        </div>
        <div style={{marginTop: 10}}>
          <Badge dot={this.state.show}>
            <div className="head-example" />
          </Badge>
          <Switch onChange={this.onChange} checked={this.state.show} />
        </div>
      </Card>
    )
  }
}

export default Dynamic
