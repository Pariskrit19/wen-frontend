import React from 'react'
import {Menu} from 'antd'
import {Link, useLocation} from 'react-router-dom'

import CustomScrollbars from 'util/CustomScrollbars'
import SidebarLogo from './SidebarLogo'

import Auxiliary from 'util/Auxiliary'
import {
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
  THEME_TYPE_LITE,
} from 'constants/ThemeSetting'
import IntlMessages from 'util/IntlMessages'
import {connect, useSelector} from 'react-redux'
import {SIDEBAR_ITEMS} from 'constants/sideBarItems'
import {
  ALL_TIME_LOG,
  LOGTIME,
  REPORTS,
  RESOURCES,
  USER_TIME_LOG,
} from 'helpers/routePath'
import RoleAccess from 'constants/RoleAccess'
import {selectAuthUser} from 'appRedux/reducers/Auth'

const SubMenu = Menu.SubMenu

function SidebarContent(props) {
  const {themeType, navStyle, collapse} = props
  const location = useLocation()
  const paths = location.pathname.split('/')
  const {
    role: {
      permission: {
        Navigation = {},
        Reports = {},
        Resources: NavigationResources = {},
        ['Log Time']: logtimePermission = {},
      } = {},
    } = {},
  } = useSelector(selectAuthUser)

  const selectedOpenKeys =
    paths[1] === REPORTS ||
    paths[1] === RESOURCES ||
    (paths[1] === LOGTIME && logtimePermission?.viewOtherLogTime)
      ? paths[2]
      : paths[1] === LOGTIME
      ? ALL_TIME_LOG
      : paths[1]

  const collapseNav = collapse ? collapse : () => {}

  const getNavStyleSubMenuClass = (navStyle) => {
    if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR) {
      return 'gx-no-header-submenu-popup'
    }
    return ''
  }

  return (
    <Auxiliary>
      <SidebarLogo />
      <div className="gx-sidebar-content">
        <CustomScrollbars className="gx-layout-sider-scrollbar">
          <Menu
            selectedKeys={[selectedOpenKeys]}
            theme={themeType === THEME_TYPE_LITE ? 'lite' : 'dark'}
            mode="inline"
            // items={items}
          >
            {SIDEBAR_ITEMS({
              Navigation,
              Reports,
              NavigationResources,
              logtimePermission,
            })
              .filter((item) => item.roles === true)
              .map((item) =>
                item.isExpandable ? (
                  <SubMenu
                    key={item.url}
                    className={getNavStyleSubMenuClass(navStyle)}
                    title={
                      <span style={{display: 'flex', alignItems: 'center'}}>
                        <i className={`icon icon-${item.icon} gx-fs-xlxl`} />
                        <IntlMessages id={item.name} />
                      </span>
                    }
                  >
                    {item.subItems
                      .filter((subitem) => subitem.roles === true)
                      .map((subItem) => {
                        if (subItem.url === 'ir') {
                          return (
                            <Menu.Item key={subItem.url}>
                              <a
                                href="https://forms.gle/qAfYuB9PCNui6SgdA"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {'IR'}
                              </a>
                            </Menu.Item>
                          )
                        }

                        return (
                          <Menu.Item key={subItem.url}>
                            <Link
                              to={`${item.url}/${subItem.url}`}
                              onClick={collapseNav}
                            >
                              <IntlMessages id={subItem.name} />
                            </Link>
                          </Menu.Item>
                        )
                      })}
                  </SubMenu>
                ) : (
                  <Menu.Item key={item.url}>
                    <Link
                      to={`/${item.url}`}
                      style={{display: 'flex', alignItems: 'center'}}
                      onClick={collapseNav}
                    >
                      <i className={`icon icon-${item.icon} gx-fs-xlxl`} />
                      <IntlMessages id={item.name} />
                    </Link>
                  </Menu.Item>
                )
              )}
          </Menu>
        </CustomScrollbars>
      </div>
    </Auxiliary>
  )
}

SidebarContent.propTypes = {}
const mapStateToProps = ({settings}) => {
  const {navStyle, themeType, locale, pathname} = settings
  return {navStyle, themeType, locale, pathname}
}
export default connect(mapStateToProps)(SidebarContent)
