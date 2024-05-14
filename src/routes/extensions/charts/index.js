import React from 'react'
import {Route, Switch} from 'react-router-dom'
import Recharts from './recharts'

const Charts = ({match}) => (
  <Switch>
    <Route path={`${match.url}/recharts`} component={Recharts} />
  </Switch>
)

export default Charts
