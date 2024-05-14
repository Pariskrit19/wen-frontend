import React, {useEffect} from 'react'
import {Layout} from 'antd'
import {Outlet} from 'react-router-dom'
import {connect, useDispatch, useSelector} from 'react-redux'
import Sidebar from 'containers/Sidebar/index'
import Topbar from 'containers/Topbar/index'
import {footerText} from 'util/config'
import {
  NAV_STYLE_ABOVE_HEADER,
  NAV_STYLE_BELOW_HEADER,
  NAV_STYLE_DARK_HORIZONTAL,
  NAV_STYLE_DEFAULT_HORIZONTAL,
  NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
} from 'constants/ThemeSetting'
import {fetchLoggedInUserAttendance} from 'appRedux/actions/Attendance'
import {LOCALSTORAGE_USER} from 'constants/Settings'
import {useQuery} from '@tanstack/react-query'
import {getProfile} from 'appRedux/actions'
import CircularProgress from 'components/Elements/CircularProgress'
import {getMaintenance} from 'services/configurations'
import {
  getAllocatedOfficeHours,
  getLateArrivalThreshold,
} from 'appRedux/actions/Configurations'
import {UPDATE_LEAVE_APPLY_NOTIFICATION} from 'constants/ActionTypes'

const {Content, Footer} = Layout

export const MainApp = (props) => {
  const dispatch = useDispatch()
  const userId =
    localStorage.getItem(LOCALSTORAGE_USER) &&
    localStorage.getItem(LOCALSTORAGE_USER) !== 'undefined'
      ? JSON.parse(localStorage.getItem(LOCALSTORAGE_USER) || '')
      : ''

  const auth = useSelector((state) => state.auth)

  const {navStyle, switchingUser} = props

  useEffect(() => {
    if (
      switchingUser ||
      (userId && auth.authUser === null && !auth.profileLoadingFail)
    ) {
      dispatch(getProfile(userId))
    }
  }, [userId, dispatch, auth, switchingUser])

  useEffect(() => {
    if (props?.authUser)
      dispatch(fetchLoggedInUserAttendance(props?.authUser?.user?._id))
  }, [dispatch, props?.authUser])

  useEffect(() => {
    const timeout = setInterval(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          function (position) {},
          () => {},
          {maximumAge: 60000, timeout: 15000, enableHighAccuracy: true}
        )
      }
    }, 1000 * 60 * 5)
    return () => clearInterval(timeout)
  }, [])

  const {data: configurations, isFetching: isConfigurationsFetching} = useQuery(
    ['configuration'],
    getMaintenance,
    {
      onSuccess: (data) => {
        if (data.status) {
          dispatch(
            getLateArrivalThreshold(
              data?.data?.data?.data?.[0]?.lateArrivalThreshold
            )
          )
          dispatch(
            getAllocatedOfficeHours(data?.data?.data?.data?.[0]?.officeHour)
          )

          dispatch({
            type: UPDATE_LEAVE_APPLY_NOTIFICATION,
            payload: data?.data?.data?.data?.[0]?.SendLeaveApplyNotification,
          })
        }
      },
    }
  )

  const getContainerClass = (navStyle) => {
    switch (navStyle) {
      case NAV_STYLE_DARK_HORIZONTAL:
        return 'gx-container-wrap'
      case NAV_STYLE_DEFAULT_HORIZONTAL:
        return 'gx-container-wrap'
      case NAV_STYLE_INSIDE_HEADER_HORIZONTAL:
        return 'gx-container-wrap'
      case NAV_STYLE_BELOW_HEADER:
        return 'gx-container-wrap'
      case NAV_STYLE_ABOVE_HEADER:
        return 'gx-container-wrap'
      default:
        return ''
    }
  }

  if (auth.profileLoading || switchingUser) return <CircularProgress />

  return (
    <Layout className="gx-app-layout">
      <Sidebar />
      <Layout>
        <Topbar />
        <Content
          className={`gx-layout-content ${getContainerClass(navStyle)} `}
        >
          <div className="gx-main-content-wrapper">
            <Outlet />
          </div>
          <Footer>
            <div className="gx-layout-footer-content">
              {`© - ${new Date().getFullYear()}`} Built with Pride by
              <span
                onClick={() =>
                  window.open('https://www.webexpertsnepal.com/', '_blank')
                }
                className="footer-text"
              >
                {' '}
                WebExperts
              </span>
              .
            </div>
          </Footer>
        </Content>
      </Layout>
    </Layout>
  )
}

const mapStateToProps = ({settings, auth}) => {
  const {width, navStyle} = settings
  const {authUser, switchingUser} = auth
  return {width, navStyle, authUser, switchingUser}
}
export default connect(mapStateToProps)(MainApp)
