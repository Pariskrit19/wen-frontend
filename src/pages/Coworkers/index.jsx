import '@ant-design/compatible/assets/index.css'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Popconfirm,
  Radio,
  Table,
} from 'antd'
import CircularProgress from 'components/Elements/CircularProgress'
import UserDetailForm from 'components/Modules/UserDetailModal'
import {CO_WORKERCOLUMNS} from 'constants/CoWorkers'
import {notification} from 'helpers/notification'
import {
  changeDate,
  debounce,
  getIsAdmin,
  getLocalStorageData,
  handleResponse,
} from 'helpers/utils'
import moment from 'moment'
import {useCallback, useEffect, useRef, useState} from 'react'
import {CSVLink} from 'react-csv'
import {
  disableUser,
  getAllUsers,
  getUserPosition,
  getUserPositionTypes,
  getUserRoles,
  resetAllocatedLeaves,
  updateUser,
} from 'services/users/userDetails'
import ImportUsers from './ImportUsers'
import Select from 'components/Elements/Select'
import AccessWrapper from 'components/Modules/AccessWrapper'
import RoleAccess from 'constants/RoleAccess'
import {PAGE50, PLACE_HOLDER_CLASS, SELECT_ALL_LIMIT} from 'constants/Common'
import {emptyText} from 'constants/EmptySearchAntd'
import {useDispatch, useSelector} from 'react-redux'
import {switchedUser, switchUser, updateJoinDate} from 'appRedux/actions'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {socket} from 'pages/Main'

const Search = Input.Search
const FormItem = Form.Item

const formattedUsers = (users, isAdmin) => {
  return users?.map((user) => ({
    ...user,
    key: user._id,
    dob: changeDate(user.dob),
    joinDate: changeDate(user.joinDate),
    isAdmin,
  }))
}

function CoworkersPage() {
  // init hooks
  const [sort, setSort] = useState({})
  const [page, setPage] = useState(PAGE50)
  const [openUserDetailModal, setOpenUserDetailModal] = useState(false)
  const [activeUser, setActiveUser] = useState(true)
  const [defaultUser, setDefaultUser] = useState('active')
  const [position, setPosition] = useState(undefined)
  const [role, setRole] = useState(undefined)
  const [selectAllLimit, setSelectAllLimit] = useState(undefined)
  const [name, setName] = useState('')
  const [tempName, setTempName] = useState('')
  const [userRecord, setUserRecord] = useState({})
  const [readOnly, setReadOnly] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [openImport, setOpenImport] = useState(false)
  const [files, setFiles] = useState([])
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [isChecked, setISChecked] = useState({
    active: {checked: false, indeterminate: false, isSelectAll: false},
    inActive: {checked: false, indeterminate: false, isSelectAll: false},
  })
  // get user detail from storage

  const {
    role: {key, permission},
  } = useSelector(selectAuthUser)
  const [form] = Form.useForm()

  const coWorkersPermissions = permission?.['Co-Workers']

  const {data: roleData} = useQuery(['userRoles'], getUserRoles)
  const {data: positionData} = useQuery(['userPositions'], getUserPosition)
  const {data: positionTypes} = useQuery(
    ['userPositionTypes'],
    getUserPositionTypes
  )
  const {data, isLoading, isFetching, isError} = useQuery(
    ['users', page, activeUser, role, position, tempName, sort, isSelectAll],
    () =>
      getAllUsers({
        page: isSelectAll ? SELECT_ALL_LIMIT.page : page?.page,
        limit: isSelectAll ? SELECT_ALL_LIMIT.limit : page?.limit,
        active: activeUser,
        role,
        position,
        name: tempName,
        sort:
          sort.order === undefined || sort.column === undefined
            ? 'name'
            : sort.order === 'ascend'
            ? sort.field
            : `-${sort.field}`,
      }),
    {
      keepPreviousData: true,
    }
  )
  //query data

  // -----FOR SELECT ALL ---
  const DATA = data?.data?.data?.data ?? []
  useEffect(() => {
    //if selectall map and filter duplicate row
    if (isSelectAll && DATA?.length) {
      setSelectedIds((prev) => {
        const newIds = DATA?.map((d) => d?._id).filter(
          (id) => !prev.includes(id)
        )
        return [...prev, ...newIds]
      })

      setSelectedRows((prev) => {
        const uniqueRows = DATA?.filter((d) => {
          return !prev?.some((row) => row?._id === d?._id)
        })

        return [...prev, ...uniqueRows]
      })
    }
    setSelectAllLimit(data?.data?.data.count)
  }, [DATA?.length])

  //for checkbox only
  useEffect(() => {
    if (DATA?.length === 0) {
      return
    }

    //filter the current data only
    const dataIds = DATA?.map((item) => item._id)
    const currentData =
      role || position
        ? selectedRows.filter((item) => dataIds.includes(item?._id))
        : selectedRows

    //initial active and inactive row count
    let activeCount = 0
    let inactiveCount = 0

    // filter active and inactive users
    for (const item of currentData) {
      if (item?.active) {
        activeCount++
      } else {
        inactiveCount++
      }
    }

    //update checked and indeterminate state of HEADERCHECKBOX

    if (activeUser) {
      setISChecked({
        ...isChecked,
        active: {
          indeterminate:
            activeCount > 0 &&
            (activeCount < DATA?.length || activeCount < selectAllLimit),
          checked:
            activeCount > 0 &&
            (activeCount === DATA?.length || activeCount === selectAllLimit),
        },
      })
    }

    if (!activeUser) {
      setISChecked({
        ...isChecked,
        inActive: {
          indeterminate:
            inactiveCount > 0 &&
            (inactiveCount < DATA?.length || inactiveCount < selectAllLimit),
          checked:
            inactiveCount > 0 &&
            (inactiveCount === DATA?.length ||
              inactiveCount === selectAllLimit),
        },
      })
    }
  }, [
    selectedIds,
    isSelectAll,
    activeUser,
    selectAllLimit,
    DATA?.length,
    position,
    selectedRows,
  ])

  const mutation = useMutation(
    (updatedUser) => updateUser(updatedUser.userId, updatedUser.updatedData),
    {
      onSuccess: (response) =>
        handleResponse(
          response,
          'User Updated Successfully',
          'Could not update User',
          [
            () => queryClient.invalidateQueries(['users']),
            () =>
              dispatch(updateJoinDate(response?.data?.data?.data?.joinDate)),
            () => setOpenUserDetailModal(false),
            () => {
              socket.emit('CUD')
            },
          ]
        ),
      onError: (error) => {
        notification({message: 'Could not update User', type: 'error'})
      },
    }
  )

  const disableUserMmutation = useMutation((userId) => disableUser(userId), {
    onSuccess: (response) =>
      handleResponse(
        response,
        'User Disabled Successfully',
        'Could not disable User',
        [
          () => queryClient.invalidateQueries(['users']),
          () => setOpenUserDetailModal(false),
          () => {
            socket.emit('CUD')
          },
          () => {
            socket.emit('disable-user', {
              showTo: [RoleAccess.Admin, RoleAccess.HumanResource],
              remarks: `${response?.data?.data?.data?.name} has been disabled.`,
              module: 'User',
            })
          },
        ]
      ),
    onError: (error) => {
      notification({message: 'Could not disable User', type: 'error'})
    },
  })

  useEffect(() => {
    if (isError) {
      notification({message: 'Could not load Users!', type: 'error'})
    }
  }, [isError])

  const handleToggleModal = (userRecordToUpdate, mode) => {
    setOpenUserDetailModal((prev) => !prev)
    setUserRecord(userRecordToUpdate)
    setReadOnly(mode)
  }

  const handleUserDetailSubmit = (user) => {
    try {
      const userTofind = data.data.data.data.find((x) => x._id === user._id)
      mutation.mutate({
        userId: user._id,
        updatedData: {
          ...user,
          dob: user.dob ? userTofind.dob : undefined,
          joinDate: user.joinDate
            ? moment(user.joinDate)
                .startOf('day')
                .utc()
                .add(1, 'd')
                .set({hour: 0, minute: 0, second: 0, millisecond: 0})
                .format()
            : undefined,
          lastReviewDate: user.lastReviewDate.map((d) =>
            moment(d).startOf('day').utc().format()
          ),
          exitDate: user?.exitDate ? moment.utc(user.exitDate).format() : null,
        },
      })
    } catch (error) {
      notification({message: 'Could not update User!', type: 'error'})
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

  const setActiveInActiveUsers = (e) => {
    setDefaultUser(e.target.value)
    setActiveUser(e.target.value === 'active' ? true : false)
    setIsSelectAll(false)
    setPage(PAGE50)
  }

  const handleRoleChange = (roleId) => {
    setPage(PAGE50)
    setRole(roleId)

    if (!roleId) {
      setIsSelectAll(false)
    }
  }

  const handlePositionChange = (positionId) => {
    setPage(PAGE50)
    setPosition(positionId)

    if (!positionId) {
      setIsSelectAll(false)
    }
  }
  const handleResetFilter = () => {
    setName('')
    setTempName('')
    setRole(undefined)
    setPosition(undefined)
    setActiveUser('')
    setDefaultUser('')
    setSelectedRows([])
    setSelectedIds([])
    setIsSelectAll(false)
    setPage(PAGE50)
  }

  const handleSelectRow = (record, selected, selectedRows) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, record?._id])
      setSelectedRows((prev) => [...prev, record])
    } else {
      setSelectedIds((prev) => prev.filter((d) => d !== record?._id))
      setSelectedRows((prev) => prev.filter((d) => d?._id !== record?._id))
    }
  }
  const handleSelectAll = (checked) => {
    //update the indeterminate and checked state of headercheckbox
    if (activeUser) {
      setISChecked({...isChecked, active: {indeterminate: false, checked}})
    }
    if (!activeUser) {
      setISChecked({...isChecked, inActive: {indeterminate: false, checked}})
    }

    //isSelectAll flag
    setIsSelectAll(checked)

    //handle select all data
    if (checked) {
      setSelectedIds((prev) => {
        const newDataIds = DATA?.map((d) => d?._id).filter(
          (id) => !prev?.includes(id)
        )
        return [...prev, ...newDataIds]
      })

      setSelectedRows((prev) => {
        const newRows = DATA?.filter(
          (row) => !prev?.some((prevRow) => prevRow?._id === row?._id)
        )
        return [...prev, ...newRows]
      })
    }

    if (!checked) {
      if (!activeUser) {
        // remove inactive row on select none
        setSelectedRows((prevRows) => {
          const filteredRows = prevRows?.filter((d) => d?.active)
          const selectedIds = filteredRows?.map((d) => d?._id)
          setSelectedIds(selectedIds)
          return filteredRows
        })
      } else {
        // remove active row on select none
        setSelectedRows((prevRows) => {
          const filteredRows = prevRows?.filter((d) => !d.active)
          const selectedIds = filteredRows?.map((d) => d._id)
          setSelectedIds(selectedIds)
          return filteredRows
        })
      }
    }
  }

  const handleCoworkerSearch = (e) => {
    const searchValue = e?.target?.value
    setPage((prev) => ({...prev, page: 1}))
    if (
      searchValue.length === 1 &&
      (!tempName || tempName.length < searchValue.length)
    ) {
      return
    }
    setTempName(searchValue)
  }
  const searchDebounce = useCallback(debounce(handleCoworkerSearch, 1000))

  const handleSwitchToUser = async (user) => {
    dispatch(switchUser())
    const adminId = getLocalStorageData('user_id')
    localStorage.setItem('admin', JSON.stringify(adminId))
    localStorage.setItem('user_id', JSON.stringify(user?._id))
  }
  //custom checkbox to handle checked and  indeterminate state of selectAll Checkbox
  const headerCheckbox = (
    <Checkbox
      checked={
        DATA?.length === 0
          ? false
          : activeUser
          ? isChecked?.active?.checked
          : isChecked?.inActive?.checked
      }
      indeterminate={
        activeUser
          ? isChecked?.active?.indeterminate
          : isChecked?.inActive?.indeterminate
      }
      onChange={(e) => handleSelectAll(e?.target?.checked)}
    />
  )

  if (isLoading) {
    return <CircularProgress />
  }

  return (
    <div>
      <ImportUsers
        toggle={openImport}
        onClose={() => setOpenImport(false)}
        files={files}
        setFiles={setFiles}
      />
      {openUserDetailModal && (
        <UserDetailForm
          toggle={openUserDetailModal}
          onToggleModal={handleToggleModal}
          onSubmit={handleUserDetailSubmit}
          loading={mutation.isLoading}
          roles={roleData}
          position={positionData}
          positionTypes={positionTypes}
          intialValues={userRecord}
          readOnly={readOnly}
        />
      )}
      <Card title="Co-workers">
        <div className="components-table-demo-control-bar">
          <div className="gx-d-flex gx-justify-content-between gx-flex-row ">
            <Search
              allowClear
              placeholder="Search Co-workers"
              onSearch={(value) => {
                setPage((prev) => ({...prev, page: 1}))
                setName(value)
                setTempName(value)
              }}
              onChange={(e) => {
                setName(e.target.value)
                searchDebounce(e)
              }}
              value={name}
              enterButton
              className="direct-form-item"
            />
          </div>
          <div className="gx-d-flex gx-justify-content-between gx-flex-row ">
            <Form layout="inline" form={form}>
              <FormItem className="direct-form-search margin-1r">
                <Select
                  placeholderClass={PLACE_HOLDER_CLASS}
                  placeholder="Select Role"
                  sortAscend={true}
                  onChange={handleRoleChange}
                  value={role}
                  options={roleData?.data?.data?.data?.map((x) => ({
                    ...x,
                    id: x._id,
                  }))}
                />
              </FormItem>
              <FormItem className="direct-form-search">
                <Select
                  placeholderClass={PLACE_HOLDER_CLASS}
                  placeholder="Select Position"
                  sortAscend={true}
                  className="margin-1r"
                  onChange={handlePositionChange}
                  value={position}
                  options={positionData?.data?.data?.data?.map((x) => ({
                    id: x._id,
                    value: x.name,
                  }))}
                />
              </FormItem>
              <FormItem style={{marginBottom: '10px'}}>
                <Radio.Group
                  buttonStyle="solid"
                  value={defaultUser}
                  onChange={setActiveInActiveUsers}
                  id="radio"
                >
                  <Radio.Button value="active">Active</Radio.Button>
                  <Radio.Button value="inactive">Inactive</Radio.Button>
                </Radio.Group>
              </FormItem>
              <FormItem>
                <Button
                  className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                  onClick={handleResetFilter}
                >
                  Reset
                </Button>
              </FormItem>
            </Form>
            <AccessWrapper
              role={
                coWorkersPermissions?.importCoworkers ||
                coWorkersPermissions?.exportCoworkers
              }
            >
              <div className="gx-btn-form">
                <AccessWrapper role={coWorkersPermissions?.importCoworkers}>
                  <Button
                    className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                    onClick={() => setOpenImport(true)}
                    disabled={getIsAdmin()}
                  >
                    Import
                  </Button>
                </AccessWrapper>
                {data?.status && coWorkersPermissions?.exportCoworkers && (
                  <CSVLink
                    filename={'co-workers.csv'}
                    target="_blank"
                    data={[
                      [
                        'Name',
                        'Email',
                        'Primary Phone',
                        'Role',
                        'Position',
                        'DOB',
                        'Join Date',
                      ],
                      ...selectedRows
                        ?.filter((leave) => selectedIds?.includes(leave?._id))
                        ?.map((d) => [
                          d?.name,
                          d?.email,
                          d?.primaryPhone,
                          d?.role?.value,
                          d?.position?.name,
                          d?.dob?.split('/')?.reverse()?.join('/'),
                          d?.joinDate?.split('/')?.reverse()?.join('/'),
                        ]),
                    ]}
                  >
                    <Button
                      className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                      disabled={selectedRows.length === 0}
                    >
                      Export
                    </Button>
                  </CSVLink>
                )}
              </div>
            </AccessWrapper>
          </div>
        </div>
        <Table
          locale={{emptyText}}
          className="gx-table-responsive"
          columns={CO_WORKERCOLUMNS(
            sort,
            handleToggleModal,
            handleSwitchToUser,
            mutation,
            disableUserMmutation,
            permission
          )}
          dataSource={formattedUsers(data?.data?.data?.data, key === 'admin')}
          onChange={handleTableChange}
          rowSelection={{
            onSelect: handleSelectRow,
            selectedRowKeys: selectedIds,
            columnTitle: headerCheckbox,
          }}
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
          loading={
            mutation.isLoading ||
            isFetching ||
            // resetLeavesMutation.isLoading ||
            disableUserMmutation.isLoading
          }
        />
      </Card>
    </div>
  )
}

export default CoworkersPage
