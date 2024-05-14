import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Card, Row, Col, Button} from 'antd'
import {POSITION_COLUMN} from 'constants/Settings'
import {notification} from 'helpers/notification'
import {capitalizeInput, getIsAdmin, handleResponse} from 'helpers/utils'
import React, {useState} from 'react'
import {
  getProjectClients,
  getProjectStatus,
  getProjectTags,
  getProjectTypes,
} from 'services/projects'
import {
  addClient,
  addProjectStatus,
  addProjectTag,
  addProjectType,
  deleteClient,
  deleteProjectStatus,
  deleteProjectTag,
  deleteProjectType,
  editClient,
  editProjectStatus,
  editProjectTag,
  editProjectType,
} from 'services/settings/projects'
import CommonModal from '../CommonModal'
import SettingTable from '../CommonTable'

const types = {
  PROJECT_TYPE: 'Project Type',
  PROJECT_STATUS: 'Project Status',
  PROJECT_TAG: 'Project Tag',
  CLIENTS: 'Client',
}

function Projects() {
  const queryClient = useQueryClient()
  const [type, setType] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [dataToEdit, setDataToEdit] = useState<any>({})
  const [duplicateValue, setDuplicateValue] = useState<boolean>(false)
  const [arrayDataToSend, setArrayDataToSend] = useState<any>([])

  const {data: projectTypes}: {data: any} = useQuery(
    ['projectTypes'],
    getProjectTypes
  )
  const {data: projectStatuses}: {data: any} = useQuery(
    ['projectStatuses'],
    getProjectStatus
  )
  const {data: projectTags}: {data: any} = useQuery(
    ['projectTags'],
    getProjectTags
  )
  const {data: clients, isLoading}: any = useQuery(
    ['clients'],
    getProjectClients
  )

  const addProjectTypeMutation = useMutation(addProjectType, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Project Type added successfully',
        'Project Type add failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['projectTypes']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Position add failed!',
        type: 'error',
      })
    },
  })
  const deleteProjectTypeMutation = useMutation(deleteProjectType, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Project Type deleted successfully',
        'Project Type deletion failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['projectTypes']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Project Type deletion failed!',
        type: 'error',
      })
    },
  })

  const editProjectTypeMutation = useMutation(editProjectType, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Project Type updated successfully',
        'Project Type update failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['projectTypes']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Project Type update failed!',
        type: 'error',
      })
    },
  })
  const addProjectStatusMutation = useMutation(addProjectStatus, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Project Status added successfully',
        'Project Status add failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['projectStatuses']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Project Status add failed!',
        type: 'error',
      })
    },
  })
  const deleteProjectStatusMutation = useMutation(deleteProjectStatus, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Project Status deleted successfully',
        'Project Status deletion failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['projectStatuses']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Project Status deletion failed!',
        type: 'error',
      })
    },
  })

  const editProjectStatusMutation = useMutation(editProjectStatus, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Project Status updated successfully',
        'Project Status update failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['projectStatuses']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Project Status update failed!',
        type: 'error',
      })
    },
  })
  const addProjectTagMutation = useMutation(addProjectTag, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Project Tag added successfully',
        'Project Tag add failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['projectTags'])]
      ),
    onError: (error) => {
      notification({
        message: 'Project Tag add failed!',
        type: 'error',
      })
    },
  })
  const deleteProjectTagMutation = useMutation(deleteProjectTag, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Project Tag deleted successfully',
        'Project Tag deletion failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['projectTags'])]
      ),
    onError: (error) => {
      notification({
        message: 'Project Tag deletion failed!',
        type: 'error',
      })
    },
  })

  const editProjectTagMutation = useMutation(editProjectTag, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Project Tag updated successfully',
        'Project Tag update failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['projectTags'])]
      ),
    onError: (error) => {
      notification({
        message: 'Project Tag update failed!',
        type: 'error',
      })
    },
  })
  const addClientMutation = useMutation(addClient, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Client added successfully',
        'Client add failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['clients'])]
      ),
    onError: (error) => {
      notification({
        message: 'Client add failed!',
        type: 'error',
      })
    },
  })
  const deleteClientMutation = useMutation(deleteClient, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Client deleted successfully',
        'Client deletion failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['clients'])]
      ),
    onError: (error) => {
      notification({
        message: 'Client deletion failed!',
        type: 'error',
      })
    },
  })

  const editClientMutation = useMutation(editClient, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Client updated successfully',
        'Client update failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['clients'])]
      ),
    onError: (error) => {
      notification({
        message: 'Client update failed!',
        type: 'error',
      })
    },
  })

  const handleAddClick = (input: string) => {
    if (type === types.PROJECT_TYPE)
      addProjectTypeMutation.mutate({name: input})

    if (type === types.PROJECT_STATUS)
      addProjectStatusMutation.mutate({name: input})
    if (type === types.PROJECT_TAG) addProjectTagMutation.mutate({name: input})
    if (type === types.CLIENTS) addClientMutation.mutate({name: input})
  }

  const handleEditClick = (input: any) => {
    if (type === types.PROJECT_TYPE)
      editProjectTypeMutation.mutate({id: dataToEdit?._id, name: input})

    if (type === types.PROJECT_STATUS)
      editProjectStatusMutation.mutate({id: dataToEdit?._id, name: input})
    if (type === types.PROJECT_TAG)
      editProjectTagMutation.mutate({id: dataToEdit?._id, name: input})
    if (type === types.CLIENTS)
      editClientMutation.mutate({id: dataToEdit?._id, name: input})
  }

  const handleDeleteClick = (data: any, type: string) => {
    if (type === types.PROJECT_TYPE)
      deleteProjectTypeMutation.mutate({
        id: data._id,
      })

    if (type === types.PROJECT_STATUS)
      deleteProjectStatusMutation.mutate({id: data._id})

    if (type === types.PROJECT_TAG)
      deleteProjectTagMutation.mutate({id: data._id})
    if (type === types.CLIENTS) deleteClientMutation.mutate({id: data._id})

    // if (type === types.ROLE) deleteRoleMutation.mutate({ id: data._id });
  }

  const handleOpenEditModal = (data: any, type: string, currentData: any) => {
    setIsEditMode(true)
    setType(type)
    setOpenModal(true)
    setDataToEdit(data)
    setArrayDataToSend(currentData)
  }

  const handleCloseModal = () => {
    setIsEditMode(false)
    setDuplicateValue(false)
    setDataToEdit({})
    setOpenModal(false)
  }
  const handleOpenModal = (type: string, data: any) => {
    setOpenModal(true)
    setType(type)
    setArrayDataToSend(data)
  }
  return (
    <>
      {openModal && (
        <CommonModal
          toggle={openModal}
          type={type}
          currentData={arrayDataToSend}
          duplicateValue={duplicateValue}
          setDuplicateValue={setDuplicateValue}
          isEditMode={isEditMode}
          editData={dataToEdit}
          isLoading={
            addProjectTypeMutation.isLoading ||
            addProjectStatusMutation.isLoading ||
            addProjectTagMutation.isLoading ||
            addClientMutation.isLoading ||
            editProjectTypeMutation.isLoading ||
            editProjectStatusMutation.isLoading ||
            editClientMutation.isLoading ||
            editProjectTagMutation.isLoading
          }
          onSubmit={isEditMode ? handleEditClick : handleAddClick}
          onCancel={handleCloseModal}
        />
      )}

      <Row>
        <Col span={6} xs={24} md={12}>
          <Card
            title="Project Type"
            extra={
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={() =>
                  handleOpenModal(types.PROJECT_TYPE, projectTypes)
                }
                disabled={getIsAdmin()}
              >
                Add
              </Button>
            }
          >
            <SettingTable
              data={projectTypes?.data?.data?.data}
              onAddClick={() =>
                handleOpenModal(types.PROJECT_TYPE, projectTypes)
              }
              columns={POSITION_COLUMN(
                (value) => handleDeleteClick(value, types.PROJECT_TYPE),
                (value) =>
                  handleOpenEditModal(value, types.PROJECT_TYPE, projectTypes)
              )}
              isLoading={isLoading || deleteProjectTypeMutation.isLoading}
            />
          </Card>
        </Col>
        <Col span={6} xs={24} md={12} style={{paddingLeft: 0}}>
          <Card
            title="Project Status"
            extra={
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={() =>
                  handleOpenModal(types.PROJECT_STATUS, projectStatuses)
                }
                disabled={getIsAdmin()}
              >
                Add
              </Button>
            }
          >
            <SettingTable
              data={projectStatuses?.data?.data?.data}
              columns={POSITION_COLUMN(
                (value) => handleDeleteClick(value, types.PROJECT_STATUS),
                (value) =>
                  handleOpenEditModal(
                    value,
                    types.PROJECT_STATUS,
                    projectStatuses
                  )
              )}
              onAddClick={() =>
                handleOpenModal(types.PROJECT_STATUS, projectStatuses)
              }
              isLoading={isLoading || deleteProjectStatusMutation.isLoading}
            />
          </Card>
        </Col>
      </Row>
      <Row>
        <Col span={6} xs={24} md={12} style={{paddingLeft: 0}}>
          <Card
            title="Project Tag"
            extra={
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={() => handleOpenModal(types.PROJECT_TAG, projectTags)}
                disabled={getIsAdmin()}
              >
                Add
              </Button>
            }
          >
            <SettingTable
              data={projectTags?.data?.data?.data}
              columns={POSITION_COLUMN(
                (value) => handleDeleteClick(value, types.PROJECT_TAG),
                (value) =>
                  handleOpenEditModal(value, types.PROJECT_TAG, projectTags)
              )}
              onAddClick={() => handleOpenModal(types.PROJECT_TAG, projectTags)}
              isLoading={isLoading || deleteProjectTagMutation.isLoading}
            />
          </Card>
        </Col>
        <Col span={6} xs={24} md={12} style={{paddingLeft: 0}}>
          <Card
            title="Clients"
            extra={
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={() => handleOpenModal(types.CLIENTS, clients)}
                disabled={getIsAdmin()}
              >
                Add
              </Button>
            }
          >
            <SettingTable
              data={clients?.data?.data?.data}
              columns={POSITION_COLUMN(
                (value) => handleDeleteClick(value, types.CLIENTS),
                (value) => handleOpenEditModal(value, types.CLIENTS, clients)
              )}
              onAddClick={() => handleOpenModal(types.CLIENTS, clients)}
              isLoading={isLoading || deleteClientMutation.isLoading}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Projects
