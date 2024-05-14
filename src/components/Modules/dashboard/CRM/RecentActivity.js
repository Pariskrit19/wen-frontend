import React, {useEffect, useRef, useState} from 'react'
import {Avatar, Spin, Timeline} from 'antd'
import WidgetHeader from 'components/Elements/WidgetHeader/index'
import ActivityItem from './ActivityItem'
import {selectThemeType} from 'appRedux/reducers/Settings'
import {useSelector} from 'react-redux'
import {THEME_TYPE_SEMI_DARK} from 'constants/ThemeSetting'

const TimeLineItem = Timeline.Item

function getName(task, themeType) {
  if (task.icon) {
    return (
      <Avatar
        shape={'circle'}
        className="gx-d-flex gx-align-items-center gx-justify-content-center"
        style={
          themeType === THEME_TYPE_SEMI_DARK
            ? {
                color: '#787575',
                background: '#f1f1f1',
                border: '1.5px solid #ccc',
                padding: '20px',
              }
            : {
                background: '#787575',
                color: '#f1f1f1',
                border: '1.5px solid #ccc',
                padding: '20px',
              }
        }
        icon={task.icon}
      />
    )
  } else if (!task.avatar && !task.name) {
    return <span></span>
  } else {
    if (task.avatar) {
      return (
        <Avatar shape={'circle'} className="gx-size-40" src={task.avatar} />
      )
    } else {
      let nameSplit = task.name.split(' ')
      if (task.name.split(' ').length === 1) {
        const initials = nameSplit[0].charAt(0).toUpperCase()
        return <Avatar className="gx-size-40 gx-bg-primary">{initials}</Avatar>
      } else {
        const initials =
          nameSplit[0].charAt(0).toUpperCase() +
          nameSplit[1].charAt(0).toUpperCase()
        return <Avatar className="gx-size-40 gx-bg-cyan">{initials}</Avatar>
      }
    }
  }
}

function RecentActivity(props) {
  const [isScrolled, setIsScrolled] = useState(false)

  const popUpRef = useRef()
  const scrollRef = useRef(true)

  const themeType = useSelector(selectThemeType)

  const {
    recentList,
    viewRef,
    showMore,
    isFetching,
    isFetchingNextPage,
    visible,
    iconIdName = 'admin-activity-icon',
    title = 'Recent Activities',
    isLoading = false,
  } = props

  useEffect(() => {
    if (!visible) {
      setIsScrolled(false)
      scrollRef.current = true
    }
  }, [visible])

  useEffect(() => {
    const handleScrollActivityPopUP = (e) => {
      if (scrollRef.current) {
        setIsScrolled(true)
        scrollRef.current = false
      }
    }
    const activityLogPopUp = document.getElementById(iconIdName)
    if (activityLogPopUp) {
      activityLogPopUp.addEventListener('scroll', handleScrollActivityPopUP)
    }
    return () => {
      if (activityLogPopUp) {
        return activityLogPopUp.removeEventListener(
          'scroll',
          handleScrollActivityPopUP
        )
      }
    }
  }, [visible])

  return (
    visible && (
      <div
        className="gx-entry-sec gx-dashboard-activity-popup"
        ref={popUpRef}
        id={iconIdName}
      >
        <WidgetHeader title={title} />
        {recentList?.map((activity, index) => (
          <div className="gx-timeline-info" key={'activity' + index}>
            <Timeline>
              {activity?.tasks?.map((task, index) => {
                return (
                  <TimeLineItem
                    key={'timeline' + index}
                    mode="alternate"
                    dot={getName(task, themeType)}
                  >
                    <ActivityItem
                      task={task}
                      title={title}
                      viewedBy={task?.viewedBy}
                    />
                  </TimeLineItem>
                )
              })}
            </Timeline>
          </div>
        ))}

        {isLoading && (
          <div style={{marginLeft: '12px'}}>
            <Spin></Spin>
          </div>
        )}
        {!showMore && isScrolled && (
          <span className="gx-link gx-btn-link" ref={viewRef}>
            {isFetchingNextPage || isFetching ? (
              <div style={{marginLeft: '12px'}}>
                <Spin></Spin>
              </div>
            ) : (
              'Load More'
            )}
          </span>
        )}

        {showMore && (
          <span
            className="gx-link gx-btn-link"
            style={{float: 'right'}}
            onClick={() => {
              popUpRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }}
          >
            <i className={`icon icon-chevron-up gx-fs-xl`} />
          </span>
        )}

        {!recentList ||
          recentList?.length === 0 ||
          !recentList?.[0]?.tasks ||
          (recentList?.[0]?.tasks?.length === 0 && (
            <span className="gx-link gx-btn-link">{'No notification'}</span>
          ))}
      </div>
    )
  )
}

export default RecentActivity
