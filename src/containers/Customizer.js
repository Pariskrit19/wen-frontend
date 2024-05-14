import React, {Component} from 'react'
import {Form} from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import {Button, Drawer, message, Radio} from 'antd'
import {connect} from 'react-redux'

import ColorPicker from './ColorPicker'
import Auxiliary from 'util/Auxiliary'
import CustomScrollbars from 'util/CustomScrollbars'
import {
  onLayoutTypeChange,
  onNavStyleChange,
  setThemeColorSelection,
  setThemeType,
} from 'appRedux/actions/Setting'

import {
  BLUE,
  BLUE_DARK_TEXT_COLOR,
  BLUE_NAV_DARK_BG,
  BLUE_SEC,
  DARK_BLUE,
  DARK_BLUE_DARK_TEXT_COLOR,
  DARK_BLUE_NAV_DARK_BG,
  DARK_BLUE_SEC,
  DEEP_ORANGE,
  DEEP_ORANGE_DARK_TEXT_COLOR,
  DEEP_ORANGE_NAV_DARK_BG,
  DEEP_ORANGE_SEC,
  LIGHT_BLUE,
  LIGHT_BLUE_DARK_TEXT_COLOR,
  LIGHT_BLUE_NAV_DARK_BG,
  LIGHT_BLUE_SEC,
  LIGHT_PURPLE,
  LIGHT_PURPLE_1,
  LIGHT_PURPLE_1_DARK_TEXT_COLOR,
  LIGHT_PURPLE_1_NAV_DARK_BG,
  LIGHT_PURPLE_1_SEC,
  LIGHT_PURPLE_2,
  LIGHT_PURPLE_2_DARK_TEXT_COLOR,
  LIGHT_PURPLE_2_NAV_DARK_BG,
  LIGHT_PURPLE_2_SEC,
  LIGHT_PURPLE_DARK_TEXT_COLOR,
  LIGHT_PURPLE_NAV_DARK_BG,
  LIGHT_PURPLE_SEC,
  NAV_STYLE_FIXED,
  NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
  ORANGE,
  ORANGE_DARK_TEXT_COLOR,
  ORANGE_NAV_DARK_BG,
  ORANGE_SEC,
  RED,
  RED_DARK_TEXT_COLOR,
  RED_NAV_DARK_BG,
  RED_SEC,
  THEME_COLOR_SELECTION_CUSTOMIZE,
  THEME_COLOR_SELECTION_PRESET,
  THEME_TYPE_DARK,
  THEME_TYPE_LITE,
  THEME_TYPE_SEMI_DARK,
} from '../constants/ThemeSetting'

class Customizer extends Component {
  onChangeComplete = (varName, color) => {
    const {vars} = this.state
    vars[varName] = color
    this.setState({vars})
  }
  handleColorChange = (varname, color) => {
    const {vars} = this.state
    if (varname) vars[varname] = color
    window.less
      .modifyVars(vars)
      .then(() => {
        message.success(`Theme updated successfully`)
        this.setState({vars})
        localStorage.setItem('app-theme', JSON.stringify(vars))
      })
      .catch((error) => {
        message.error(`Failed to update theme`)
      })
  }
  getColorPicker = (varName) => (
    <div key={varName} className="gx-media gx-mb-1">
      <div className="gx-ml-1 gx-mr-4">
        <ColorPicker
          type="sketch"
          small
          color={this.state.vars[varName]}
          position="bottom"
          presetColors={[
            '#038fde',
            '#722ED1',
            '#2F54EB',
            '#1890FF',
            '#13C2C2',
            '#EB2F96',
            '#F5222D',
            '#FA541C',
            '#FA8C16',
            '#FAAD14',
            '#FADB14',
            '#A0D911',
            '#52C41A',
          ]}
          onChangeComplete={(color) => this.handleColorChange(varName, color)}
        >
          <span className="gx-pointer gx-text-capitalize gx-media-body">
            {varName.substr(1, varName.length).replace(/-/g, ' ')}
          </span>
        </ColorPicker>
      </div>
    </div>
  )
  resetTheme = () => {
    localStorage.setItem('app-theme', '{}')
    this.setState({vars: this.state.initialValue})
    window.less.modifyVars(this.state.initialValue).catch((error) => {
      message.error(`Failed to reset theme`)
    })
  }
  toggleCustomizer = () => {
    this.setState((previousState) => ({
      isCustomizerOpened: !previousState.isCustomizerOpened,
    }))
  }

  onThemeTypeChange = (e) => {
    this.props.setThemeType(e.target.value)
  }
  onColorSelectionTypeChange = (e) => {
    this.props.setThemeColorSelection(e.target.value)
  }

  onNavStyleChange = (navStyle) => {
    this.props.onNavStyleChange(navStyle)
  }

  getCustomizerContent = () => {
    const colorPickers = Object.keys(this.state.vars).map((varName) =>
      this.getColorPicker(varName)
    )
    const {themeType, layoutType, navStyle, colorSelection} = this.props

    if (themeType === THEME_TYPE_DARK) {
      document.body.classList.add('dark-theme')
    } else if (document.body.classList.contains('dark-theme')) {
      document.body.classList.remove('dark-theme')
    }

    return (
      <CustomScrollbars className="gx-customizer">
        <div className="gx-customizer-item">
          <h6 className="gx-mb-3 gx-text-uppercase">Theme</h6>
          <Radio.Group value={themeType} onChange={this.onThemeTypeChange}>
            <Radio.Button value={THEME_TYPE_LITE}>Lite</Radio.Button>
            <Radio.Button value={THEME_TYPE_SEMI_DARK}>Semi Dark</Radio.Button>
            <Radio.Button value={THEME_TYPE_DARK}>Dark</Radio.Button>
          </Radio.Group>
        </div>
        <div className="gx-customizer-item">
          <h6 className="gx-mb-3 gx-text-uppercase">Colors</h6>
          <Radio.Group
            className="gx-mb-3"
            value={colorSelection}
            onChange={this.onColorSelectionTypeChange}
          >
            <Radio.Button value={THEME_COLOR_SELECTION_PRESET}>
              Preset Color Pallets
            </Radio.Button>
            <Radio.Button value={THEME_COLOR_SELECTION_CUSTOMIZE}>
              Customize
            </Radio.Button>
          </Radio.Group>

          {colorSelection === THEME_COLOR_SELECTION_CUSTOMIZE ? (
            <div className="gx-cus-customiz">
              {colorPickers}
              <Button
                className="gx-mb-0"
                type="primary"
                onClick={this.resetTheme}
              >
                Reset Theme
              </Button>
            </div>
          ) : (
            this.getPresetColors()
          )}
        </div>

        <h6 className="gx-mb-3 gx-text-uppercase">Nav Style</h6>

        {this.getNavStyles(navStyle)}
      </CustomScrollbars>
    )
  }
  handleThemeColor = (
    primaryColor,
    secondaryColor,
    navDarkTextColor,
    navDarkBg
  ) => {
    let modifiedVars = this.state.vars
    modifiedVars['@primary-color'] = primaryColor
    modifiedVars['@secondary-color'] = secondaryColor
    modifiedVars['@nav-dark-bg'] = navDarkBg
    modifiedVars['@nav-dark-text-color'] = navDarkTextColor
    this.setState({vars: modifiedVars})
    this.handleColorChange()
  }

  handleLayoutTypes = (layoutType) => {
    this.props.onLayoutTypeChange(layoutType)
  }
  getPresetColors = () => {
    const themeColor = Object.entries(this.state.vars)[0][1]
    return (
      <ul className="gx-color-option gx-list-inline">
        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              LIGHT_PURPLE,
              LIGHT_PURPLE_SEC,
              LIGHT_PURPLE_DARK_TEXT_COLOR,
              LIGHT_PURPLE_NAV_DARK_BG
            )}
            style={{
              backgroundColor: LIGHT_PURPLE_SEC,
              color: LIGHT_PURPLE_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-light-purple ${
              themeColor === LIGHT_PURPLE && 'active'
            }`}
          />
        </li>
        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              RED,
              RED_SEC,
              RED_DARK_TEXT_COLOR,
              RED_NAV_DARK_BG
            )}
            style={{backgroundColor: RED_SEC, color: RED_DARK_TEXT_COLOR}}
            className={`gx-link gx-color-red ${themeColor === RED && 'active'}`}
          />
        </li>
        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              BLUE,
              BLUE_SEC,
              BLUE_DARK_TEXT_COLOR,
              BLUE_NAV_DARK_BG
            )}
            style={{backgroundColor: BLUE_SEC, color: BLUE_DARK_TEXT_COLOR}}
            className={`gx-link gx-color-blue ${
              themeColor === BLUE && 'active'
            }`}
          />
        </li>
        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              DARK_BLUE,
              DARK_BLUE_SEC,
              DARK_BLUE_DARK_TEXT_COLOR,
              DARK_BLUE_NAV_DARK_BG
            )}
            style={{
              backgroundColor: DARK_BLUE_SEC,
              color: DARK_BLUE_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-dark-blue ${
              themeColor === DARK_BLUE && 'active'
            }`}
          />
        </li>

        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              ORANGE,
              ORANGE_SEC,
              ORANGE_DARK_TEXT_COLOR,
              ORANGE_NAV_DARK_BG
            )}
            style={{
              backgroundColor: ORANGE_SEC,
              color: ORANGE_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-orange ${
              themeColor === ORANGE && 'active'
            }`}
          />
        </li>

        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              LIGHT_BLUE,
              LIGHT_BLUE_SEC,
              LIGHT_BLUE_DARK_TEXT_COLOR,
              LIGHT_BLUE_NAV_DARK_BG
            )}
            style={{
              backgroundColor: LIGHT_BLUE_SEC,
              color: LIGHT_BLUE_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-light-blue ${
              themeColor === LIGHT_BLUE && 'active'
            }`}
          />
        </li>

        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              DEEP_ORANGE,
              DEEP_ORANGE_SEC,
              DEEP_ORANGE_DARK_TEXT_COLOR,
              DEEP_ORANGE_NAV_DARK_BG
            )}
            style={{
              backgroundColor: DEEP_ORANGE_SEC,
              color: DEEP_ORANGE_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-deep-orange ${
              themeColor === DEEP_ORANGE && 'active'
            }`}
          />
        </li>

        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              LIGHT_PURPLE_1,
              LIGHT_PURPLE_1_SEC,
              LIGHT_PURPLE_1_DARK_TEXT_COLOR,
              LIGHT_PURPLE_1_NAV_DARK_BG
            )}
            style={{
              backgroundColor: LIGHT_PURPLE_1_SEC,
              color: LIGHT_PURPLE_1_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-light-purple1 ${
              themeColor === LIGHT_PURPLE_1 && 'active'
            }`}
          />
        </li>

        <li>
          <span
            onClick={this.handleThemeColor.bind(
              this,
              LIGHT_PURPLE_2,
              LIGHT_PURPLE_2_SEC,
              LIGHT_PURPLE_2_DARK_TEXT_COLOR,
              LIGHT_PURPLE_2_NAV_DARK_BG
            )}
            style={{
              backgroundColor: LIGHT_PURPLE_2_SEC,
              color: LIGHT_PURPLE_2_DARK_TEXT_COLOR,
            }}
            className={`gx-link gx-color-light-purple2 ${
              themeColor === LIGHT_PURPLE_2 && 'active'
            }`}
          />
        </li>
      </ul>
    )
  }

  getNavStyles = (navStyle) => {
    return (
      <ul className="gx-nav-option gx-list-inline">
        <li>
          <span
            onClick={this.onNavStyleChange.bind(this, NAV_STYLE_FIXED)}
            className={`gx-pointer ${navStyle === NAV_STYLE_FIXED && 'active'}`}
          >
            <img src={require('assets/images/layouts/fixed.png')} alt="fixed" />
          </span>
        </li>
        <li>
          <span
            onClick={this.onNavStyleChange.bind(
              this,
              NAV_STYLE_INSIDE_HEADER_HORIZONTAL
            )}
            className={`gx-pointer ${
              navStyle === NAV_STYLE_INSIDE_HEADER_HORIZONTAL && 'active'
            }`}
          >
            <img
              src={require('assets/images/layouts/inside header horizontal.png')}
              alt="inside header horizontal"
            />
          </span>
        </li>
      </ul>
    )
  }

  constructor(props) {
    super(props)
    let initialValue = {
      '@primary-color': '#038fde',
      '@secondary-color': '#fa8c16',
      '@text-color': '#545454',
      '@heading-color': '#535353',
      '@nav-dark-bg': '#003366',
      '@nav-dark-text-color': '#038fdd',
      '@header-text-color': '#262626',
      '@layout-header-background': '#fefefe',
      '@layout-footer-background': '#fffffd',
      '@body-background': '#f5f5f5',
      '@hor-nav-text-color': '#fffffd',
    }
    let vars = {}

    try {
      vars = Object.assign(
        {},
        initialValue,
        JSON.parse(localStorage.getItem('app-theme'))
      )
    } finally {
      this.state = {vars, initialValue, isCustomizerOpened: false}
      window.less
        .modifyVars(vars)
        .then(() => {})
        .catch((error) => {
          message.error(`Failed to update theme`)
        })
    }
  }

  render() {
    return (
      <Auxiliary>
        <Drawer
          placement="right"
          closable={false}
          onClose={this.toggleCustomizer}
          visible={this.state.isCustomizerOpened}
        >
          {this.getCustomizerContent()}
        </Drawer>
        <div className="gx-customizer-option">
          <Button type="primary" onClick={this.toggleCustomizer.bind(this)}>
            <i className="icon icon-setting fxicon-hc-spin gx-d-block" />
          </Button>
        </div>
      </Auxiliary>
    )
  }
}

Customizer = Form.create()(Customizer)

const mapStateToProps = ({settings}) => {
  const {themeType, width, colorSelection, navStyle, layoutType} = settings
  return {themeType, width, colorSelection, navStyle, layoutType}
}
export default connect(mapStateToProps, {
  setThemeType,
  onLayoutTypeChange,
  setThemeColorSelection,
  onNavStyleChange,
})(Customizer)
