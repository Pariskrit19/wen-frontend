import React from 'react'
import Widget from 'components/Elements/Widget'
import {contactList} from '../../../../routes/socialApps/Profile/data'
import {PhoneOutlined} from '@ant-design/icons'

const Contact = ({user}) => {
  return (
    <Widget title="Contact" styleName="gx-card-profile-sm">
      {contactList(user).map((data, index) => {
        let actualData = 0
        if (typeof data?.value === 'number') {
          actualData = data?.value
        } else {
          actualData = data?.value?.map((item, ind) => (
            <span key={ind}>{item}</span>
          ))
        }
        if (!data.value) {
          return null
        }
        return (
          <div
            key={index}
            className="gx-media gx-align-items-center gx-flex-nowrap gx-pro-contact-list "
          >
            <div className="gx-mr-3">
              {data.icon === 'phone' ? (
                <span className="icon  gx-fs-xxl gx-text-grey">
                  <PhoneOutlined className="rotate" />
                </span>
              ) : (
                <i
                  className={`icon icon-${data?.icon} gx-fs-xxl gx-text-grey`}
                />
              )}
            </div>
            <div className="gx-media-body max-two-lines">
              <span className="gx-mb-0 gx-text-grey gx-fs-sm">
                {data?.title}
              </span>
              <p className="gx-mb-0">{actualData}</p>
            </div>
          </div>
        )
      })}
    </Widget>
  )
}

export default Contact
