import React, {useEffect, lazy, Suspense} from 'react'
import {connect, useSelector} from 'react-redux'
import socketIOClient from 'socket.io-client'
import {Navigate, Route, Routes} from 'react-router-dom'
import {ConfigProvider} from 'antd'
import moment from 'moment'
import 'moment/locale/en-gb'
import {IntlProvider} from 'react-intl'
import AppLocale from 'lngProvider'
import MainApp from './MainApp'
import SignIn from 'containers/SignIn'
import SignUp from 'containers/SignUp'

import {
  ACTIVITY_LOGS,
  ADDBLOG,
  ATTENDANCE,
  BLOG,
  BLOGDETAIL,
  BLOGS,
  COWORKERS,
  DASHBOARD,
  EDITBLOG,
  FAQS,
  FORGOT_PASSWORD,
  HOLIDAY,
  INVITE,
  LEAVE,
  LEAVE_REPORT,
  LOGTIME,
  MAINTAINANCE_MODE,
  NOTICEBOARD,
  OTHER_TIME_LOG,
  OVERTIME_REPORT,
  OVERVIEW,
  POLICY,
  PROFILE,
  PROJECTS,
  PROJECT_LOG,
  REPORTS,
  RESET_PASSWORD,
  RESOURCES,
  SALARY_REVIEW,
  SETTINGS,
  SIGNIN,
  SIGNUP,
  USER_TIME_LOG,
  WEEKLY_REPORT,
  WORK_LOG_REPORT,
} from 'helpers/routePath'
import {ProtectedRoute} from 'components/Elements/ProtectedRoute'
import Profile from 'pages/Profile'
import InviteUserSignup from 'pages/InviteUserSignup'
import WeeklyReport from 'pages/Reports/WeeklyReport'
import WorkLogReport from 'pages/Reports/WorkLogReport'
import LeaveReport from 'pages/Reports/LeaveReport'
import Faqs from 'pages/Resources/Faqs'
import Policy from 'pages/Resources/Policy'
import Holiday from 'pages/Resources/Holiday'
import Blogs from 'pages/Blog/Blogs'
import BlogDetail from 'pages/Blog/BlogDetail'
import AddBlog from 'pages/Blog/AddBlog'
import {THEME_TYPE_DARK} from 'constants/ThemeSetting'
import ForgotPassword from 'containers/ForgotPassword'
import ResetPassword from 'containers/ResetPassword'
import CircularProgress from 'components/Elements/CircularProgress'
import AccessRoute from 'components/Hoc/AccessRoute'
import Error404 from 'components/Modules/404'
import ActivityLogs from 'pages/Reports/ActivityLogs'
import MaintenanceMode from 'pages/MaintenanceMode'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import SalaryReviewPage from 'pages/Reports/SalaryReview'
import OtherLogTime from 'pages/LogTime/OtherLogTime'
import LogTimes from 'pages/LogTime/LogTimes'
import OvertimePage from 'pages/Reports/OvertimeReport'

const Dashboard = lazy(() => import('pages/Dashboard'))
const Overview = lazy(() => import('pages/Overview'))
const Coworkers = lazy(() => import('pages/Coworkers'))
const Projects = lazy(() => import('pages/Projects'))
const Attendace = lazy(() => import('pages/Attendance'))
const LogTime = lazy(() => import('pages/LogTime'))
const Leave = lazy(() => import('pages/Leave'))
const Noticeboard = lazy(() => import('pages/Noticeboard'))
const Blog = lazy(() => import('pages/Blog'))
const Reports = lazy(() => import('pages/Reports'))
const Resources = lazy(() => import('pages/Resources'))
const Settings = lazy(() => import('pages/Settings'))
const ProjectLogs = lazy(() => import('pages/ProjectLogs'))

moment.locale('en-gb')

export const socket = socketIOClient(process.env.REACT_APP_API_ENDPOINT || '', {
  transports: ['websocket'],
})

function App(props: any) {
  const {locale, authUser, themeType} = props
  const currentAppLocale = AppLocale[locale.locale]

  useEffect(() => {
    if (themeType === THEME_TYPE_DARK) {
      document.body.classList.add('dark-theme')
    } else if (document.body.classList.contains('dark-theme')) {
      document.body.classList.remove('dark-theme')
    }
  }, [themeType])

  const {
    role: {
      permission: {
        Navigation = {},
        Reports: NavigationReports = {},
        Resources: NavigationResources = {},
      } = {},
    },
  } = useSelector(selectAuthUser) || {}

  return (
    <ConfigProvider
      locale={{
        locale: currentAppLocale.antd,
        Table: {triggerDesc: '', triggerAsc: ''},
      }}
      getPopupContainer={(node: any) => {
        if (node && node?.classList) {
          if (
            Array.from(node?.classList).includes('ant-select-selector') ||
            Array.from(node?.classList).includes('ant-picker')
          ) {
            return node.parentNode
          }
          return document.body
        }
        return document.body
      }}
    >
      <IntlProvider
        locale={currentAppLocale.locale}
        messages={currentAppLocale.messages}
      >
        <Routes>
          <Route path="/" element={<Navigate to={DASHBOARD} />} />
          <Route path={SIGNIN} element={<SignIn />} />
          <Route path={INVITE} element={<InviteUserSignup />} />
          <Route path={FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={RESET_PASSWORD} element={<ResetPassword />} />

          <Route element={<ProtectedRoute auth={authUser} />}>
            <Route element={<MainApp />}>
              <Route
                path={DASHBOARD}
                element={
                  <Suspense fallback={<FallBack />}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path={OVERVIEW}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.todaysOverview}>
                      <Overview />
                    </AccessRoute>
                  </Suspense>
                }
              />
              <Route
                path={COWORKERS}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.coWorkers}>
                      <Coworkers />
                    </AccessRoute>
                  </Suspense>
                }
              />
              <Route
                path={PROJECTS}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.projects}>
                      <Projects />
                    </AccessRoute>
                  </Suspense>
                }
              ></Route>
              <Route
                path={ATTENDANCE}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.attendance}>
                      <Attendace />
                    </AccessRoute>
                  </Suspense>
                }
              />
              <Route
                path={LOGTIME}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.logTime}>
                      <LogTime />
                    </AccessRoute>
                  </Suspense>
                }
              >
                <Route
                  path={USER_TIME_LOG}
                  element={
                    <AccessRoute roles={Navigation?.logTime}>
                      <LogTimes />
                    </AccessRoute>
                  }
                />

                <Route
                  path={OTHER_TIME_LOG}
                  element={
                    <AccessRoute roles={Navigation?.logTime}>
                      <OtherLogTime />
                    </AccessRoute>
                  }
                />
              </Route>
              <Route
                path={LEAVE}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.leaveManagement}>
                      <Leave />
                    </AccessRoute>
                  </Suspense>
                }
              />
              <Route
                path={NOTICEBOARD}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.noticeBoard}>
                      <Noticeboard />
                    </AccessRoute>
                  </Suspense>
                }
              />
              <Route
                path={BLOG}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.blog}>
                      <Blog />
                    </AccessRoute>
                  </Suspense>
                }
              >
                <Route path={BLOGS} element={<Blogs />} />
                <Route path={ADDBLOG} element={<AddBlog />} />
                <Route path={EDITBLOG} element={<AddBlog />} />
                <Route path={BLOGDETAIL} element={<BlogDetail />} />
              </Route>
              <Route
                path={REPORTS}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.reports}>
                      <Reports />
                    </AccessRoute>
                  </Suspense>
                }
              >
                <Route
                  path={WEEKLY_REPORT}
                  element={
                    <AccessRoute roles={NavigationReports?.viewWeeklyReport}>
                      <WeeklyReport />
                    </AccessRoute>
                  }
                />
                <Route
                  path={WORK_LOG_REPORT}
                  element={
                    <AccessRoute roles={NavigationReports?.viewWorkLogReport}>
                      <WorkLogReport />
                    </AccessRoute>
                  }
                />
                <Route
                  path={LEAVE_REPORT}
                  element={
                    <AccessRoute roles={NavigationReports?.viewLeaveReport}>
                      <LeaveReport />
                    </AccessRoute>
                  }
                />
                <Route
                  path={SALARY_REVIEW}
                  element={
                    <AccessRoute roles={NavigationReports?.viewSalaryReview}>
                      <SalaryReviewPage />
                    </AccessRoute>
                  }
                />
                <Route
                  path={ACTIVITY_LOGS}
                  element={
                    <AccessRoute roles={NavigationReports?.viewActivityLog}>
                      <ActivityLogs />
                    </AccessRoute>
                  }
                />
                <Route
                  path={OVERTIME_REPORT}
                  element={
                    <AccessRoute roles={NavigationReports?.viewOvertimeReport}>
                      <OvertimePage />
                    </AccessRoute>
                  }
                />
              </Route>
              <Route
                path={RESOURCES}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.resources}>
                      <Resources />
                    </AccessRoute>
                  </Suspense>
                }
              >
                <Route
                  path={FAQS}
                  element={
                    <AccessRoute roles={NavigationResources?.viewFAQ}>
                      <Faqs />
                    </AccessRoute>
                  }
                />
                <Route
                  path={POLICY}
                  element={
                    <AccessRoute roles={NavigationResources?.viewPolicy}>
                      <Policy />
                    </AccessRoute>
                  }
                />
                <Route
                  path={HOLIDAY}
                  element={
                    <AccessRoute roles={NavigationResources?.viewHoliday}>
                      <Holiday />
                    </AccessRoute>
                  }
                />
              </Route>
              <Route
                path={SETTINGS}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.settings}>
                      <Settings />
                    </AccessRoute>
                  </Suspense>
                }
              />
              <Route
                path={PROJECT_LOG}
                element={
                  <Suspense fallback={<FallBack />}>
                    <AccessRoute roles={Navigation?.logTime}>
                      <ProjectLogs />
                    </AccessRoute>
                  </Suspense>
                }
              />
              <Route path={PROFILE} element={<Profile />} />
            </Route>
          </Route>
          <Route path={MAINTAINANCE_MODE} element={<MaintenanceMode />} />
          <Route path="*" element={<Error404 />} />
          <Route
            path="notAllowed"
            element={<Error404 message="You are not allowed!" />}
          />
        </Routes>
      </IntlProvider>
    </ConfigProvider>
  )
}

const FallBack = () => <CircularProgress className="" />

const mapStateToProps = ({settings, auth}: {settings: any; auth: any}) => {
  const {locale, themeType} = settings
  const {authUser} = auth
  return {locale, authUser, themeType}
}
export default connect(mapStateToProps)(App)
