import React from 'react'
import {FolderOutlined} from '@ant-design/icons'
import {Breadcrumb} from 'antd'
import {useNavigate} from 'react-router-dom'
import {PROJECTS} from 'helpers/routePath'

const LogsBreadCumb = ({slug}) => {
  const navigate = useNavigate()

  return (
    <Breadcrumb>
      <Breadcrumb.Item onClick={() => navigate(`/${PROJECTS}`)}>
        <span className="gx-link">
          <FolderOutlined />
          <span className="gx-ml-1">Projects</span>
        </span>
      </Breadcrumb.Item>
      <Breadcrumb.Item>{slug}</Breadcrumb.Item>
    </Breadcrumb>
  )
}

export default LogsBreadCumb
