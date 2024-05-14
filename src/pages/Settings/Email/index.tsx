import React, {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card, Col, Row} from 'antd'
import SettingTable from '../CommonTable'
import {EMAIL_COLUMN} from 'constants/Settings'
import {getIsAdmin, handleResponse} from 'helpers/utils'
import {notification} from 'helpers/notification'
import EmailModal from './EmailModel'
import {
  addEmail,
  deleteEmail,
  editEmail,
  getEmails,
} from 'services/settings/email'

function Email() {
  const queryClient = useQueryClient()

  const [openModal, setOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [dataToEdit, setDataToEdit] = useState<any>({})
  const pageLimit = {
    page: '',
    limit: '',
  }

  const {data, isLoading, isError} = useQuery(['emails', pageLimit], () =>
    getEmails(pageLimit)
  )

  const addEmailMutation = useMutation(addEmail, {
    onSuccess: (response) =>
      handleResponse(response, 'Email added successfully', 'Email add failed', [
        handleCloseModal,
        () => queryClient.invalidateQueries(['emails']),
      ]),
    onError: (error) => {
      notification({
        message: 'Email add failed!',
        type: 'error',
      })
    },
  })

  const deleteEmailMutation = useMutation(deleteEmail, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Email deleted successfully',
        'Email deletion failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['emails'])]
      ),
    onError: (error) => {
      notification({
        message: 'Email deletion failed!',
        type: 'error',
      })
    },
  })

  const editEmailMutation = useMutation(editEmail, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Email updated successfully',
        'Email update failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['emails'])]
      ),
    onError: (error) => {
      notification({
        message: 'Email update failed!',
        type: 'error',
      })
    },
  })

  const handleAddClick = (input: {title: any; body: any; module: string}) => {
    addEmailMutation.mutate({
      title: input?.title,
      body: input?.body,
      module: input?.module,
    })
  }

  const handleEditClick = (input: {
    title: string
    body: string
    module: string
  }) => {
    editEmailMutation.mutate({
      id: dataToEdit?._id,
      email: {title: input?.title, body: input?.body, module: input?.module},
    })
  }

  const handleDeleteClick = (data: any) => {
    deleteEmailMutation.mutate({id: data?._id})
  }

  const handleOpenEditModal = (data: any) => {
    setIsEditMode(true)
    setOpenModal(true)
    setDataToEdit(data)
  }

  const handleCloseModal = () => {
    setIsEditMode(false)

    setDataToEdit({})
    setOpenModal(false)
  }
  const handleOpenModal = () => {
    setOpenModal(true)
  }

  return (
    <>
      {openModal && (
        <EmailModal
          toggle={openModal}
          isEditMode={isEditMode}
          editData={dataToEdit}
          isLoading={addEmailMutation.isLoading || editEmailMutation.isLoading}
          onSubmit={isEditMode ? handleEditClick : handleAddClick}
          onCancel={handleCloseModal}
        />
      )}
      <Row>
        <Col span={6} xs={24} md={24}>
          <Card
            title="Emails"
            extra={
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={() => handleOpenModal()}
                disabled={getIsAdmin()}
              >
                Add
              </Button>
            }
          >
            <SettingTable
              data={data?.data?.data?.data}
              columns={EMAIL_COLUMN(
                (value) => handleDeleteClick(value),
                (value) => handleOpenEditModal(value)
              )}
              onAddClick={() => handleOpenModal()}
              isLoading={isLoading || deleteEmailMutation.isLoading}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Email
