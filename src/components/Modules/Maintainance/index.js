import {Popconfirm, Switch} from 'antd'
import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {useLocation, useNavigate} from 'react-router-dom'
import {useMutation} from '@tanstack/react-query'
import {updateMaintenance} from 'services/configurations'
import {handleResponse} from 'helpers/utils'
import {notification} from 'helpers/notification'
import {
  ADMIN_KEY,
  SHOW_MAINTENANCE_BUTTON_TO_ADMIN_ONLY,
} from 'constants/Common'
import {DASHBOARD, MAINTAINANCE_MODE} from 'helpers/routePath'
import {LOCALSTORAGE_USER} from 'constants/Settings'
import {socket} from 'pages/Main'

const MaintainanceBar = ({showPopupConfirm = false}) => {
  const userDetail = useSelector(selectAuthUser)
  const location = useLocation()
  const [isOn, setIsOn] = useState(location.pathname.includes('maintenance'))
  const navigate = useNavigate()
  const maintenanceMutation = useMutation(
    (payload) => updateMaintenance(payload),
    {
      onSuccess: (response) => {
        const res = response?.data?.data
        handleResponse(
          response,
          `Maintenance mode ${res?.isMaintenanceEnabled ? 'on' : 'off'}`,
          'Maintenance mode change failed',
          []
        )
        if (res?.isMaintenanceEnabled) {
          localStorage.setItem(
            SHOW_MAINTENANCE_BUTTON_TO_ADMIN_ONLY,
            JSON.parse(localStorage.getItem(LOCALSTORAGE_USER)) + ADMIN_KEY
          )
          setIsOn(res?.isMaintenanceEnabled)
          socket.emit('maintenance-toggle', {isEnabled: true})
          navigate(`/${MAINTAINANCE_MODE}`)
        } else {
          socket.emit('maintenance-toggle', {isEnabled: false})

          navigate(`/${DASHBOARD}`)
        }
      },
      onError: (error) => {
        notification({message: 'Maintenance mode change failed', type: 'error'})
      },
    }
  )

  const handleMaintainance = (event) => {
    const isActive = typeof event !== 'boolean'
    maintenanceMutation.mutate({isMaintenanceEnabled: isActive})
  }

  const showMaintenanceButton = () => {
    return (
      localStorage.getItem(SHOW_MAINTENANCE_BUTTON_TO_ADMIN_ONLY) ===
      JSON.parse(localStorage.getItem(LOCALSTORAGE_USER)) + ADMIN_KEY
    )
  }
  if (!showMaintenanceButton() && userDetail?.role?.key !== 'admin') {
    return null
  }

  return showPopupConfirm ? (
    <Popconfirm
      title={`Are you sure you want to turn on Maintenance mode?`}
      onConfirm={handleMaintainance}
      okText="Yes"
      cancelText="No"
    >
      <span
        style={{
          fontSize: '17px',
          marginRight: '5px',
          fontWeight: '500',
        }}
      >
        Maintenance
      </span>
      <Switch
        className="maintain-dark"
        checkedChildren="ON"
        unCheckedChildren="OFF"
        checked={isOn}
        loading={maintenanceMutation.isLoading}
      />
    </Popconfirm>
  ) : (
    <>
      <span
        style={{
          fontSize: '19px',
          marginRight: '5px',
        }}
      >
        Maintenance
      </span>
      <Switch
        className="maintain-dark"
        checkedChildren="ON"
        unCheckedChildren="OFF"
        checked={isOn}
        onChange={handleMaintainance}
        loading={maintenanceMutation.isLoading}
      />
    </>
  )
}

export default MaintainanceBar
