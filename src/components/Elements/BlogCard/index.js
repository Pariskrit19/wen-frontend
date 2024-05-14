import React, {useEffect, useState} from 'react'
import {Popconfirm, Tag} from 'antd'
import {EditOutlined, DeleteOutlined} from '@ant-design/icons'
import moment from 'moment'
import parse from 'html-react-parser'

import {Link, useNavigate} from 'react-router-dom'
import {getIsAdmin} from 'helpers/utils'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'

const BlogItem = ({blog, grid, removeBlog, access}) => {
  const {title, content, createdBy, createdAt, blogCategories, _id, slug} = blog

  const navigate = useNavigate()

  const removedCodeContent = content
    ?.split('@highlight-code')
    ?.filter((item, index) => index % 2 === 0)
    .join('')

  const [parsedContent, setParsedContent] = useState(
    parse(removedCodeContent.substring(0, 400))
  )
  const {
    role: {permission: {Blog} = {}},
  } = useSelector(selectAuthUser)
  const [filteredContent, setFilteredContent] = useState('')
  const [parserResetter, setParserResetter] = useState(true)
  const parser = () => {
    if (parsedContent?.length && typeof parsedContent === 'object') {
      const contents = parsedContent
        .filter((item) => item?.type !== 'img')
        .filter((item) => item !== '\n')
        .filter((item) => item?.props?.children !== null)

      const contents1 = contents.filter((item) => {
        if (typeof item?.props?.children === 'string') {
          if (item.props.children.trim() !== '') {
            return item
          } else {
            return null
          }
        } else {
          return item
        }
      })

      setFilteredContent(contents1)
      if (contents1.length === 0 && parserResetter) {
        setParserResetter(false)
        setParsedContent(
          parse(content.substring(400, content.length)).slice(1, 3)
        )
      }
    } else {
      setFilteredContent(parsedContent)
    }
  }
  useEffect(() => {
    parser()
  }, [parsedContent])

  return (
    <div
      className={`gx-product-item  ${
        grid ? 'gx-product-vertical ' : 'gx-product-horizontal '
      } ${moment() < moment(createdAt).add(1, 'days') ? 'latest-events' : ''}
      `}
    >
      {/* {imgSrc && (
        <div className="gx-product-image" >
          <div className="gx-grid-thumb-equal">
            <span className="gx-link gx-grid-thumb-cover">
              <img alt="blogPicture" src={imgSrc} width={300} height={200} onClick={() => navigate(`${_id}-${slug}`)}/>
            </span>
          </div>
        </div>
      )} */}
      <div className="gx-product-body">
        <h3
          className="gx-product-title clickable-title"
          onClick={Blog?.viewBlog ? () => navigate(`${_id}-${slug}`) : () => {}}
        >
          {title}
        </h3>
        <div className="ant-row-flex">
          <small className="gx-text-grey">
            <EditOutlined />
            {' ' + createdBy.name} - {moment(createdAt).format('LL')}
          </small>
          <h6 className="gx-text-success gx-mb-1 gx-mt-1">
            {blogCategories?.map((x) => (
              <Tag color="cyan" key={x._id}>
                {x.name}
              </Tag>
            ))}
          </h6>
        </div>

        <div>
          {filteredContent}...
          {Blog?.viewBlog && (
            <Link to={`${_id}-${slug}`} className="read-more-dark">
              {' '}
              Read More
            </Link>
          )}
        </div>
      </div>
      <div className="gx-footer gx-d-flex gx-justify-content-end ">
        {access && !getIsAdmin() && (
          <Popconfirm
            title="Are you sure to delete this Blog?"
            onConfirm={() => removeBlog(_id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined
              style={{
                color: 'red',
                marginRight: '0.5rem',
                marginBottom: '0.5rem',
              }}
            />
          </Popconfirm>
        )}
      </div>
    </div>
  )
}

export default BlogItem
