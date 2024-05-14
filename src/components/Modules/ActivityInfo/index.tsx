import React, {useEffect, useState, useRef} from 'react'
import {useInfiniteQuery, useMutation} from '@tanstack/react-query'
import {getActivityLogs, updateActivityLogs} from 'services/activitLogs'
import RoleAccess from 'constants/RoleAccess'
import {Popover} from 'antd'
import RecentActivity from '../dashboard/CRM/RecentActivity'
import moment from 'moment'
import {useInView} from 'react-intersection-observer'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {socket} from 'pages/Main'
import {getIsAdmin} from 'helpers/utils'
import useWindowsSize from 'hooks/useWindowsSize'

export const notificationCountStyle: any = {
  position: 'absolute',
  bottom: '2px',
  right: '-8px',
  backgroundColor: '#f44336',
  color: 'white',
  width: '15px',
  height: '15px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '8px',
  padding: '9px',
}

function ActivityInfo({arrowPosition}: {arrowPosition: number}) {
  const {ref, inView} = useInView({threshold: 0.5})

  const [visible, setVisible] = useState<boolean>(false)
  const [showBellCount, setShowBellCount] = useState<boolean>(false)
  const [notificationCount, setNotificationCount] = useState<number>(0)
  const {innerWidth} = useWindowsSize()

  const {
    role: {key},
  } = useSelector(selectAuthUser)

  const handleVisibleChange = (newVisible: boolean) => {
    !getIsAdmin() && setVisible(newVisible)
  }

  const {data, isFetching, isFetchingNextPage, fetchNextPage, refetch} =
    useInfiniteQuery(
      ['activityLogsInfo'],
      async ({pageParam = 1}) => {
        const res = await getActivityLogs({page: pageParam, limit: 6})
        return res
      },
      {
        enabled: key === RoleAccess.Admin,
      }
    )

  // fecth next page on scroll of activities
  useEffect(() => {
    if (
      inView &&
      !(
        (data?.pageParams.length || 1) * 6 >=
        data?.pages[0]?.data?.data?.count
      ) &&
      !isFetchingNextPage
    ) {
      fetchNextPage({pageParam: (data?.pages?.length || 0) + 1})
    }
  }, [
    inView,
    fetchNextPage,
    data?.pages?.length,
    data?.pageParams.length,
    data?.pages,
    isFetchingNextPage,
  ])

  useEffect(() => {
    socket.on('countActivity', (response: any) => {
      refetch()
      setNotificationCount(response)
      setShowBellCount(true)
    })

    socket.emit('CUD')
  }, [])

  useEffect(() => {
    if (visible) {
      socket.emit('notification-visible')
      setShowBellCount(false)
    }
  }, [visible])
  useEffect(() => {
    if (innerWidth < 650 && visible) {
      const popOverArrow: HTMLElement | null = document.querySelector(
        '.activity-icon-mobile-screen > .ant-popover-content > .ant-popover-arrow'
      )
      if (popOverArrow) {
        popOverArrow.style.right = `${innerWidth - arrowPosition + 20}px`
      }
    }
  }, [visible])

  const userMenuOptions = (
    <RecentActivity
      visible={visible}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      showMore={
        (data?.pageParams.length || 1) * 6 >= data?.pages[0]?.data?.data?.count
      }
      viewRef={ref}
      recentList={data?.pages.map((page, i) => ({
        id: i,
        tasks: page?.data?.data?.data?.map((log: any) => ({
          id: log._id,
          module: log?.module,
          name: log.user.name || '',
          title: [
            <span className="" key={1}>
              {log?.activity}
            </span>,
            <p style={{opacity: 0.6}}>
              {moment(log?.createdAt).format('dddd, MMMM Do YYYY, h:mm:ss a')}
            </p>,
          ],
          avatar: log.user.photo || '',
          imageList: [],
        })),
      }))}
      shape="circle"
    />
  )
  return (
    <Popover
      overlayClassName="gx-popover-admin-notification activity-icon-mobile-screen"
      placement="bottomRight"
      content={userMenuOptions}
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
    >
      <div style={{position: 'relative'}}>
        <i
          className={`icon icon-chat-new gx-fs-xl`}
          style={{cursor: 'pointer'}}
        />
        {showBellCount && notificationCount > 0 && (
          <div style={notificationCountStyle}>{notificationCount}</div>
        )}
      </div>
    </Popover>
  )
}

export default ActivityInfo
