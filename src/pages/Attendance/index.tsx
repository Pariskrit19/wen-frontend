import React, {useEffect, useState} from 'react'
import {Card, Tabs} from 'antd'
import UserAttendance from './UserAttendance'
import AdminAttendance from './AdminAttendance'
import LateAttendance from './LateAttendance'
import AttendanceCalendar from './Calendar'
import AdminAttendanceCalendar from './AdminCalendar'
import {useLocation, useSearchParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'

function Attendace() {
  const {state}: {state: any} = useLocation()
  let [searchParams, setSearchParams] = useSearchParams()

  const [tabKey, setTabKey] = useState('1')

  const {
    role: {
      key,
      permission: {Attendance: NavigationAttendance},
    },
  } = useSelector(selectAuthUser)

  useEffect(() => {
    if (state?.tab) {
      setTabKey(state?.tab)
    }
  }, [state, NavigationAttendance])

  useEffect(() => {
    if (NavigationAttendance?.viewMyAttendance) {
      setTabKey('1')
    } else if (NavigationAttendance?.viewMyAttendanceCalendar) {
      setTabKey('2')
    } else if (NavigationAttendance?.viewCoworkersAttendance) {
      setTabKey('3')
    } else if (NavigationAttendance?.viewCoworkersLateAttendance) {
      setTabKey('4')
    } else if (NavigationAttendance?.viewCoworkersAttendanceCalendar) {
      setTabKey('5')
    }
  }, [])

  const urlTabKey = searchParams.toString().split('=')[1]
  useEffect(() => {
    if (!state?.tab) {
      setTabKey(urlTabKey)
    }
  }, [urlTabKey, state])

  return (
    <Card title="Attendance">
      <Tabs
        type="card"
        activeKey={tabKey || '1'}
        onChange={(tab) => {
          searchParams.set('tab', tab)
          setSearchParams({tab})
          setTabKey(tab)
        }}
      >
        {NavigationAttendance?.viewMyAttendance && (
          <Tabs.TabPane key="1" tab="My Attendance">
            <UserAttendance userRole={NavigationAttendance} />
          </Tabs.TabPane>
        )}
        {NavigationAttendance?.viewMyAttendanceCalendar && (
          <Tabs.TabPane key="2" tab="My Attendance Calendar">
            <AttendanceCalendar />
          </Tabs.TabPane>
        )}

        {NavigationAttendance?.viewCoworkersAttendance && (
          <Tabs.TabPane key="3" tab="Co-workers Attendance">
            <AdminAttendance userRole={NavigationAttendance} />
          </Tabs.TabPane>
        )}

        {NavigationAttendance?.viewCoworkersLateAttendance && (
          <Tabs.TabPane key="4" tab="Co-workers Late Attendance">
            <LateAttendance userRole={NavigationAttendance} />
          </Tabs.TabPane>
        )}
        {NavigationAttendance?.viewCoworkersAttendanceCalendar && (
          <Tabs.TabPane key="5" tab="Co-workers Attendance Calendar">
            <AdminAttendanceCalendar />
          </Tabs.TabPane>
        )}
      </Tabs>
    </Card>
  )
}

export default Attendace
