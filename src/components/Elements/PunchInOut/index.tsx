import React, {useEffect, useState} from 'react'
import {ScheduleOutlined} from '@ant-design/icons'
import moment from 'moment'
import {Button} from 'antd'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import LiveTime from '../LiveTime/index'
import {
  checkIfTimeISBetweenOfficeHour,
  getIsAdmin,
  handleResponse,
  isNotValidTimeZone,
  sortFromDate,
} from 'helpers/utils'
import {notification} from 'helpers/notification'
import {addAttendance, getIpAddres, updatePunchout} from 'services/attendances'
import {useDispatch, useSelector} from 'react-redux'
import {PUNCH_IN, PUNCH_OUT} from 'constants/ActionTypes'
import {fetchLoggedInUserAttendance} from 'appRedux/actions/Attendance'
import {Dispatch} from 'redux'
import TmsMyAttendanceForm from 'components/Modules/TmsMyAttendanceForm'
import getLocation, {checkLocationPermission} from 'helpers/getLocation'
import {punchLimit} from 'constants/PunchLimit'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import calculateTimeDifference from 'util/calculatePunchInOutTimeDiff'

function PunchInOut() {
  const user = useSelector(selectAuthUser)

  const {lateArrivalThreshold} = useSelector(
    (state: any) => state.configurations
  )

  const [toogle, setToogle] = useState(false)
  const [disableButton, setdisableButton] = useState(false)
  const queryClient = useQueryClient()
  const dispatch: Dispatch<any> = useDispatch()
  const reduxuserAttendance = useSelector((state: any) => state.attendance)

  const {punchIn, latestAttendance} = reduxuserAttendance

  useEffect(() => {
    if (
      latestAttendance?.length === 0 ||
      typeof latestAttendance === 'undefined'
    ) {
      dispatch({type: PUNCH_IN})
    } else {
      const lastattendace = sortFromDate(latestAttendance, 'punchInTime').at(-1)
      lastattendace?.punchOutTime
        ? dispatch({type: PUNCH_IN})
        : dispatch({type: PUNCH_OUT})
    }
  }, [latestAttendance, dispatch])

  const addAttendances = useMutation((payload: any) => addAttendance(payload), {
    onSuccess: (response) => {
      handleResponse(response, 'Punched Successfully', 'Punch  failed', [
        () => {
          dispatch({type: PUNCH_OUT})
        },
        () => queryClient.invalidateQueries(['adminAttendance']),
        () => queryClient.invalidateQueries(['userAttendance']),
        () => {
          dispatch(fetchLoggedInUserAttendance(user._id))
        },
      ])
    },
    onError: (error) => {
      notification({message: 'Punch  failed', type: 'error'})
    },

    onSettled: () => {
      setdisableButton(false)
    },
  })

  const punchOutAttendances = useMutation(
    (payload: {userId: string; payload: any}) =>
      updatePunchout(payload?.userId, payload.payload),
    {
      onSuccess: (response) => {
        handleResponse(response, 'Punched Successfully', 'Punch  failed', [
          () => {
            dispatch(fetchLoggedInUserAttendance(user._id))
          },
          () => {
            dispatch({type: PUNCH_IN})
          },
          () => queryClient.invalidateQueries(['userAttendance']),
          () => queryClient.invalidateQueries(['adminAttendance']),
        ])
      },
      onError: (error) => {
        notification({message: 'Punch  failed', type: 'error'})
      },
      onSettled: () => {
        setdisableButton(false)
      },
    }
  )

  const handlePunch = async () => {
    let latestPunchInTime =
      latestAttendance?.[latestAttendance.length - 1]?.punchInTime

    const hasAlreadyPunchedOut =
      latestAttendance?.[latestAttendance.length - 1]?.punchOutTime?.length

    const punchInOutTimeDiff = calculateTimeDifference(latestPunchInTime, 10)

    if (
      !hasAlreadyPunchedOut &&
      latestPunchInTime &&
      moment() < moment(latestPunchInTime).add(10, 'm')
    ) {
      notification({
        message: `You have just Punched In ! You can punch out again after ${`${
          punchInOutTimeDiff.minutes
        } ${punchInOutTimeDiff.minutes === 1 ? 'minute.' : 'minutes.'}`} `,
        type: 'info',
      })
      return
    }
    if (isNotValidTimeZone()) {
      notification({
        message: 'Your timezone is not a valid timezone',
        type: 'error',
      })
      return
    }

    if (
      checkIfTimeISBetweenOfficeHour(
        moment(user?.officeTime?.utcDate)
          .add(lateArrivalThreshold, 'm')
          .format('HH:mm:ss'),
        moment(user?.officeEndTime).format('HH:mm:ss')
      )
    ) {
      setToogle(true)
      return
    }

    setdisableButton(true)

    const location = await getLocation()
    if (location && (await checkLocationPermission())) {
      const IP = await getIpAddres()

      if (!punchIn) {
        const lastattendace = sortFromDate(latestAttendance, 'punchInTime').at(
          -1
        )

        punchOutAttendances.mutate({
          userId: lastattendace?._id,
          payload: {
            punchOutNote: '',
            midDayExit: false,
            punchOutTime: moment.utc().format(),
            punchOutLocation: location,
            punchOutIp: IP?.data?.IPv4,
          },
        })
      } else {
        addAttendances.mutate({
          punchInTime: moment.utc().format(),
          punchInLocation: location,
          attendanceDate: moment.utc().startOf('day').format(),
          punchInIp: IP?.data?.IPv4,
        })
      }
    } else {
      notification({
        message: 'Please allow Location Access to Punch for Attendance',
        type: 'error',
      })
      setdisableButton(false)
    }
  }

  return (
    <>
      <TmsMyAttendanceForm
        title="Time Attendance"
        toogle={toogle}
        handleCancel={() => setToogle(false)}
      />
      <Button
        onClick={
          latestAttendance?.length >= punchLimit &&
          !latestAttendance
            ?.map((item: object) => item?.hasOwnProperty('punchOutTime'))
            .includes(false)
            ? () => {
                notification({
                  message: 'Punch Limit Exceeded',
                  type: 'error',
                })
              }
            : handlePunch
        }
        className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
        icon={<ScheduleOutlined />}
        disabled={
          addAttendances.isLoading ||
          punchOutAttendances.isLoading ||
          latestAttendance?.length === 0 ||
          disableButton ||
          getIsAdmin()
        }
        style={{width: '200px'}}
      >
        {punchIn ? 'Punch In' : 'Punch Out'}
        <LiveTime />
      </Button>
    </>
  )
}

export default PunchInOut
