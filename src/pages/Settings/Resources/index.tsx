import React, {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card, Col, Row} from 'antd'
import SettingTable from '../CommonTable'
import {RESOURCES_COLUMN} from 'constants/Settings'
import {getIsAdmin, handleResponse} from 'helpers/utils'
import {notification} from 'helpers/notification'
import CommonResourceModal from '../CommonResourceModal'
import {
  addFaqs,
  addPolicies,
  deleteFaqs,
  deletePolicies,
  editFaqs,
  editPolicies,
  getAllFaqs,
  getAllPolicies,
} from 'services/resources'

function Resources() {
  const queryClient = useQueryClient()
  const [type, setType] = useState('')

  const [openModal, setOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [dataToEdit, setDataToEdit] = useState<any>({})
  const pageLimit = {
    page: '',
    limit: '',
  }

  const {
    data: faqs,
    isLoading: isFaqLoading,
    isError: isFaqError,
  } = useQuery(['faqs', pageLimit], () => getAllFaqs(pageLimit))
  const {
    data: policies,
    isLoading: isPolicyLoading,
    isError: isPolicyError,
  } = useQuery(['policies', pageLimit], () => getAllPolicies(pageLimit))

  const addFaqMutation = useMutation(addFaqs, {
    onSuccess: (response) =>
      handleResponse(response, 'FAQ added successfully', 'FAQ add failed', [
        handleCloseModal,
        () => queryClient.invalidateQueries(['faqs']),
      ]),
    onError: (error) => {
      notification({
        message: 'FAQ add failed!',
        type: 'error',
      })
    },
  })

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

  const deleteFaqMutation = useMutation(deleteFaqs, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'FAQ deleted successfully',
        'FAQ type deletion failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['faqs'])]
      ),
    onError: (error) => {
      notification({
        message: 'FAQ Type deletion failed!',
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

  const editFaqMutation = useMutation(editFaqs, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'FAQ updated successfully',
        'FAQ update failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['faqs'])]
      ),
    onError: (error) => {
      notification({
        message: 'FAQ update failed!',
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

  const handleAddClick = (input: {title: string; content: string}) => {
    if (type === 'FAQ') {
      addFaqMutation.mutate({title: input?.title, content: input?.content})
    }
    if (type === 'Policy') {
      addPolicyMutation.mutate({title: input?.title, content: input?.content})
    }
  }

  const handleEditClick = (input: {title: string; content: string}) => {
    if (type === 'FAQ') {
      editFaqMutation.mutate({
        id: dataToEdit?._id,
        title: input?.title,
        content: input?.content,
      })
    }
    if (type === 'Policy') {
      editPolicyMutation.mutate({
        id: dataToEdit?._id,
        title: input?.title,
        content: input?.content,
      })
    }
  }

  const handleDeleteClick = (data: any, type: string) => {
    if (type === 'FAQ') {
      deleteFaqMutation.mutate({id: data?._id})
    }
    if (type === 'Policy') {
      deletePolicyMutation.mutate({id: data?._id})
    }
  }

  const handleOpenEditModal = (data: any, type: string) => {
    setType(type)
    setIsEditMode(true)
    setOpenModal(true)
    setDataToEdit(data)
  }

  const handleCloseModal = () => {
    setIsEditMode(false)
    setDataToEdit({})
    setOpenModal(false)
  }
  const handleOpenModal = (type: string) => {
    setType(type)

    setOpenModal(true)
  }

  return (
    <>
      {openModal && (
        <CommonResourceModal
          toggle={openModal}
          type={type}
          isEditMode={isEditMode}
          editData={dataToEdit}
          isLoading={
            addFaqMutation.isLoading ||
            editFaqMutation.isLoading ||
            addPolicyMutation.isLoading ||
            editPolicyMutation.isLoading
          }
          onSubmit={isEditMode ? handleEditClick : handleAddClick}
          onCancel={handleCloseModal}
        />
      )}

      <Row>
        <Col span={6} xs={24} md={12}>
          <Card
            title="FAQ"
            extra={
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={() => handleOpenModal('FAQ')}
                disabled={getIsAdmin()}
              >
                Add
              </Button>
            }
          >
            <SettingTable
              data={faqs?.data?.data?.data}
              columns={RESOURCES_COLUMN(
                (value) => handleDeleteClick(value, 'FAQ'),
                (value) => handleOpenEditModal(value, 'FAQ')
              )}
              onAddClick={() => handleOpenModal('FAQ')}
              isLoading={isFaqLoading || deleteFaqMutation.isLoading}
            />
          </Card>
        </Col>
        <Col span={6} xs={24} md={12} style={{paddingLeft: 0}}>
          <Card
            title="Policies"
            extra={
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={() => handleOpenModal('Policy')}
                disabled={getIsAdmin()}
              >
                Add
              </Button>
            }
          >
            <SettingTable
              data={policies?.data?.data?.data}
              columns={RESOURCES_COLUMN(
                (value) => handleDeleteClick(value, 'Policy'),
                (value) => handleOpenEditModal(value, 'Policy')
              )}
              onAddClick={() => handleOpenModal('Policy')}
              isLoading={isPolicyLoading || deletePolicyMutation.isLoading}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Resources
