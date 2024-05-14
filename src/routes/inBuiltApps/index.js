// import React from "react";
// import {Redirect, Route, Switch} from "react-router-dom";
// import asyncComponent from "util/asyncComponent";

// const InBuiltApps = ({match}) => (
//   <Switch>
//     <Redirect exact from={`${match.url}/`} to={`${match.url}/contacts`}/>
//     <Route path={`${match.url}/chat`} component={asyncComponent(() => import('./Chat/index'))}/>
//     <Route path={`${match.url}/mail`} component={asyncComponent(() => import('./Mail'))}/>
//     <Route path={`${match.url}/notes`} component={asyncComponent(() => import('./Notes'))}/>
//   </Switch>
// );

// export default InBuiltApps;
