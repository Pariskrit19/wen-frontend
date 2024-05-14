import React, {useContext, useEffect} from 'react'
import RolePermissionBox from './RolePermissionBox'
import {
  permissionRole,
  REMOVE_CHECKBOX_SELECTION,
} from 'constants/RolePermission'
import {RolePermissionContext} from 'context/RolePermissionConext'

const CommonRolePermission = ({allAccess, title}) => {
  const {state, dispatch} = useContext(RolePermissionContext)

  const handleDefaultKeys = (title, checkedList) => {
    if (title === 'Navigation') {
      const activeKeys = permissionRole['Navigation']
        .filter((d) => checkedList?.includes(d.name))
        .map((d) => d.label)
      const testingData = Object.keys(permissionRole)

      //removing checbox selection for deselected title in navigation
      const checkListSelection = testingData.reduce((prev, curr) => {
        if (activeKeys?.includes(curr) || curr === 'Dashboard') {
          return Object.assign(prev, {
            [curr]: state?.checkedList?.[curr],
          })
        } else if (curr === 'Navigation') {
          return Object.assign(prev, {[curr]: checkedList})
        } else {
          return Object.assign(prev, {
            [curr]: [],
          })
        }
      }, {})

      //removing checbox selection for select all for deselected title in navigation
      const checkAllSelection = testingData.reduce((prev, curr) => {
        if (activeKeys?.includes(curr) || curr === 'Dashboard') {
          return Object.assign(prev, {
            [curr]: state?.checkAll?.[curr],
          })
        } else if (curr === 'Navigation') {
          return Object.assign(prev, {[curr]: state?.checkAll?.[curr]})
        } else {
          return Object.assign(prev, {
            [curr]: false,
          })
        }
      }, {})

      dispatch({
        type: REMOVE_CHECKBOX_SELECTION,
        payload: {checkedList: checkListSelection, checkAll: checkAllSelection},
      })
    }
  }

  return (
    <RolePermissionBox
      data={permissionRole[title]}
      title={title}
      allAccess={allAccess}
      handleDefaultKeys={handleDefaultKeys}
    />
  )
}

export default CommonRolePermission
