import React, {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card} from 'antd'
import SettingTable from '../CommonTable'
import {POSITION_COLUMN} from 'constants/Settings'
import {
  addBlogCategory,
  deleteBlogCategory,
  editBlogCategory,
  getBlogCategories,
} from 'services/settings/blog'
import CommonModal from '../CommonModal'
import {getIsAdmin, handleResponse} from 'helpers/utils'
import {notification} from 'helpers/notification'

function Blog() {
  const queryClient = useQueryClient()
  const [type, setType] = useState('')

  const [openModal, setOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [dataToEdit, setDataToEdit] = useState<any>({})
  const [arrayDataToSend, setArrayDataToSend] = useState<any>([])
  const [duplicateValue, setDuplicateValue] = useState<boolean>(false)
  const {data: blogCategories, isLoading}: any = useQuery(
    ['blogCategories'],
    getBlogCategories
  )
  const addBlogCategoryMutation = useMutation(addBlogCategory, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Blog Category added successfully',
        'Blog Category add failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['blogCategories']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Blog Category add failed!',
        type: 'error',
      })
    },
  })
  const deleteBlogCategoryMutation = useMutation(deleteBlogCategory, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Blog Category deleted successfully',
        'Blog Category deletion failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['blogCategories']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Blog Category deletion failed!',
        type: 'error',
      })
    },
  })

  const editBlogCategoryMutation = useMutation(editBlogCategory, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Blog Category updated successfully',
        'Blog Category update failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['blogCategories']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Blog Category update failed!',
        type: 'error',
      })
    },
  })

  const handleAddClick = (input: string) => {
    addBlogCategoryMutation.mutate({name: input})
  }

  const handleEditClick = (input: any) => {
    editBlogCategoryMutation.mutate({id: dataToEdit?._id, name: input})
  }

  const handleDeleteClick = (data: any, type: string) => {
    deleteBlogCategoryMutation.mutate({id: data._id})
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
    setDataToEdit({})
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
        <CommonModal
          toggle={openModal}
          duplicateValue={duplicateValue}
          setDuplicateValue={setDuplicateValue}
          type={type}
          currentData={arrayDataToSend}
          isEditMode={isEditMode}
          editData={dataToEdit}
          isLoading={
            addBlogCategoryMutation.isLoading ||
            editBlogCategoryMutation.isLoading
          }
          onSubmit={isEditMode ? handleEditClick : handleAddClick}
          onCancel={handleCloseModal}
        />
      )}
      <Card
        title="Category"
        extra={
          <Button
            className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
            onClick={() => handleOpenModal('Category', blogCategories)}
            disabled={getIsAdmin()}
          >
            Add
          </Button>
        }
      >
        <SettingTable
          data={blogCategories?.data?.data?.data}
          columns={POSITION_COLUMN(
            (value) => handleDeleteClick(value, 'Category'),
            (value) => handleOpenEditModal(value, 'Category', blogCategories)
          )}
          onAddClick={() => handleOpenModal('Category', blogCategories)}
          isLoading={isLoading || deleteBlogCategoryMutation.isLoading}
        />
      </Card>
    </>
  )
}

export default Blog
