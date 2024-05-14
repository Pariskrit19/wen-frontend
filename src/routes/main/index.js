import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Widgets from './Widgets'
import Metrics from './Metrics'
import Dashboard from './dashboard'
import Layouts from './Layouts'
import asyncComponent from '../../util/asyncComponent'

const Main = ({match}) => (
  <Routes>
    <Route
      path="dashboard"
      element={asyncComponent(() => import('./dashboard/Listing/index'))}
    />
    {/* <Route path={`${match.url}/widgets`} element={<Widgets />} /> */}
    {/* <Route path={`${match.url}/metrics`} element={<Metrics />} />
		<Route path={`${match.url}/layouts`} element={<Layouts />} /> */}
    {/* <Route
			path={`${match.url}/algolia`}
			element={asyncComponent(() => import("../algolia"))}
		/> */}
  </Routes>
)

export default Main
