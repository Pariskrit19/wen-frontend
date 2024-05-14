import React from 'react'
import {Route, Routes, useLocation} from 'react-router-dom'

import Components from './components/index'
import CustomViews from './customViews/index'
import Extensions from './extensions/index'
import ExtraComponents from './extraComponents/index'
import InBuiltApps from './inBuiltApps/index'
import SocialApps from './socialApps/index'
import Main from './main/index'
import Dashboard from './main/dashboard'

const App = ({match}) => {
  return (
    <div className="gx-main-content-wrapper">
      <Routes>
        <Route path="main" element={<Dashboard />} />
        {/* <Route path={`${match.url}components`} component={Components}/>
      <Route path={`${match.url}custom-views`} component={CustomViews}/>
      <Route path={`${match.url}extensions`} component={Extensions}/>
      <Route path={`${match.url}extra-components`} component={ExtraComponents}/>
      <Route path={`${match.url}in-built-apps`} component={InBuiltApps}/>
      <Route path={`${match.url}social-apps`} component={SocialApps}/> */}
      </Routes>
    </div>
  )
}

export default App
