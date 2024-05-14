import React, {useEffect, useState} from 'react'
import {Button, Form, Input, Modal, Spin} from 'antd'
import {Editor} from 'react-draft-wysiwyg'
import {convertToRaw, EditorState, ContentState} from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import {THEME_TYPE_DARK} from 'constants/ThemeSetting'
import {useSelector} from 'react-redux'
import {CANCEL_TEXT} from 'constants/Common'

interface modalInterface {
  isEditMode: boolean
  toggle: boolean
  onSubmit: (input: {title: string; body: string; module: string}) => void
  onCancel: React.MouseEventHandler<HTMLElement>
  isLoading: boolean
  editData: any
}

const layout = {
  // labelCol: { span: 8 },
  // wrapperCol: { span: 16 }
}

function EmailModal({
  isEditMode,
  toggle,
  onSubmit,
  onCancel,
  isLoading,
  editData,
}: modalInterface) {
  const [editorState, seteditorState] = useState(EditorState.createEmpty())

  const [form] = Form.useForm()

  const {themeType} = useSelector((state: any) => state.settings)
  const darkMode = themeType === THEME_TYPE_DARK

  // const {TextArea} = Input

  const handleSubmit = () => {
    form.validateFields().then((values) =>
      onSubmit({
        ...values,
        body: draftToHtml(convertToRaw(editorState.getCurrentContent())),
      })
    )
  }

  useEffect(() => {
    if (toggle) {
      if (isEditMode) {
        form.setFieldValue('title', editData?.title)
        form.setFieldValue('module', editData?.module)
        const blocksFromHTML = htmlToDraft(editData?.body)
        const state = ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap
        )

        const initialState = blocksFromHTML
          ? EditorState.createWithContent(state)
          : EditorState.createEmpty()
        seteditorState(initialState)
      }
    }
    if (!toggle) {
      form.resetFields()
      seteditorState(EditorState.createEmpty())
    }
  }, [toggle])

  const onEditorStateChange = (editorStates: any) => {
    seteditorState(editorStates)
  }

  return (
    <Modal
      title={isEditMode ? `Update Email` : `Add Email`}
      visible={toggle}
      onOk={handleSubmit}
      mask={false}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          {CANCEL_TEXT}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          Submit
        </Button>,
      ]}
    >
      <Spin spinning={isLoading}>
        <Form {...layout} form={form} name="control-hooks" layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                whitespace: true,
                validator: async (rule, value) => {
                  try {
                    if (!value) {
                      throw new Error('Title is required.')
                    }
                    if (value?.trim() === '') {
                      throw new Error('Title is required.')
                    }
                  } catch (err) {
                    throw new Error(err.message)
                  }
                },
              },
            ]}
          >
            <Input
              // value={editData?.title ?? ""}
              placeholder={`Enter Email Title`}
              // onChange={handleInputChange}
            />
          </Form.Item>
          {!isEditMode && (
            <Form.Item
              name="module"
              label="Module"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  validator: async (rule, value) => {
                    try {
                      if (!value) {
                        throw new Error('Module is required.')
                      }
                      if (value?.trim() === '') {
                        throw new Error('Module is required.')
                      }
                    } catch (err) {
                      throw new Error(err.message)
                    }
                  },
                },
              ]}
            >
              <Input
                // value={editData?.title ?? ""}
                placeholder={`Enter Email Module`}
                // onChange={handleInputChange}
              />
            </Form.Item>
          )}
          <Form.Item name="body" label="Description">
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
              editorState={editorState}
              wrapperClassName="demo-wrapper"
              onEditorStateChange={onEditorStateChange}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  )
}

export default EmailModal
