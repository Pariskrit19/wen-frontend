import React from 'react'
import {Route, Switch} from 'react-router-dom'

import GoogleMap from './googlemap'

const Maps = ({match}) => (
  <Switch>
    <Route path={`${match.url}/google`} component={GoogleMap} />
  </Switch>
)

export default Maps
