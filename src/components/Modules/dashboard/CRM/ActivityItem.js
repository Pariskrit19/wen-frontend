import React from 'react'
import {Avatar, Divider} from 'antd'
import Auxiliary from 'util/Auxiliary'

const ActivityItem = ({task, title = '', viewedBy = []}) => {
  const userId = localStorage.getItem('user_id') || ''
  const formattedId = userId.replaceAll('"', '')
  const displayTitle = title ? task?.title : task?.title?.[0]?.props?.children
  return (
    <Auxiliary>
      <div className={`gx-d-flex flexStyle-notification`}>
        <div>
          <div
            className={
              title === 'Notifications' && !viewedBy?.includes(formattedId)
                ? 'unseen-Notifications'
                : ''
            }
          >
            {displayTitle?.map((item, index) => (
              <div key={index}>{item}</div>
            ))}
          </div>

          {task?.imageList?.length > 0 ? (
            <ul className="gx-list-inline gx-mb-3 gx-mt-2">
              {task?.imageList?.map((image, index) => {
                if (index === 2) {
                  return (
                    <li className="gx-mb-1" key={index}>
                      <span className="gx-link gx-img-more">
                        {' '}
                        +{task?.imageList.length - 2} More
                      </span>
                    </li>
                  )
                } else if (index > 2) {
                  return null
                } else {
                  return (
                    <li className="gx-mb-1" key={index}>
                      <Avatar
                        shape="square"
                        className="gx-size-40"
                        src={image}
                      />
                    </li>
                  )
                }
              })}
            </ul>
          ) : null}
        </div>
        {title === 'Notifications' && !viewedBy?.includes(formattedId) && (
          <div className="circle ml-2"></div>
        )}
      </div>
      <div
        className={
          title === 'Notifications' || title === 'Recent Activities'
            ? 'notificationDivider'
            : ''
        }
      >
        <Divider />
      </div>
    </Auxiliary>
  )
}

export default ActivityItem
