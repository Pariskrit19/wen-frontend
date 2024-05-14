import React from 'react'
import DragAndDropFile from '../DragAndDropFile'

function UploadFiles({files, setFiles,maxSize}) {
  return (
    <div>
      <DragAndDropFile
        allowMultiple={false}
        files={files}
        setFiles={setFiles}
        displayType="picture"
        maxSize={maxSize}
      />
    </div>
  )
}

export default UploadFiles
