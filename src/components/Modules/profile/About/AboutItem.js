import {HomeOutlined} from '@ant-design/icons'
import React from 'react'
import Auxiliary from 'util/Auxiliary'

const AboutItem = ({data}) => {
  const {title, icon, desc, userList} = data
  return (
    <Auxiliary>
      <div className="gx-media gx-flex-nowrap gx-mt-3 gx-mt-lg-4 gx-mb-2">
        <div className="gx-mr-3">
          {icon === 'home' ? (
            <span className="icon gx-fs-xlxl gx-text-orange">
              <HomeOutlined />
            </span>
          ) : (
            <i className={`icon icon-${icon} gx-fs-xlxl gx-text-orange`} />
          )}
        </div>
        <div className="gx-media-body">
          <h6 className="gx-mb-1 gx-text-grey">{title}</h6>
          {userList === '' ? null : userList}
          {desc === '' ? null : <p className="gx-mb-0">{desc}</p>}
        </div>
      </div>
    </Auxiliary>
  )
}

export default AboutItem
