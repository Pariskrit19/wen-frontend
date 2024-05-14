import React, {useState, useEffect} from 'react'
import {Popover} from 'antd'
import {useNavigate} from 'react-router-dom'
import {socket} from 'pages/Main'
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query'
import {useInView} from 'react-intersection-observer'
import {getNotifications} from 'services/notifications'
import {notificationCountStyle} from '../ActivityInfo'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {useSelector} from 'react-redux'
import moment from 'moment'
import RecentActivity from '../dashboard/CRM/RecentActivity'
import {getIsAdmin} from 'helpers/utils'
import {
  BLOG,
  NOTICEBOARD,
  COWORKERS,
  LEAVE,
  REPORTS,
  OVERTIME_REPORT,
  USER_TIME_LOG,
  LOGTIME,
} from 'helpers/routePath'
import {NOTIFICATION_ICONS} from 'constants/notification'
import useWindowsSize from 'hooks/useWindowsSize'
import RoleAccess from 'constants/RoleAccess'
import {SETTINGS} from 'helpers/routePath'

const NOTIFICATION_TO_CLICK = [
  'Blog',
  'Notice',
  'Leave',
  'User',
  'Attendance',
  'Logtime',
  'Setting_Attendance',
]

function NotificationInfo({arrowPosition}: {arrowPosition: number}) {
  const [visible, setVisible] = useState<boolean>(false)
  const {ref, inView} = useInView({threshold: 0.5})
  const [showBellCount, setShowBellCount] = useState<boolean>(false)
  const [notificationCount, setNotificationCount] = useState<number>(0)
  const {innerWidth} = useWindowsSize()
  const navigate = useNavigate()

  const {
    role: {key},
    _id,
    joinDate,
  } = useSelector(selectAuthUser)

  const {
    data,
    isFetching,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(
    ['notificationInfo', key, _id],
    async ({pageParam = 1}) => {
      const res = await getNotifications({
        page: pageParam,
        limit: 10,
        role: key,
        userId: _id,
        joinDate: joinDate,
      })
      return res
    },
    {enabled: false, keepPreviousData: false, cacheTime: 0, staleTime: 0}
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

  const handleVisibleChange = (newVisible: boolean) => {
    !getIsAdmin() && setVisible(newVisible)
  }

  useEffect(() => {
    socket.emit('get-notification-count', {_id, key, joinDate})

    socket.on('bell-notification', (response) => {
      if (response && response?.showTo?.includes(key)) {
        setShowBellCount(true)
        setNotificationCount((prev) => prev + 1)
      }
    })

    socket.on('bell-notification-for-user', (response) => {
      if (response && response?.showTo?.includes(_id)) {
        setShowBellCount(true)
        setNotificationCount((prev) => prev + 1)
      }
    })

    socket.on('send-notViewed-notification-count', (response) => {
      setShowBellCount(true)
      setNotificationCount(response)
    })
  }, [key, _id])

  useEffect(() => {
    const fetchNotifications = async () => {
      if (visible) {
        await refetch({refetchPage: (page, index) => index === 0})
        notificationCount > 0 && socket.emit('viewed-notification', {_id, key})
        setShowBellCount(false)
        setNotificationCount(0)
      }
    }
    fetchNotifications()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, _id, key])

  useEffect(() => {
    if (innerWidth < 650 && visible) {
      const popOverArrow: HTMLElement | null = document.querySelector(
        '.notification-icon-mobile-screen > .ant-popover-content > .ant-popover-arrow'
      )

      if (popOverArrow) {
        popOverArrow.style.right = `${innerWidth - arrowPosition + 20}px`
      }
    }
  }, [visible])

  const handleNotificationClick = (
    module: String,
    showTo: any[],
    extraInfo: any
  ) => {
    switch (module) {
      case 'Blog':
        navigate(BLOG)
        setVisible(false)
        return

      case 'Notice':
        navigate(NOTICEBOARD)
        setVisible(false)
        return

      case 'Leave':
        const datas = JSON.parse(extraInfo || '{}')
        if (extraInfo) {
          navigate(LEAVE, {
            state: {
              tabKey:
                datas?.tab ||
                (showTo?.includes('admin') || showTo?.includes('hr')
                  ? '3'
                  : '2'),
              leaveStatus: datas?.status,
              user: datas?.userId,
            },
          })
        }
        setVisible(false)
        return

      case 'Attendance':
        if (showTo[0] === RoleAccess.Admin) {
          navigate(SETTINGS, {state: {tabKey: '3'}})
        } else {
          navigate(LEAVE, {state: {tabKey: '2'}})
        }
        setVisible(false)
        return

      case 'User':
        navigate(COWORKERS)
        setVisible(false)
        return

      case 'Logtime':
        if (showTo[0] === RoleAccess.Admin) {
          const extraData = JSON.parse(extraInfo)
          navigate(`${REPORTS}/${OVERTIME_REPORT}`, {
            state: {
              extraData,
            },
          })
        } else {
          navigate(`${LOGTIME}/${USER_TIME_LOG}`)
        }
        setVisible(false)
        return

      default:
        return
    }
  }
  const notificationContent = (
    <RecentActivity
      title="Notifications"
      visible={visible}
      isFetching={isFetching}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      showMore={
        (data?.pageParams.length || 1) * 6 >= data?.pages[0]?.data?.data?.count
      }
      iconIdName="general-notification-icon"
      viewRef={ref}
      recentList={data?.pages.map((page, i) => ({
        id: i,
        tasks: page?.data?.data?.data
          ?.filter(
            (not: any) =>
              !not.deletedFor.find((deleted: any) => deleted.userId === _id)
          )
          .map((log: any) => ({
            id: log._id,
            name: '',
            module: log?.module,
            viewedBy: log?.viewedBy,
            title: [
              <p className="gx-notification-list-header">
                {log?.module || ''}
              </p>,
              <span
                className={
                  NOTIFICATION_TO_CLICK.includes(log?.module) ? 'gx-link' : ''
                }
                onClick={() => {
                  handleNotificationClick(
                    log?.module,
                    log?.showTo,
                    log?.extraInfo
                  )
                }}
                key={1}
              >
                {log?.remarks}
              </span>,
              <p style={{opacity: 0.6}}>
                {moment(log?.createdAt).format('dddd, MMMM Do YYYY, h:mm:ss a')}
              </p>,
            ],
            icon: NOTIFICATION_ICONS[log?.module] || '',
            imageList: [],
          })),
      }))}
      shape="circle"
    />
  )

  return (
    <Popover
      overlayClassName="gx-popover-admin-notification notification-icon-mobile-screen"
      placement="bottomRight"
      content={notificationContent}
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
    >
      <div style={{position: 'relative'}}>
        <i
          className={`icon icon-notification gx-fs-xl`}
          style={{cursor: 'pointer'}}
        />
        {showBellCount && notificationCount > 0 && (
          <div style={notificationCountStyle}>
            {notificationCount > 99 ? `99+` : notificationCount}
          </div>
        )}
      </div>
    </Popover>
  )
}

export default NotificationInfo
