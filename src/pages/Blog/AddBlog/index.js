import React, {useEffect, useRef, useState} from 'react'
import {Button, Card, Dropdown, Form, Input, Select, Spin} from 'antd'
import {ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage'
import {
  convertToRaw,
  EditorState,
  ContentState,
  convertFromRaw,
  RichUtils,
} from 'draft-js'
import htmlToDraft from 'html-to-draftjs'
import {Editor} from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import {CameraOutlined, RollbackOutlined} from '@ant-design/icons'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import {useMutation, useQuery} from '@tanstack/react-query'
import {addBlog, getBlog, updateBlog} from 'services/blog'
import {filterOptions, handleResponse, scrollForm} from 'helpers/utils'
import {notification} from 'helpers/notification'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {BLOG} from 'helpers/routePath'
import AddMediaModel from 'components/Modules/AddMediaModal'
import CircularProgress from 'components/Elements/CircularProgress/index'
import {storage} from 'firebase'
import {THEME_TYPE_DARK} from 'constants/ThemeSetting'
import {useSelector} from 'react-redux'
import {socket} from 'pages/Main'
import RoleAccess from 'constants/RoleAccess'
import {BLOG_LANGUAGES_LIST} from 'constants/BlogLanguages'
import {getBlogCategories} from 'services/settings/blog'

function CustomToolbar(props) {
  const {editorState, setEditorState} = props
  const addCodeSnippet = (e) => {
    e.preventDefault()

    const sampleMarkup = `
    <p>@highlight-code</p>\n\n\n<p>@highlight-code</p>
    `
    const html = `${draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    )}${sampleMarkup}
    `
    const blocksFromHTML = htmlToDraft(html)
    const state = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    )

    const initialState = EditorState.createWithContent(state)
    setEditorState(initialState)
  }

  return (
    <div>
      <a
        className="codeSnippetBtn"
        onClick={(e) => addCodeSnippet(e)}
        onKeyDown={() => {}}
      >
        Add code snippet.
      </a>
    </div>
  )
}

function AddBlog() {
  // init state

  const [editorState, seteditorState] = useState(EditorState.createEmpty())
  const [submitting, setSubmitting] = useState(false)
  const [openMedia, setopenMedia] = useState(false)
  const [noContent, setNoContent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(null)
  const {themeType} = useSelector((state) => state.settings)
  const darkMode = themeType === THEME_TYPE_DARK

  const [form] = Form.useForm()
  // init hooks
  const navigate = useNavigate()
  const {blogId} = useParams()

  const blogRef = useRef(true)

  const bid = blogId?.split('-')[0]

  const {data, isLoading, refetch} = useQuery(
    ['singleBlog', bid],
    () => getBlog(bid),
    {
      enabled: false,
    }
  )

  const {data: catogories} = useQuery(['blogCatogories'], () =>
    getBlogCategories()
  )

  const addBlogMutation = useMutation((details) => addBlog(details), {
    onSuccess: (response) => {
      handleResponse(
        response,
        'Added Blog successfully',
        'Could not add Blog',
        [
          () => {
            socket.emit('add-blog', {
              showTo: Object.values(RoleAccess),
              remarks: `New blog has been added.`,
              module: 'Blog',
            })
          },
          () => {
            navigate(`/${BLOG}`)
          },
          () => {},
        ]
      )
    },

    onError: () =>
      notification({
        message: 'Could not add Bog!',
        type: 'error',
      }),
    onSettled: () => {
      setSubmitting(false)
    },
  })

  const updateBlogMutation = useMutation(
    (details) => updateBlog(bid, details),
    {
      onSuccess: (response) =>
        handleResponse(
          response,
          'Updated Blog successfully',
          'Could not update Blog',
          [
            () => {
              navigate(`/${BLOG}`)
            },
            () => {},
          ]
        ),

      onError: () =>
        notification({
          message: 'Could not update Bog!',
          type: 'error',
        }),
      onSettled: () => {
        setSubmitting(false)
      },
    }
  )

  useEffect(() => {
    if (bid) {
      refetch()
    }
  }, [bid, refetch])

  useEffect(() => {
    // fill editor with inital state in edit mode
    if (bid && data && blogRef.current) {
      const blocksFromHTML = htmlToDraft(data?.data?.data?.data?.[0]?.content)
      const state = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      )
      const initialState = blocksFromHTML
        ? EditorState.createWithContent(state)
        : EditorState.createEmpty()
      seteditorState(initialState)
      blogRef.current = false
    }
  }, [bid, data])

  const onEditorStateChange = (editorStates) => {
    seteditorState(editorStates)
  }

  const submitBlog = (formData) => {
    const rawContent = convertToRaw(editorState.getCurrentContent())
      ?.blocks?.map((block) => block?.text)
      .join('')

    //Checking if the code snippet is blank or not
    const higlightSplittedContent = rawContent.split('@highlight-code')
    const requiredSnippetContents = higlightSplittedContent
      ?.slice(1, -1)
      .filter((d, i) => i % 2 === 0)
    const isSnippetContentPresent = requiredSnippetContents?.every((content) =>
      Boolean(content.trim())
    )

    const replacedRawContent = rawContent.replace(/@highlight-code/g, '')

    if (rawContent === '') {
      setNoContent(true)
      return
    } else {
      setNoContent(false)
      if (replacedRawContent.trim().length < 9) {
        notification({
          message: `Content Must be at least 10 characters ${
            rawContent.trim().length >= 9 ? 'excluding @highlight-code' : ''
          }`,
          type: 'error',
        })
        return
      }
      if (!isSnippetContentPresent) {
        notification({
          message: `Code snippet content shouldn't be empty.`,
          type: 'error',
        })
        return
      }
      setSubmitting(true)

      const formattedData = draftToHtml(
        convertToRaw(editorState.getCurrentContent())
      )?.split(/<\/?p>/)

      const isMultiple = formattedData.some(
        (d) => d?.match(/@highlight-code/g)?.length > 1
      )
      let isPageBreak

      if (!isMultiple) {
        const filteredItems = formattedData.filter((d) =>
          d.includes('@highlight-code')
        )
        const pattern = /@highlight-code\s*(&nbsp;|\s|\n)*$/
        isPageBreak = filteredItems.some((d) => {
          const splittedCode = d?.split(' ')
          if (splittedCode.length > 1) {
            const indexHighlight = splittedCode.findIndex((item) =>
              item.includes('@highlight-code')
            )
            return !(
              indexHighlight === splittedCode.length - 1 &&
              pattern.test(splittedCode[indexHighlight])
            )
          } else {
            return !pattern.test(splittedCode[0])
          }
        })
      }

      if (isMultiple || isPageBreak) {
        setSubmitting(false)
        return notification({
          message:
            'Insert highlighted code within the opening and closing tags.',
          type: 'error',
        })
      }

      const regex = /<img[^>]*\/?>/g
      const tempContent = draftToHtml(
        convertToRaw(editorState.getCurrentContent())
      )

      const finalContent = tempContent.replace(regex, (match) => {
        const floatRegex = /float\s*:\s*(left|right|none);?/i
        const floatMatch = match.match(floatRegex)
        if (floatMatch) {
          const floatPropertyValue = floatMatch[1]
          if (floatPropertyValue === 'none') {
            return `<div style="display:flex;justify-content:center;">${match}</div>`
          } else {
            return `<div style="overflow:hidden">${match}</div>\n`
          }
        }
      })

      if (bid) {
        updateBlogMutation.mutate({
          ...formData,
          content: finalContent,
        })
      } else {
        addBlogMutation.mutate({
          ...formData,
          content: finalContent,
        })
      }
    }
  }

  const handleCanelMedia = () => {
    setopenMedia(false)
  }

  const handleInsertMedia = (files) => {
    if (!files.length) return

    if (files.every((file) => file.type.split('/')[0] !== 'image')) {
      notification({message: 'Please add images only', type: 'info'})
      return
    }
    setLoading(true)

    const storageRef = ref(storage, `blogs/${files[0].originFileObj.name}`)

    const uploadTask = uploadBytesResumable(storageRef, files[0].originFileObj)

    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const pg = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setProgress(() => pg)
      },
      (error) => {
        // Handle unsuccessful uploads
        setLoading(false)
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setLoading(false)

          const html = `${draftToHtml(
            convertToRaw(editorState.getCurrentContent())
          )}<p></p>
					<img src=${downloadURL} alt="undefined" style="float:left;height: auto;width: auto"/>
					  <p></p>`
          const blocksFromHTML = htmlToDraft(html)
          const state = ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap
          )

          const initialState = EditorState.createWithContent(state)

          seteditorState(initialState)
          handleCanelMedia()
        })
      }
    )
  }

  if (isLoading && bid) {
    return <CircularProgress />
  }

  return (
    <div className="blog-container">
      <Card
        title={
          <div>
            <Link to={`/${BLOG}`}>
              <RollbackOutlined />
            </Link>
            <span className="gx-ml-2">{bid ? 'Update Blog' : 'Add Blog'}</span>
          </div>
        }
      >
        <Spin spinning={submitting}>
          <Form
            layout="vertical"
            onFinish={submitBlog}
            initialValues={{
              title: data?.data?.data?.data?.[0].title || '',
              blogCategories:
                data?.data?.data?.data?.[0].blogCategories.map((x) => x._id) ||
                undefined,
            }}
            form={form}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[
                {
                  required: true,
                  validator: async (rule, value) => {
                    try {
                      if (!value) {
                        throw new Error(`Title is required.`)
                      }
                      if (value?.trim() === '') {
                        throw new Error(`Please enter a valid title.`)
                      }
                    } catch (err) {
                      scrollForm(form, 'title')
                      throw new Error(err.message)
                    }
                  },
                },
              ]}
              hasFeedback
            >
              <Input />
            </Form.Item>

            <Form.Item name="content" label="Content">
              <>
                <Button
                  type="primary"
                  className="gx-btn-form gx-btn-primary gx-text-white gx-mt-auto"
                  htmlType="button"
                  icon={<CameraOutlined />}
                  onClick={() => {
                    setopenMedia(true)
                  }}
                >
                  Add Media
                </Button>
                <Editor
                  editorStyle={{
                    width: '100%',
                    minHeight: 500,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: 'lightgray',
                    background: darkMode ? '#434f5a' : 'white',
                    color: darkMode ? '#e0e0e0' : 'black',
                  }}
                  handlePastedText={() => false}
                  editorState={editorState}
                  wrapperClassName="demo-wrapper"
                  onEditorStateChange={onEditorStateChange}
                  toolbarCustomButtons={[
                    <CustomToolbar setEditorState={seteditorState} />,
                  ]}
                />
              </>
            </Form.Item>
            {noContent && (
              <p className="suggestion-text">
                Content is required. Please enter some valid content.
              </p>
            )}
            <Form.Item name="blogCategories" label="Categories">
              <Select
                showSearch
                filterOption={filterOptions}
                placeholder="Select Categories"
                mode="multiple"
                size="large"
              >
                {catogories?.data?.data?.data?.map((tag) => (
                  <Select.Option value={tag._id} key={tag._id}>
                    {tag.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
              >
                Publish
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>

      <AddMediaModel
        loading={loading}
        progress={progress}
        toogle={openMedia}
        handleCancel={handleCanelMedia}
        handleSubmit={handleInsertMedia}
        maxSize={6}
      />
    </div>
  )
}

export default AddBlog
