import React from 'react'
import {ContainerTwoTone} from '@ant-design/icons'
import {Breadcrumb} from 'antd'
import {useNavigate} from 'react-router-dom'
import {BLOG} from 'helpers/routePath'

const LogsBreadCumb = ({slug}) => {
  const navigate = useNavigate()

  return (
    <Breadcrumb>
      <Breadcrumb.Item onClick={() => navigate(`/${BLOG}`)}>
        <span className="gx-link">
          <ContainerTwoTone />
          <span className="gx-ml-1">Blogs</span>
        </span>
      </Breadcrumb.Item>
      <Breadcrumb.Item>{slug}</Breadcrumb.Item>
    </Breadcrumb>
  )
}

export default LogsBreadCumb
