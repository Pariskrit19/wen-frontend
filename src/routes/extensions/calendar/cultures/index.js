import React from 'react'
import {Calendar, momentLocalizer} from 'react-big-calendar'

import {events} from '../events'
import moment from 'moment'

const localizer = momentLocalizer(moment)

class Cultures extends React.Component {
  constructor() {
    super()
    this.state = {culture: 'fr'}
  }

  render() {
    let cultures = ['en', 'en-GB', 'es', 'fr', 'ar-AE']
    let rtl = this.state.culture === 'ar-AE'

    return (
      <div className="gx-main-content">
        <div className="gx-rbc-calendar">
          <div className="gx-mb-3">
            <label className="h3">Select a Culture</label>{' '}
            <select
              className="ant-input"
              style={{width: 200, display: 'inline-block'}}
              defaultValue={'fr'}
              onChange={(e) => this.setState({culture: e.target.value})}
            >
              {cultures.map((c, idx) => (
                <option key={idx} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Calendar
            rtl={rtl}
            events={events}
            culture={this.state.culture}
            defaultDate={new Date(2022, 6, 29)}
            localizer={localizer}
          />
        </div>
      </div>
    )
  }
}

export default Cultures
