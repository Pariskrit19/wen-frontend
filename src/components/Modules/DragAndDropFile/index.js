import React, {useState} from 'react'
import {InboxOutlined} from '@ant-design/icons'
import {Upload, Modal} from 'antd'
import {notification} from 'helpers/notification'

const Dragger = Upload.Dragger

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })

/*
Props Types
{
        files:[],
        setFiles:setState,
        displayType:'text' | 'picture' | 'picture-card',
        allowMultiple:boolean
} */
function DragAndDropFile({
  files,
  setFiles,
  onRemove,
  displayType = 'text',
  allowMultiple = true,
  accept = '',
  maxSize = 3,
  label = '',
  isEditMode = false,
  readOnly = false,
}) {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }

    setPreviewImage(file.url || file.preview)
    setPreviewVisible(true)
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
    )
  }

  const handleChange = (info) => {
    const file = info.file
    const isLt3M = file.size / 1024 / 1024 < maxSize
    let fileList = [...info.fileList]

    if (!isLt3M && fileList.length) {
      notification({message: `Cannot Upload size of above ${maxSize}MB `})
      fileList = info.fileList.filter((i) => i.uid !== file.uid)
    }

    if (allowMultiple) setFiles(fileList)
    else {
      const list = fileList[fileList.length - 1]
        ? [fileList[fileList.length - 1]]
        : []
      if (isEditMode && fileList.length > 0 && files[0]?.url) {
        onRemove(files[0]?.url)
      }
      setFiles(list)
    }
  }

  const handleRemove = (removed) => {
    if (!removed.url) return
    if (allowMultiple) {
      onRemove((prev) => [...prev, removed.url])
    } else onRemove(removed.url)
  }
  const handleCancel = () => setPreviewVisible(false)
  return (
    <>
      <Dragger
        beforeUpload={() => {
          return false
        }}
        listType={displayType}
        onPreview={
          (displayType === 'picture-card' || displayType === 'picture') &&
          handlePreview
        }
        fileList={files}
        onChange={handleChange}
        onRemove={handleRemove}
        accept={accept}
        disabled={readOnly}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {label ?? 'Click or drag file to this area to upload'}
        </p>
      </Dragger>
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="example" style={{width: '100%'}} src={previewImage} />
      </Modal>
    </>
  )
}

export default DragAndDropFile
