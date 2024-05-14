import React, {useCallback, useEffect, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Card, Table, Form, Input, Button} from 'antd'
import CircularProgress from 'components/Elements/CircularProgress'
import {
  changeDate,
  debounce,
  getIsAdmin,
  handleResponse,
  MuiFormatDate,
} from 'helpers/utils'
import moment from 'moment'
import {notification} from 'helpers/notification'
import {
  addNotice,
  deleteNotice,
  getAllNotices,
  updateNotice,
} from 'services/noticeboard'
import {NOTICE_COLUMNS} from 'constants/Notice'
import NoticeBoardModal from 'components/Modules/noticeboardModal'
import {useLocation, useNavigate} from 'react-router-dom'
import AccessWrapper from 'components/Modules/AccessWrapper'
import RoleAccess from 'constants/RoleAccess'
import {emptyText} from 'constants/EmptySearchAntd'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {socket} from 'pages/Main'
import {PAGE50} from 'constants/Common'
import {deleteObject, getStorage, ref} from 'firebase/storage'

const Search = Input.Search
const FormItem = Form.Item

const formattedNotices = (notices) => {
  return notices?.map((notice) => ({
    ...notice,
    key: notice._id,
    noticeType: notice.noticeType.name,
    startDate: notice.startDate ? changeDate(notice.startDate) : '',
    endDate: notice.endDate ? changeDate(notice.endDate) : '',
    categoryId: notice?.noticeType._id,
  }))
}

function NoticeBoardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  // init hooks
  const [sort, setSort] = useState({})
  const [title, setTitle] = useState('')
  const [tempNoticeSearch, setTempNoticeSearch] = useState('')
  const [typedNotice, setTypedNotice] = useState('')
  const [date, setDate] = useState(undefined)
  const [page, setPage] = useState(PAGE50)
  const [openUserDetailModal, setOpenUserDetailModal] = useState(false)
  const [noticeRecord, setNoticeRecord] = useState({})
  const [readOnly, setReadOnly] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [form] = Form.useForm()
  const [files, setFiles] = useState([])
  const [deletedFile, setDeletedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [id, setId] = useState(location?.state?.id || '')

  const queryClient = useQueryClient()

  const storage = getStorage()

  const {
    role: {permission = {}},
  } = useSelector(selectAuthUser)

  const noticeBoardPermissions = permission?.['Notice Board']

  const {data, isLoading, isError, isFetching} = useQuery(
    ['notices', page, tempNoticeSearch, date, sort, id],
    () =>
      getAllNotices({
        ...page,
        id,
        search: tempNoticeSearch,
        startDate: date?.[0] ? moment.utc(date[0]).format() : '',
        endDate: date?.[1] ? moment.utc(date[1]).format() : '',
        sort:
          sort.order === undefined || sort.column === undefined
            ? ''
            : sort.order === 'ascend'
            ? sort.field
            : `-${sort.field}`,
      }),
    {keepPreviousData: true}
  )

  const addNoticeMutation = useMutation((notice) => addNotice(notice), {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Notice Added Successfully',
        'Notice addition failed',
        [
          () => queryClient.invalidateQueries(['notices']),
          () => handleCloseModal(),
          () => {
            socket.emit('CUD')
          },
          () => setFiles([]),
          () => {
            socket.emit('add-notice', {
              showTo: Object.values(RoleAccess),
              noticeTypeId: response.data.data.data.noticeType,
              module: 'Notice',
            })
          },
        ]
      ),
    onError: (error) => {
      if (files.length > 0) {
        const imageRef = ref(storage, `notice/${files[0]?.name}`)
        deleteObject(imageRef).then(() => {
          notification({message: 'Image Deleted!', type: 'error'})
        })
      }
      notification({message: 'Notice addition failed!', type: 'error'})
    },

    onSettled: () => {
      setLoading(false)
    },
  })

  const updateNoticeMutation = useMutation(
    (notice) => updateNotice(notice.id, notice.details),
    {
      onSuccess: (response) =>
        handleResponse(
          response,
          'Notice Updated Successfully',
          'Notice update failed',
          [
            () => queryClient.invalidateQueries(['notices']),
            () => handleCloseModal(),
            () => {
              socket.emit('CUD')
            },
          ]
        ),
      onError: (error) => {
        notification({message: 'Notice update failed', type: 'error'})
      },

      onSettled: () => {
        setLoading(false)
      },
    }
  )

  const deleteNoticeMutation = useMutation(
    (noticeId) => deleteNotice(noticeId),
    {
      onSuccess: async (response) => {
        if (response?.data?.data?.image?.url) {
          const imageRef = ref(storage, response?.data?.data?.image?.name)
          await deleteObject(imageRef)
        }
        handleResponse(
          response,
          'Notice removed Successfully',
          'Notice deletion failed',
          [
            () => queryClient.invalidateQueries(['notices']),
            () => {
              socket.emit('CUD')
            },
          ]
        )
      },
      onError: (error) => {
        notification({message: 'Notice deletion failed', type: 'error'})
      },
    }
  )

  useEffect(() => {
    if (isError) {
      notification({message: 'Could not load Notices!', type: 'error'})
    }

    if (location?.state?.name) {
      setTypedNotice(location.state?.name)
      setTitle(location.state?.name)
      setTempNoticeSearch(`${location?.state?.name}`)
      navigate(location.pathname, {replace: true, state: undefined})
    }
  }, [isError, location])

  const handleUserDetailSubmit = (project, reset) => {
    try {
      const updatedProject = {
        ...project,
        startDate: project.startDate
          ? MuiFormatDate(project.startDate.startOf('day').toString())
          : undefined,
        endDate: project.endDate
          ? MuiFormatDate(project.endDate.startOf('day').toString())
          : undefined,
        startTime: project.startTime
          ? moment.utc(project.startTime).format()
          : undefined,
        endTime: project.endTime
          ? moment.utc(project.endTime).format()
          : undefined,
      }
      if (isEditMode) {
        updateNoticeMutation.mutate({
          id: noticeRecord.id,
          details: updatedProject,
        })
      } else addNoticeMutation.mutate(updatedProject)
      form.resetFields()
    } catch (error) {
      notification({message: 'Notice Addition Failed', type: 'error'})
    }
  }

  const handleTableChange = (pagination, filters, sorter) => {
    setSort(sorter)
  }

  const handlePageChange = (pageNumber) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const onShowSizeChange = (_, pageSize) => {
    setPage((prev) => ({...page, limit: pageSize}))
  }

  const handleResetFilter = () => {
    setTitle('')
    setId('')
    setTempNoticeSearch('')
    setDate(undefined)
    setTypedNotice('')
  }

  const confirmDeleteProject = (notice) => {
    deleteNoticeMutation.mutate(notice?._id)
  }

  const handleOpenEditModal = (notice, mode) => {
    const originalProject = data?.data?.data?.data?.find(
      (ntc) => ntc._id === notice._id
    )

    setOpenUserDetailModal((prev) => !prev)
    setNoticeRecord({
      id: notice._id,
      project: {
        ...notice,
        startDate: originalProject?.startDate ?? null,
        endDate: originalProject?.endDate ?? null,
        startTime: originalProject?.startTime ?? null,
        endTime: originalProject?.endTime ?? null,
        categoryId: notice?.categoryId,
      },
    })
    setReadOnly(mode)
    setIsEditMode(true)
  }

  const handleCloseModal = () => {
    setFiles([])
    setDeletedFile(null)
    setOpenUserDetailModal((prev) => !prev)
    setNoticeRecord({})
    setIsEditMode(false)
    setReadOnly(false)
  }

  const handleOpenAddModal = () => {
    setOpenUserDetailModal((prev) => !prev)
  }

  const handleNoticeSearch = (e) => {
    const searchText = e.target.value
    if (
      searchText?.length !== 1 ||
      tempNoticeSearch?.length >= searchText?.length
    ) {
      setTempNoticeSearch(searchText)
    }
    setPage((prev) => ({...prev, page: 1}))
  }

  const handleNoticeDebounce = useCallback(
    debounce(handleNoticeSearch, 1000),
    []
  )

  if (isLoading) {
    return <CircularProgress />
  }

  return (
    <div>
      {openUserDetailModal && (
        <NoticeBoardModal
          toggle={openUserDetailModal}
          onClose={handleCloseModal}
          onSubmit={handleUserDetailSubmit}
          loading={loading}
          initialValues={noticeRecord.project}
          readOnly={readOnly}
          isEditMode={isEditMode}
          files={files}
          setFiles={setFiles}
          deletedFile={deletedFile}
          setDeletedFile={setDeletedFile}
          setLoading={setLoading}
        />
      )}

      <Card title="Notice Board">
        <div className="components-table-demo-control-bar">
          <div className="gx-d-flex gx-justify-content-between gx-flex-row">
            <Form layout="inline" form={form}>
              <FormItem style={{marginBottom: '-2px'}}>
                <Search
                  allowClear
                  placeholder="Search Notices"
                  onSearch={(value) => {
                    setId('')
                    setPage((prev) => ({...prev, page: 1}))
                    setTitle(value)
                    setTempNoticeSearch(value)
                  }}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    setId('')
                    handleNoticeDebounce(e)
                  }}
                  value={title}
                  style={{marginBottom: '16px'}}
                  enterButton
                />
              </FormItem>
              {/* <FormItem>
								<RangePicker
									onChange={handleChangeDate}
									value={date}
									style={{ width: "240px" }}
								/>
							</FormItem> */}
              <FormItem style={{marginBottom: '-2px'}}>
                <Button
                  className="gx-btn-form gx-btn-primary gx-text-white gx-mt-auto"
                  onClick={handleResetFilter}
                >
                  Reset
                </Button>
              </FormItem>
            </Form>
            <AccessWrapper role={noticeBoardPermissions?.createNotice}>
              <Button
                className="gx-btn-form gx-btn-primary gx-text-white "
                onClick={handleOpenAddModal}
                disabled={getIsAdmin()}
              >
                Add New Notice
              </Button>
            </AccessWrapper>
          </div>
        </div>
        <Table
          locale={{emptyText}}
          className="gx-table-responsive"
          rowClassName={(record, index) =>
            moment() < moment(record?.createdAt).add(1, 'days')
              ? 'latest-events'
              : ''
          }
          columns={NOTICE_COLUMNS(
            sort,
            handleOpenEditModal,
            confirmDeleteProject,
            noticeBoardPermissions
          )}
          dataSource={formattedNotices(data?.data?.data?.data)}
          onChange={handleTableChange}
          pagination={{
            current: page.page,
            pageSize: page.limit,
            pageSizeOptions: ['25', '50', '100'],
            showSizeChanger: true,
            total: data?.data?.data?.count || 1,
            onShowSizeChange,
            hideOnSinglePage: data?.data?.data?.count ? false : true,
            onChange: handlePageChange,
          }}
          loading={isLoading || isFetching || deleteNoticeMutation.isLoading}
        />
      </Card>
    </div>
  )
}

export default NoticeBoardPage
