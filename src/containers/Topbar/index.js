import React, {useEffect, useState} from 'react'
import {Layout, Switch} from 'antd'
import {FaMoon} from 'react-icons/fa'
import {BsFillSunFill} from 'react-icons/bs'
import {toggleCollapsedSideNav} from 'appRedux/actions/Setting'
import UserInfo from 'components/Elements/UserInfo'
import Auxiliary from 'util/Auxiliary'

import {
  NAV_STYLE_DRAWER,
  NAV_STYLE_FIXED,
  NAV_STYLE_MINI_SIDEBAR,
  TAB_SIZE,
  THEME_TYPE_DARK,
  THEME_TYPE_SEMI_DARK,
} from 'constants/ThemeSetting'
import {connect, useSelector} from 'react-redux'
import PunchInOut from 'components/Elements/PunchInOut'
import {setThemeType} from 'appRedux/actions/Setting'
import ActivityInfo from 'components/Modules/ActivityInfo'
import NotificationInfo from 'components/Modules/NotificationInfo'
import {getIsAdmin} from 'helpers/utils'
import MaintainanceBar from 'components/Modules/Maintainance'
import useWindowsSize from 'hooks/useWindowsSize'
import {selectAuthUser} from 'appRedux/reducers/Auth'

const {Header} = Layout

const Topbar = (props) => {
  const {width, navCollapsed, navStyle, themeType} = props
  const {innerWidth} = useWindowsSize()
  const [notificationArrowPosition, setnotificationArrowPosition] = useState(0)
  const [activityArrowPosition, setactivityArrowPosition] = useState(0)
  const {
    role: {permission: {Dashboard = {}, Attendance = {}} = {}},
  } = useSelector(selectAuthUser) || {}

  const handleThemeChange = (e) => {
    if (e) {
      props.setThemeType(THEME_TYPE_DARK)
      localStorage.setItem('theme', THEME_TYPE_DARK)
    } else {
      props.setThemeType(THEME_TYPE_SEMI_DARK)
      localStorage.setItem('theme', THEME_TYPE_SEMI_DARK)
    }
  }
  useEffect(() => {
    const notificationIconPosition = document.getElementById(
      'mobile-screen-notification'
    )
    const activityIconPosition = document.getElementById(
      'mobile-screen-activity'
    )
    if (notificationIconPosition) {
      setnotificationArrowPosition(
        notificationIconPosition?.getBoundingClientRect()?.right
      )
    }
    if (activityIconPosition) {
      setactivityArrowPosition(
        activityIconPosition?.getBoundingClientRect()?.right
      )
    }
  }, [])

  return (
    <div>
      <Auxiliary>
        <Header>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            {navStyle === NAV_STYLE_DRAWER ||
            ((navStyle === NAV_STYLE_FIXED ||
              navStyle === NAV_STYLE_MINI_SIDEBAR) &&
              width < TAB_SIZE) ? (
              <div
                className={`gx-linebar ${
                  innerWidth < 650 ? 'gx-mr-0' : 'gx-mr-3'
                }`}
              >
                <i
                  className="gx-icon-btn icon icon-menu"
                  onClick={() => {
                    props.toggleCollapsedSideNav(!navCollapsed)
                  }}
                />
              </div>
            ) : null}

            <div
              className={`gx-header-notifications ${
                innerWidth < 650 ? 'gx-mt-0 gx-mr-1-5rem' : 'gx-mt-2'
              }`}
            >
              {Attendance?.createMyAttendance && <PunchInOut />}
            </div>
            <div>
              <ul
                className="gx-header-notifications gx-ml-auto gx-d-flex "
                style={{flexWrap: 'nowrap'}}
              >
                {innerWidth > 650 && (
                  <>
                    <li className="gx-notify">
                      {Dashboard?.enableMaintenanceMode && (
                        <MaintainanceBar showPopupConfirm={true} />
                      )}
                    </li>

                    <li className="gx-notify">
                      <Switch
                        unCheckedChildren={
                          <FaMoon
                            style={{
                              fontSize: '15px',
                              color: '#3a3939',
                              marginTop: '3px',
                            }}
                          />
                        }
                        checkedChildren={
                          <BsFillSunFill
                            style={{
                              color: 'yellow',
                              fontSize: '18px',
                              marginTop: '2px',
                            }}
                          />
                        }
                        defaultChecked={
                          themeType === THEME_TYPE_DARK ? true : false
                        }
                        onChange={handleThemeChange}
                      />
                    </li>

                    {!getIsAdmin() && (
                      <li className="gx-user-nav gx-notify li-gap">
                        <NotificationInfo />
                      </li>
                    )}

                    <li className="gx-user-nav gx-notify li-gap">
                      {Dashboard?.viewRecentActivities && <ActivityInfo />}
                    </li>
                  </>
                )}

                <li className="gx-user-nav li-gap">
                  <UserInfo />
                </li>
              </ul>
            </div>
          </div>
        </Header>
      </Auxiliary>
      {innerWidth < 650 && (
        <div className="mobile-screen-topbar">
          <Header>
            <ul
              className="gx-header-notifications gx-ml-auto gx-d-flex"
              style={{flexWrap: 'nowrap'}}
            >
              <>
                {/* <li>
                  <MaintainanceBar />
                </li> */}

                <li>
                  <Switch
                    unCheckedChildren={
                      <FaMoon
                        style={{
                          fontSize: '15px',
                          color: '#3a3939',
                          marginTop: '3px',
                        }}
                      />
                    }
                    checkedChildren={
                      <BsFillSunFill
                        style={{
                          color: 'yellow',
                          fontSize: '18px',
                          marginTop: '2px',
                        }}
                      />
                    }
                    defaultChecked={
                      themeType === THEME_TYPE_DARK ? true : false
                    }
                    onChange={handleThemeChange}
                  />
                </li>

                {!getIsAdmin() && (
                  <li
                    className="gx-user-nav li-gap"
                    id="mobile-screen-notification"
                  >
                    <NotificationInfo
                      arrowPosition={notificationArrowPosition}
                    />
                  </li>
                )}

                <li className="gx-user-nav li-gap" id="mobile-screen-activity">
                  {Dashboard?.viewRecentActivities && (
                    <ActivityInfo arrowPosition={activityArrowPosition} />
                  )}
                </li>
              </>
            </ul>
          </Header>
        </div>
      )}
    </div>
  )
}

const mapStateToProps = ({settings, auth}) => {
  const {navStyle, navCollapsed, width, themeType} = settings

  return {navStyle, navCollapsed, width, themeType, user: auth?.authUser?.user}
}

export default connect(mapStateToProps, {
  toggleCollapsedSideNav,
  setThemeType,
})(Topbar)
