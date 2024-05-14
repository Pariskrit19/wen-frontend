import React, {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Alert, Button, Modal, Spin} from 'antd'
import DragAndDropFile from 'components/Modules/DragAndDropFile'
import {
  getUserPosition,
  getUserRoles,
  importUsers,
} from 'services/users/userDetails'
import {MmDdYyyyValidator, csvFileToArray} from 'helpers/utils'
import {notification} from 'helpers/notification'
import {CANCEL_TEXT} from 'constants/Common'
import {emailRegex} from 'constants/EmailTest'
import {officeDomain} from 'constants/OfficeDomain'

const validFiles = ['application/vnd.ms-excel', 'text/csv']

function ImportUsers({toggle, onClose, files, setFiles}) {
  const fileReader = new FileReader()

  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const {data: roles} = useQuery(['roles'], getUserRoles)
  const {data: positions} = useQuery(['positions'], getUserPosition)

  const rolesList = roles?.data?.data?.data?.map((role) => role.value)
  const positionsList = positions?.data?.data?.data?.map((pos) => pos.name)

  const mutation = useMutation((usersToImport) => importUsers(usersToImport), {
    onSuccess: (response) => {
      if (response.status) {
        notification({
          message: 'Users Imported Successfully',
          type: 'success',
        })

        queryClient.invalidateQueries(['users'])
        handleCancel()
      } else {
        notification({
          message: response?.data?.message || 'Import Failed',
          type: 'error',
        })
      }
    },
    onError: () => {
      notification({message: 'Import Failed', type: 'error'})
    },
    onSettled: () => {
      setLoading(false)
    },
  })
  const handleCancel = () => {
    onClose()
    setFiles([])
  }

  const handleSubmit = () => {
    if (files.length === 0) return
    try {
      setLoading(true)
      const file = files[0]?.originFileObj
      if (file) {
        fileReader.onload = function (event) {
          const csvOutput = csvFileToArray(event.target.result)
          let csvIsValid = true

          //checking empty files
          if (!csvOutput?.length) {
            csvIsValid = false
            notification({
              message: `Please ensure that the file contains user data.`,
              type: 'error',
            })
            setTimeout(() => setLoading(false), 2000)
            return
          }

          csvOutput.forEach((item) => {
            //checking validity of name for each import item
            const nameRegex = /^[A-Za-z ]+$/
            if (!nameRegex.test(item?.name)) {
              csvIsValid = false
              notification({
                message: `Invalid Name: ${item.name}`,
                type: 'error',
              })
              setTimeout(() => setLoading(false), 2000)
              return
            }

            //checking validity of email for each import item
            if (!emailRegex.test(item?.email?.trim())) {
              csvIsValid = false
              notification({
                message: `Invalid Email: ${item.email}`,
                type: 'error',
              })
              setTimeout(() => setLoading(false), 2000)
              return
            }

            //checking if email is office email
            if (item.email.split('@')[1].trim() !== officeDomain) {
              csvIsValid = false
              notification({
                message: `Please use office email: ${item.email}`,
                type: 'error',
              })
              setTimeout(() => setLoading(false), 2000)
              return
            }

            //checking phone number validity
            const mobileRegex = /(?:\(?\+977\)?)?[9][6-9]\d{8}|01[-]?[0-9]{7}/
            if (
              !mobileRegex.test(item.primaryphone) ||
              item.primaryphone.length > 10
            ) {
              csvIsValid = false
              notification({
                message: `Please use a valid phone number: ${item.primaryphone}`,
                type: 'error',
              })
              setTimeout(() => setLoading(false), 2000)
              return
            }
            //checking roles validity (can be empty but if not empty then has to be one of the defined roles)

            if (!(item.role === '' || rolesList.includes(item.role))) {
              csvIsValid = false
              notification({
                message: `Invalid Role: ${item.role}`,
                type: 'error',
              })
              setTimeout(() => setLoading(false), 2000)
              return
            }

            //checking position validity (can be empty but if not empty then has to be one of the defined roles)

            if (
              !(item.position === '' || positionsList.includes(item.position))
            ) {
              csvIsValid = false
              notification({
                message: `Invalid Position: ${item.position}`,
                type: 'error',
              })
              setTimeout(() => setLoading(false), 2000)
              return
            }

            //checking dob validation
            if (!MmDdYyyyValidator(item.dob)) {
              csvIsValid = false
              notification({
                message: `Invalid Date of Birth: ${item.dob}`,
                type: 'error',
              })
              setTimeout(() => setLoading(false), 2000)
              return
            }

            // checking joindate validation
            if (!MmDdYyyyValidator(item.joindate)) {
              csvIsValid = false
              notification({
                message: `Invalid Join Date: ${item.joindate}`,
                type: 'error',
              })
              setTimeout(() => setLoading(false), 2000)
              return
            }
          })

          if (csvIsValid) {
            mutation.mutate(csvOutput)
          }
        }

        fileReader.readAsText(file)
      }
    } catch (error) {
      notification({message: 'Import Failed', type: 'error'})

      setLoading(false)
    }
  }

  const isFileVlaid =
    files.length !== 0 && !validFiles.includes(files[0]?.originFileObj.type)

  return (
    <Modal
      title={'Import Co-workers'}
      visible={toggle}
      onOk={handleSubmit}
      onCancel={handleCancel}
      mask={false}
      footer={[
        <Button key="back" onClick={handleCancel}>
          {CANCEL_TEXT}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={loading || isFileVlaid}
        >
          Import
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <DragAndDropFile
          allowMultiple={false}
          files={files}
          setFiles={setFiles}
          label={'Click or drag valid CSV file to this area to upload'}
        />
      </Spin>

      {isFileVlaid && (
        <Alert
          style={{marginTop: '20px'}}
          message="Invalid File! Please provide valid CSV file"
          type="error"
          showIcon
        />
      )}
    </Modal>
  )
}
export default ImportUsers
