import React, {useEffect, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card} from 'antd'
import Collapse from 'components/Elements/Collapse'
import CircularProgress from 'components/Elements/CircularProgress'
import {
  addPolicies,
  deletePolicies,
  editPolicies,
  getAllPolicies,
} from 'services/resources'
import {notification} from 'helpers/notification'
import CommonResourceModal from 'pages/Settings/CommonResourceModal'
import {getIsAdmin, handleResponse} from 'helpers/utils'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'

function Policy() {
  const {data, isLoading, isError} = useQuery(['policies'], getAllPolicies)
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [type, setType] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [dataToEdit, setDataToEdit] = useState({})
  const {
    role: {
      permission: {Resources},
    },
  } = useSelector(selectAuthUser)

  useEffect(() => {
    if (isError) {
      notification({message: 'Could not load Users!', type: 'error'})
    }
  }, [isError])

  const addPolicyMutation = useMutation(addPolicies, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Policy added successfully',
        'Policy add failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['policies'])]
      ),
    onError: (error) => {
      notification({
        message: 'Policy add failed!',
        type: 'error',
      })
    },
  })

  const deletePolicyMutation = useMutation(deletePolicies, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Policy deleted successfully',
        'Policy deletion failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['policies'])]
      ),
    onError: (error) => {
      notification({
        message: 'Policy deletion failed!',
        type: 'error',
      })
    },
  })

  const editPolicyMutation = useMutation(editPolicies, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Policy updated successfully',
        'Policy update failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['policies'])]
      ),
    onError: (error) => {
      notification({
        message: 'Policy update failed!',
        type: 'error',
      })
    },
  })

  if (isLoading) {
    return <CircularProgress />
  }
  const handleOpenEditModal = (data, type) => {
    setType(type)
    setIsEditMode(true)
    setOpenModal(true)
    setDataToEdit(data)
  }

  const handleOpenModal = (type) => {
    setType(type)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setIsEditMode(false)
    setDataToEdit({})
    setOpenModal(false)
  }
  const handleDeleteClick = (data) => {
    deletePolicyMutation.mutate({id: data?._id})
  }

  const handleEditClick = (input) => {
    editPolicyMutation.mutate({
      id: dataToEdit?._id,
      title: input?.title,
      content: input?.content,
    })
  }
  const handleAddClick = (input) => {
    addPolicyMutation.mutate({title: input?.title, content: input?.content})
  }

  return (
    <>
      {openModal && (
        <CommonResourceModal
          toggle={openModal}
          type={type}
          isEditMode={isEditMode}
          editData={dataToEdit}
          isLoading={addPolicyMutation.isLoading}
          onSubmit={isEditMode ? handleEditClick : handleAddClick}
          onCancel={handleCloseModal}
        />
      )}
      <Card
        title="Policy"
        extra={
          Resources?.createPolicy && !getIsAdmin() ? (
            <Button
              className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
              onClick={() => handleOpenModal('Policy')}
              disabled={getIsAdmin()}
            >
              Add
            </Button>
          ) : null
        }
      >
        <Collapse
          data={data?.data?.data?.data}
          onEditClick={handleOpenEditModal}
          onDeleteClick={handleDeleteClick}
          type="Policy"
          isEditable={Resources?.editPolicy}
          isDeletable={Resources?.deletePolicy}
        />
      </Card>
    </>
  )
}

export default Policy
