import React, {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card} from 'antd'
import SettingTable from '../CommonTable'
import {LOGTYPE_COLUMN} from 'constants/Settings'
import {addLogType, deleteLogType, editLogType} from 'services/settings/logTime'
import {getIsAdmin, handleResponse} from 'helpers/utils'
import {notification} from 'helpers/notification'
import CommonLogTypeModal from '../CommonLogTypeModal'
import {getLogTypes} from 'services/timeLogs'

function Logtime() {
  const queryClient = useQueryClient()
  const [type, setType] = useState('')
  const [arrayDataToSend, setArrayDataToSend] = useState<any>([])
  const [openModal, setOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [displayColorPicker, setDisplayColorPicker] = useState(false)
  const [duplicateValue, setDuplicateValue] = useState<boolean>(false)
  const [hexCode, setHexCode] = useState<string>('')
  const [dataToEdit, setDataToEdit] = useState<any>({})

  const {data: logTypes, isLoading}: any = useQuery(['logTypes'], getLogTypes)

  const addLogTypeMutation = useMutation(addLogType, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Log type added successfully',
        'Log type add failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['logTypes'])]
      ),
    onError: (error) => {
      notification({
        message: 'Log type add failed!',
        type: 'error',
      })
    },
  })
  const deleteLogTypeMutation = useMutation(deleteLogType, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Log type deleted successfully',
        'Log type deletion failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['logTypes'])]
      ),
    onError: (error) => {
      notification({
        message: 'Log Type deletion failed!',
        type: 'error',
      })
    },
  })

  const editLogTypeMutation = useMutation(editLogType, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Log type updated successfully',
        'Log type update failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['logTypes'])]
      ),
    onError: (error) => {
      notification({
        message: 'Log type update failed!',
        type: 'error',
      })
    },
  })

  const handleAddClick = (name: string, color: string) => {
    addLogTypeMutation.mutate({name: name, color: color})
  }

  const handleEditClick = (name: string, color: string) => {
    editLogTypeMutation.mutate({id: dataToEdit?._id, name: name, color: color})
  }

  const handleDeleteClick = (data: any, type: string) => {
    deleteLogTypeMutation.mutate({id: data._id})
  }

  const handleOpenEditModal = (data: any, type: string, currentData: any) => {
    setType(type)
    setIsEditMode(true)
    setOpenModal(true)
    setDataToEdit(data)
    setArrayDataToSend(currentData)
  }

  const handleCloseModal = () => {
    setIsEditMode(false)
    setDuplicateValue(false)
    setHexCode('')
    setDataToEdit({})
    setDisplayColorPicker(false)
    setOpenModal(false)
  }
  const handleOpenModal = (type: string, data: any) => {
    setType(type)
    setArrayDataToSend(data)
    setOpenModal(true)
  }

  return (
    <>
      {openModal && (
        <CommonLogTypeModal
          toggle={openModal}
          type={type}
          duplicateValue={duplicateValue}
          hexCode={hexCode}
          setHexCode={setHexCode}
          setDuplicateValue={setDuplicateValue}
          displayColorPicker={displayColorPicker}
          setDisplayColorPicker={setDisplayColorPicker}
          currentData={arrayDataToSend}
          isEditMode={isEditMode}
          editData={dataToEdit}
          isLoading={
            addLogTypeMutation.isLoading || editLogTypeMutation.isLoading
          }
          onSubmit={isEditMode ? handleEditClick : handleAddClick}
          onCancel={handleCloseModal}
        />
      )}

      <Card
        title="Log Type"
        extra={
          <Button
            className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
            onClick={() => handleOpenModal('Log Type', logTypes)}
            disabled={getIsAdmin()}
          >
            Add
          </Button>
        }
      >
        <SettingTable
          data={logTypes?.data?.data?.data}
          columns={LOGTYPE_COLUMN(
            (value) => handleDeleteClick(value, 'Log Type'),
            (value) => handleOpenEditModal(value, 'Log Type', logTypes)
          )}
          onAddClick={() => handleOpenModal('Log Type', logTypes)}
          isLoading={isLoading || deleteLogTypeMutation.isLoading}
        />
      </Card>
    </>
  )
}

export default Logtime
