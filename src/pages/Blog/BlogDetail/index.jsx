import React from 'react'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {prism} from 'react-syntax-highlighter/dist/esm/styles/prism'
import {docco} from 'react-syntax-highlighter/dist/esm/styles/hljs'
import {useNavigate, useParams} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Button, Card} from 'antd'
import HTMLReactParser from 'html-react-parser'
import {EditOutlined} from '@ant-design/icons'
import {getBlog} from 'services/blog'
import BlogsBreadCumb from './BlogsBreadCumb'
import CircularProgress from 'components/Elements/CircularProgress'
import moment from 'moment'
import {useSelector} from 'react-redux'
import {THEME_TYPE_DARK} from 'constants/ThemeSetting'
import {getIsAdmin} from 'helpers/utils'
import {selectAuthUser} from 'appRedux/reducers/Auth'

function Detail() {
  // init hooks
  const {blog} = useParams()
  const navigate = useNavigate()
  const {themeType} = useSelector((state) => state.settings)
  const darkTheme = themeType === THEME_TYPE_DARK

  const [blogId] = blog.split('-')

  const {
    role: {permission: {Blog} = {}},
  } = useSelector(selectAuthUser)

  const {data, isLoading} = useQuery(['singleBlog', blogId], () =>
    getBlog(blogId)
  )

  const BLOG = data?.data?.data?.data?.[0]
  const access = Blog?.editBlog

  const handleEdit = () => {
    navigate(`/blog/edit-blog/${blog}`)
  }

  if (isLoading) {
    return <CircularProgress />
  }

  const mainArray = BLOG?.content?.split?.('@highlight-code')
  return (
    <div>
      <BlogsBreadCumb slug={BLOG?.title} />
      <div style={{marginTop: 20}}></div>
      <Card
        title={
          <>
            <div className="gx-d-flex gx-justify-content-between gx-flex-row">
              <div>
                <div>
                  <h2>{BLOG?.title}</h2>
                </div>
                <small className="gx-text-grey gx-mr-3">
                  <EditOutlined />
                  {' ' + BLOG?.createdBy?.name} -{' '}
                  {moment(BLOG?.createdAt).format('LL')}
                </small>
              </div>
              {access && (
                <Button
                  type="primary"
                  onClick={handleEdit}
                  className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                  disabled={getIsAdmin()}
                >
                  Edit
                </Button>
              )}
            </div>
          </>
        }
      >
        {mainArray?.map((item, index) => {
          let formattedItem = item
          if (index % 2 !== 0) {
            let parsedArray = Array.isArray(
              HTMLReactParser(formattedItem || '')
            )
              ? HTMLReactParser(formattedItem || '')?.filter(
                  (el) => typeof el !== 'string'
                )
              : []
            if (
              typeof parsedArray?.[0]?.props?.children === 'string' &&
              parsedArray?.[0]?.props?.children?.includes('@language')
            ) {
              parsedArray = parsedArray.filter((item, index) => index !== 0)
            }

            if (
              !parsedArray?.[parsedArray.length - 1]?.props?.children ||
              parsedArray?.[parsedArray.length - 1]?.props?.children?.trim() ===
                ''
            ) {
              parsedArray.pop()
            }

            const parsedString = parsedArray
              .map((item) => {
                if (
                  item?.props &&
                  index !== 0 &&
                  typeof item?.props?.children === 'string' &&
                  item?.props?.children?.trim() !== ''
                ) {
                  return item.props.children
                } else if (
                  typeof item?.props?.children === 'object' &&
                  typeof item?.props?.children?.props?.children === 'string'
                ) {
                  return item.props.children.props.children?.trim()
                } else return null
              })
              .join('\n')

            return (
              <div key={index}>
                <SyntaxHighlighter
                  language="html"
                  style={darkTheme ? docco : prism}
                  showLineNumbers
                >
                  {parsedString}
                </SyntaxHighlighter>
              </div>
            )
          } else {
            return <div key={index}>{HTMLReactParser(item || '')}</div>
          }
        })}
      </Card>
    </div>
  )
}

export default Detail
