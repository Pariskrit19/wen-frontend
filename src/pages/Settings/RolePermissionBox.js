import React, {useEffect, useContext, useState} from 'react'
import {Checkbox, Col, Divider, Row} from 'antd'
import {RolePermissionContext} from 'context/RolePermissionConext'
import {
  CHANGE_SINGLE_CHECKBOX,
  SELECT_ALL_CHECKBOX,
} from 'constants/RolePermission'

const RolePermissionBox = ({data, title, allAccess, handleDefaultKeys}) => {
  const arrayDatas = data?.map((d) => d.name)
  let emptyArray = []
  const {state, dispatch} = useContext(RolePermissionContext)

  const onChange = (list) => {
    dispatch({
      type: CHANGE_SINGLE_CHECKBOX,
      payload: {
        checkedList: {title, list},
        emptyObj: {[title]: list},
        indeterminate: {
          title,
          check: !!list.length && list.length < arrayDatas.length,
        },
        checkAll: {title, check: list.length === arrayDatas.length},
      },
    })
    handleDefaultKeys(title, list)
  }
  const onCheckAllChange = (e) => {
    let activeData = e.target.checked ? data.map((d) => d.name) : []
    handleDefaultKeys(title, activeData)
    dispatch({
      type: SELECT_ALL_CHECKBOX,
      payload: {
        checkedList: e.target.checked
          ? {title, list: arrayDatas}
          : {title, list: emptyArray},
        indeterminate: {title, check: false},
        checkAll: {title, check: e.target.checked},
      },
    })
  }

  return (
    <div className="role-box">
      <div className="role-box-header">
        <p>
          <span className="role-box-title">{title} Permission</span>
        </p>
        <Checkbox
          indeterminate={
            state?.indeterminate?.[title] ? state?.indeterminate[title] : false
          }
          onChange={onCheckAllChange}
          checked={state?.checkAll?.[title] ?? false}
        >
          Select All
        </Checkbox>
      </div>
      <Divider />
      <Checkbox.Group value={state?.checkedList?.[title]} onChange={onChange}>
        <Row gutter={[6, 25]}>
          {data?.map((d) => (
            <Col span={12} spacing>
              <Checkbox value={d.name}>{d.label}</Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    </div>
  )
}

export default RolePermissionBox
