import React from 'react'
import {Navigate, Redirect, Route, Routes, Switch} from 'react-router-dom'
import asyncComponent from 'util/asyncComponent'

const Dashboard = ({match}) => (
  <Routes>
    {/* <Navigate from={`${match.url}/`} to={`${match.url}/crm`} /> */}
    {/* <Route
			path={`${match.url}/crm`}
			element={asyncComponent(() => import("./CRM/index"))}
		/>
		<Route
			path={`${match.url}/crypto`}
			element={asyncComponent(() => import("./Crypto/index"))}
		/> */}
    <Route
      path="dashboard"
      element={asyncComponent(() => import('./Listing/index'))}
    />
  </Routes>
)

export default Dashboard
