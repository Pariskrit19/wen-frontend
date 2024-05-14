import React, {ChangeEvent, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card, Form, Input, Col, Row, Spin} from 'antd'
import SettingTable from '../CommonTable'
import {
  getInvitedUsers,
  inviteUsers,
} from 'services/settings/coworkers/inviteUser'
import {
  INVITED_EMPLOYEES_COLUMN,
  POSITION_COLUMN,
  ROLE_COLUMN,
} from 'constants/Settings'
import {getIsAdmin, handleResponse} from 'helpers/utils'
import {notification} from 'helpers/notification'
import CommonModal from '../CommonModal'
import {
  addPosition,
  deletePosition,
  editPosition,
} from 'services/settings/coworkers/positions'
import {
  addPositionTypes,
  deletePositionTypes,
  editPositionType,
} from 'services/settings/coworkers/positionType'
import {
  addRole,
  deleteRole,
  updateRole,
} from 'services/settings/coworkers/roles'
import {officeDomain} from 'constants/OfficeDomain'
import {emailRegex} from 'constants/EmailTest'
import {socket} from 'pages/Main'
import RoleAccess from 'constants/RoleAccess'
import RolePermissionModal from '../RolePermissionModal'
import {RolePermissionProvider} from 'context/RolePermissionConext'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {useDispatch, useSelector} from 'react-redux'
import {updateRolePermission} from 'appRedux/actions'
import {
  getUserPosition,
  getUserPositionTypes,
  getUserRoles,
} from 'services/users/userDetails'

const layout = {
  // labelCol: { span: 8 },
  // wrapperCol: { span: 16 }
}

const types = {
  POSITION: 'Position',
  POSITION_TYPE: 'Position Type',
  ROLE: 'Role',
}

function Coworkers() {
  const {
    role: {
      permission: {Settings},
    },
  } = useSelector(selectAuthUser)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [type, setType] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [dataToEdit, setDataToEdit] = useState<any>({})
  const [arrayDataToSend, setArrayDataToSend] = useState<any>([])
  const [duplicateValue, setDuplicateValue] = useState<boolean>(false)
  const [openRole, setOpenRole] = useState<boolean>(false)

  const handleUserInviteSuccess = () => {
    form.resetFields()
    queryClient.invalidateQueries(['inviteUsers'])
  }

  const {
    data: positions,
    isFetching: isPositionsFetching,
    isLoading,
  } = useQuery(['positions'], getUserPosition)
  const {data: invitedUsers, isFetching: isInviteUsersFetching} = useQuery(
    ['inviteUsers'],
    getInvitedUsers
  )
  const {data: positionTypes, isFetching: isPositionTypesFetching} = useQuery(
    ['positionTypes'],
    getUserPositionTypes
  )
  const {data: roles} = useQuery(['roles'], getUserRoles, {
    onError: (err) => console.log(err),
    select: (res) =>
      res?.data?.data?.data?.map(
        (role: {key: string; value: string; _id: string}) => ({
          ...role,
          key: role._id,
          name: role?.value,
        })
      ),
  })

  const inviteUserMutation = useMutation(inviteUsers, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'User invited successfully',
        'User invite failed',
        [
          handleUserInviteSuccess,
          () => {
            socket.emit('CUD')
          },
          () => {
            socket.emit('invite-user', {
              showTo: [RoleAccess.Admin, RoleAccess.HumanResource],
              remarks: `${email} has been invited.`,
              module: 'User',
            })
          },
        ]
      ),
    onError: (error) => {
      notification({message: 'User invite failed!', type: 'error'})
    },
  })

  const addPositionMutation = useMutation(addPosition, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Position added successfully',
        'Position add failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['positions'])]
      ),
    onError: (error) => {
      notification({
        message: 'Position add failed!',
        type: 'error',
      })
    },
  })
  const deletePositionMutation = useMutation(deletePosition, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Position deleted successfully',
        'Position deletion failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['positions'])]
      ),
    onError: (error) => {
      notification({
        message: 'Position deletion failed!',
        type: 'error',
      })
    },
  })

  const addPositionTypeMutation = useMutation(addPositionTypes, {
    onSuccess: (response) => {
      handleResponse(
        response,
        'Position type added successfully',
        'Position type add failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['positionTypes']),
        ]
      )
    },
    onError: (error) => {
      notification({
        message: 'Position type add failed!',
        type: 'error',
      })
    },
  })
  const deletePositionTypeMutation = useMutation(deletePositionTypes, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Position type deleted successfully',
        'Position type deletion failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['positionTypes']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Position type deletion failed!',
        type: 'error',
      })
    },
  })

  const deleteRoleMutation = useMutation(deleteRole, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Role deleted successfully',
        'Role deletion failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['roles'])]
      ),
    onError: (error) => {
      notification({
        message: 'Role deletion failed!',
        type: 'error',
      })
    },
  })
  const addRoleMutation = useMutation(addRole, {
    onSuccess: (response) =>
      handleResponse(response, 'Role added successfully', 'Role add failed', [
        handleCloseModal,
        () => queryClient.invalidateQueries(['roles']),
      ]),
    onError: (error) => {
      notification({
        message: 'Role add failed!',
        type: 'error',
      })
    },
  })
  const editRoleMutation = useMutation(updateRole, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Role updated successfully',
        'Role update failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['roles']),
          () => {
            if (response?.data?.data?.data?.key === 'admin') {
              dispatch(
                updateRolePermission(response?.data?.data?.data?.permission)
              )
            }
          },
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Role update failed!',
        type: 'error',
      })
    },
  })

  const editPositionMutation = useMutation(editPosition, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Position updated successfully',
        'Position update failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['positions'])]
      ),
    onError: (error) => {
      notification({
        message: 'Position update failed!',
        type: 'error',
      })
    },
  })
  const editPositionTypeMutation = useMutation(editPositionType, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Position Type updated successfully',
        'Position Type update failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['positionTypes']),
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Position Type update failed!',
        type: 'error',
      })
    },
  })

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }

  const handleAddClick = (input: string) => {
    if (type === types.POSITION) addPositionMutation.mutate({name: input})

    if (type === types.POSITION_TYPE)
      addPositionTypeMutation.mutate({name: input})
  }

  const handleAddRolePermission = (payload: any) => {
    addRoleMutation.mutate(payload)
  }

  const handleEditRolePermission = (payload: any) => {
    let editData = {
      id: dataToEdit?._id,
      value: payload?.value,
      permission: payload?.permission,
    }
    editRoleMutation.mutate(editData)
  }

  const handleEditClick = (input: any) => {
    if (type === types.POSITION)
      editPositionMutation.mutate({id: dataToEdit?._id, name: input})

    if (type === types.POSITION_TYPE)
      editPositionTypeMutation.mutate({id: dataToEdit?._id, name: input})
  }

  const handleDeleteClick = (data: any, type: string) => {
    if (type === types.POSITION)
      deletePositionMutation.mutate({
        id: data._id,
      })

    if (type === types.POSITION_TYPE)
      deletePositionTypeMutation.mutate({id: data._id})

    if (type === types.ROLE) deleteRoleMutation.mutate({id: data._id})
  }

  const handleOpenEditModal = (data: any, type: string, currentData: any) => {
    setIsEditMode(true)
    setType(type)
    setDataToEdit(data)
    setArrayDataToSend(currentData)
    if (type === 'Role') setOpenRole(true)
    else setOpenModal(true)
  }

  const handleCloseModal = () => {
    setIsEditMode(false)
    setDuplicateValue(false)
    setDataToEdit({})
    setOpenModal(false)
    setOpenRole(false)
  }
  const handleOpenModal = (type: string, data: any) => {
    setOpenModal(true)
    setType(type)
    setArrayDataToSend(data)
  }

  const handleInviteSubmit = () => {
    form.validateFields().then(() => inviteUserMutation.mutate({email}))
  }

  return (
    <>
      {openModal && (
        <CommonModal
          toggle={openModal}
          type={type}
          duplicateValue={duplicateValue}
          setDuplicateValue={setDuplicateValue}
          currentData={arrayDataToSend}
          isEditMode={isEditMode}
          editData={dataToEdit}
          isLoading={
            addPositionMutation.isLoading ||
            addPositionTypeMutation.isLoading ||
            addRoleMutation.isLoading ||
            editPositionMutation.isLoading ||
            editRoleMutation.isLoading ||
            editPositionTypeMutation.isLoading
          }
          onSubmit={isEditMode ? handleEditClick : handleAddClick}
          onCancel={handleCloseModal}
        />
      )}
      {openRole && (
        <RolePermissionProvider>
          <RolePermissionModal
            toggle={openRole}
            onSubmit={
              isEditMode ? handleEditRolePermission : handleAddRolePermission
            }
            onCancel={handleCloseModal}
            duplicateValue={duplicateValue}
            setDuplicateValue={setDuplicateValue}
            width={1400}
            currentData={arrayDataToSend}
            isEditMode={isEditMode}
            editData={dataToEdit}
            isLoading={
              addPositionMutation.isLoading ||
              addPositionTypeMutation.isLoading ||
              addRoleMutation.isLoading ||
              editPositionMutation.isLoading ||
              editRoleMutation.isLoading ||
              editPositionTypeMutation.isLoading
            }
          />
        </RolePermissionProvider>
      )}

      <Row>
        <Col span={6} xs={24} md={12}>
          <Card title="Invite A Co-worker">
            <Form
              {...layout}
              form={form}
              name="control-hooks"
              layout="vertical"
            >
              <div className="gx-d-flex gx-justify-content-between flex-column ">
                <div className="email-input">
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      {
                        required: true,
                        validator: async (rule, value) => {
                          try {
                            if (!value) throw new Error('Email is required.')
                            value.split(',').forEach((item: any) => {
                              if (!emailRegex.test(item.trim())) {
                                throw new Error('Please enter a valid email.')
                              }
                              if (item.split('@')[1].trim() !== officeDomain) {
                                throw new Error(
                                  'Please use email provided by the organization.'
                                )
                              }
                            })
                          } catch (err) {
                            throw new Error(err.message)
                          }
                        },
                      },
                    ]}
                    className="email-input"
                  >
                    <Input
                      placeholder="Email address"
                      onChange={handleEmailChange}
                    />
                  </Form.Item>
                </div>
                {inviteUserMutation?.isLoading ? (
                  <Spin style={{marginTop: '2rem'}} />
                ) : (
                  <Form.Item>
                    <Button
                      key="submit"
                      type="primary"
                      className=" gx-btn gx-btn-primary gx-text-white email-invite"
                      onClick={handleInviteSubmit}
                      disabled={getIsAdmin()}
                    >
                      Invite
                    </Button>
                  </Form.Item>
                )}
                {/* <Form.Item>
                  <Button
                    key="submit"
                    type="primary"
                    className=" gx-btn gx-btn-primary gx-text-white email-invite"
                    onClick={handleInviteSubmit}
                  >
                    Invite
                  </Button>
                </Form.Item> */}
              </div>
            </Form>
            <p style={{marginTop: '4px'}}>
              To invite multiple email, separate the emails using comma.
            </p>
            <SettingTable
              data={invitedUsers?.data?.data?.data}
              isLoading={isLoading || isInviteUsersFetching}
              columns={INVITED_EMPLOYEES_COLUMN()}
              hideAddButton
            />
          </Card>
        </Col>

        <Col span={6} xs={24} md={12} style={{paddingLeft: 0}}>
          <Card
            title="Position"
            extra={
              <Button
                className="gx-btn gx-btn-primary gx-text-white "
                onClick={() => handleOpenModal('Position', positions)}
                disabled={getIsAdmin()}
              >
                Add
              </Button>
            }
          >
            <SettingTable
              data={positions?.data?.data?.data}
              columns={POSITION_COLUMN(
                (value) => handleDeleteClick(value, types.POSITION),
                (value) => handleOpenEditModal(value, types.POSITION, positions)
              )}
              onAddClick={() => handleOpenModal(types.POSITION, positions)}
              isLoading={
                isLoading ||
                isPositionsFetching ||
                deletePositionMutation.isLoading
              }
            />
          </Card>
        </Col>
      </Row>
      <Row>
        <Col span={6} xs={24} md={12} style={{paddingLeft: 0}}>
          <Card
            title="Position Type"
            extra={
              <Button
                className="gx-btn gx-btn-primary gx-text-white settings-add"
                onClick={() => handleOpenModal('Position Type', positionTypes)}
                disabled={getIsAdmin()}
              >
                Add
              </Button>
            }
          >
            <SettingTable
              data={positionTypes?.data?.data?.data}
              columns={POSITION_COLUMN(
                (value) => handleDeleteClick(value, types.POSITION_TYPE),
                (value) =>
                  handleOpenEditModal(value, types.POSITION_TYPE, positionTypes)
              )}
              isLoading={
                isLoading ||
                isPositionTypesFetching ||
                deletePositionTypeMutation.isLoading
              }
              onAddClick={() => handleOpenModal('Position Type', positionTypes)}
            />
          </Card>
        </Col>
        <Col span={6} xs={24} md={12} style={{paddingLeft: 0}}>
          <Card
            title="Role"
            extra={
              Settings?.coworkerCUD && (
                <Button
                  className="gx-btn gx-btn-primary gx-text-white settings-add"
                  onClick={() => setOpenRole(true)}
                  disabled={getIsAdmin()}
                >
                  Add
                </Button>
              )
            }
          >
            <SettingTable
              data={roles}
              columns={ROLE_COLUMN(
                (value) => handleDeleteClick(value, types.ROLE),
                (value) => handleOpenEditModal(value, types.ROLE, roles),
                Settings?.coworkerCUD
              )}
              isLoading={deleteRoleMutation.isLoading || isLoading}
              onAddClick={() => setOpenRole(true)}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Coworkers
