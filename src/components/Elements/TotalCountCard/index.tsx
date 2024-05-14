import React from 'react'
import Widget from 'components/Elements/Widget/index'
import {TeamOutlined} from '@ant-design/icons'

const TotalCountCard = ({
  isLink,
  totalCount,
  label,
  className = 'gx-bg-blue-cyan-gradient',
  icon: Icon = TeamOutlined,
  onClick,
}: {
  isLink?: boolean
  className?: string
  totalCount: number
  label: string
  icon?: any
  onClick?: React.MouseEventHandler<HTMLDivElement> | null
}) => {
  return (
    <Widget
      style={{height: '80%'}}
      styleName={`${className} gx-text-white gx-card-1367-p ${
        isLink ? 'gx-link' : ''
      }`}
      onClick={onClick}
    >
      <div className="gx-d-flex gx-align-items-center  gx-mb-2">
        <Icon className="gx-fs-icon-lg gx-mr-2" />
        <div>
          <h2 className="gx-text-white">{totalCount}</h2>
          <p className="gx-mb-0">{label}</p>
        </div>
      </div>
    </Widget>
  )
}

export default TotalCountCard
