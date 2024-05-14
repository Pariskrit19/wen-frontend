import React, {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card, Col, Popconfirm, Row, Switch, Typography} from 'antd'
import SettingTable from '../CommonTable'
import {LEAVES_COLUMN, LEAVES_QUARTER_COLUMN} from 'constants/Settings'
import {updateMaintenance} from 'services/configurations'
import {
  addLeaveType,
  deleteLeaveType,
  editLeaveType,
  getLeaveTypes,
} from 'services/settings/leaveType'
import {changeDate, getIsAdmin, handleResponse} from 'helpers/utils'
import {notification} from 'helpers/notification'
import LeaveModal from './LeaveModal'
import {
  addLeaveQuarter,
  deleteLeaveQuarter,
  editLeaveQuarter,
  getLeaveQuarter,
} from 'services/settings/leaveQuarter'
import CustomIcon from 'components/Elements/Icons'
import LeaveQuarterModal from './LeaveQuarterModal'
import {socket} from 'pages/Main'
import {useSelector, useDispatch} from 'react-redux'
import {UPDATE_LEAVE_APPLY_NOTIFICATION} from 'constants/ActionTypes'
import ApplyNotificationModal from './ApplyNotificationModal'
import {selectAuthUser} from 'appRedux/reducers/Auth'

interface leaveType {
  name: string
  leaveDays: string
  gender: Array<string>
  Probation: Boolean
}

function Leave() {
  const queryClient = useQueryClient()

  const [openModal, setOpenModal] = useState(false)
  const [openQuarterModel, setQuarterModel] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isQuarterEditMode, setQuarterIsEditMode] = useState(false)
  const [arrayDataToSend, setArrayDataToSend] = useState<any>([])
  const [dataToEdit, setDataToEdit] = useState<any>({})
  const [duplicateValue, setDuplicateValue] = useState<boolean>(false)
  const {data: leaveTypes, isLoading}: any = useQuery(
    ['leaveTypes'],
    getLeaveTypes
  )
  const [notificationModal, setNotificationModal] = useState<boolean>(false)

  const {SendLeaveApplyNotification} = useSelector(
    (state: any) => state.configurations
  )

  const dispatch = useDispatch()

  const maintenanceMutation = useMutation(
    (payload: any) => updateMaintenance(payload),
    {
      onSuccess: (response) => {
        //dispatch on the redux state
        dispatch({
          type: UPDATE_LEAVE_APPLY_NOTIFICATION,
          payload: response?.data?.data?.SendLeaveApplyNotification,
        })
      },
      onError: (error) => {
        notification({message: 'Configuration Update Failed', type: 'error'})
      },
    }
  )

  const addLeaveQuarterMutation = useMutation(addLeaveQuarter, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Leave Quarters added successfully',
        'Leave Quarters add failed',
        [
          closeQuarterModel,
          () => queryClient.invalidateQueries(['leaveQuarter']),
          () => {
            socket.emit('CUD')
          },
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Leave Quarters add failed!',
        type: 'error',
      })
    },
  })

  const editLeaveQuarterMutation = useMutation(editLeaveQuarter, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Leave Quarters updated successfully',
        'Leave Quarters update failed',
        [
          closeQuarterModel,
          () => queryClient.invalidateQueries(['leaveQuarter']),
          () => {
            socket.emit('CUD')
          },
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Leave Quarters update failed!',
        type: 'error',
      })
    },
  })

  const {data: leaveQuarter, isLoading: leaveQuarterLoading}: any = useQuery(
    ['leaveQuarter'],
    () => getLeaveQuarter()
  )

  const addLeaveTypeMutation = useMutation(addLeaveType, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Leave type added successfully',
        'Leave type add failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['leaveTypes'])]
      ),
    onError: (error) => {
      notification({
        message: 'Leave type add failed!',
        type: 'error',
      })
    },
  })

  const deleteLeaveTypeMutation = useMutation(deleteLeaveType, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Leave type deleted successfully',
        'Leave type deletion failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['leaveTypes'])]
      ),
    onError: (error) => {
      notification({
        message: 'Leave Type deletion failed!',
        type: 'error',
      })
    },
  })

  const editLeaveTypeMutation = useMutation(editLeaveType, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Leave type updated successfully',
        'Leave type update failed',
        [handleCloseModal, () => queryClient.invalidateQueries(['leaveTypes'])]
      ),
    onError: (error) => {
      notification({
        message: 'Leave type update failed!',
        type: 'error',
      })
    },
  })

  const deleteQuarterTypeMutation = useMutation(deleteLeaveQuarter, {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Leave Quarters deleted successfully',
        'Leave Quarters deletion failed',
        [
          handleCloseModal,
          () => queryClient.invalidateQueries(['leaveQuarter']),
          () => {
            socket.emit('CUD')
          },
        ]
      ),
    onError: (error) => {
      notification({
        message: 'Leave Quarters deletion failed!',
        type: 'error',
      })
    },
  })

  const handleAddClick = (leave: leaveType) => {
    leave = {...leave, name: leave?.name}
    addLeaveTypeMutation.mutate(leave)
  }

  const handleEditClick = (leave: leaveType) => {
    leave = {...leave, name: leave?.name}
    editLeaveTypeMutation.mutate({id: dataToEdit?._id, leave})
  }

  const handleDeleteClick = (data: any) => {
    deleteLeaveTypeMutation.mutate({id: data._id})
  }

  const handleOpenEditModal = (data: any, type: string, currentData: any) => {
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
    type === 'Leave Type' ? setOpenModal(true) : setQuarterModel(true)
    setArrayDataToSend(data)
  }

  const onDeleteClickQuarter = (id: string) => {
    deleteQuarterTypeMutation.mutate({id})
  }

  const tempQuarters = leaveQuarter?.data?.data?.data?.[0]?.quarters?.map(
    (d: any) => ({
      name: d.quarterName,
      start: changeDate(d.fromDate),
      end: changeDate(d.toDate),
      days: d.leaves,
    })
  )

  const Footer = () => {
    return (
      !getIsAdmin() && (
        <div style={{textAlign: 'end'}}>
          <span
            className="gx-link gx-text-primary gx-mr-2"
            onClick={() => handleOpenEditQuarterModal()}
          >
            <CustomIcon name="edit" />
          </span>{' '}
          {/* <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() =>
              onDeleteClickQuarter(leaveQuarter?.data?.data?.data[0]?._id)
            }
            okText="Yes"
            cancelText="No"
          >
            <span className="gx-link gx-text-danger">
              {' '}
              <CustomIcon name="delete" />
            </span>
          </Popconfirm> */}
        </div>
      )
    )
  }

  const closeQuarterModel = () => {
    setQuarterModel(false)
    setQuarterIsEditMode(false)
  }

  const addLeaveQuarters = (payload: any) => {
    if (isQuarterEditMode) {
      editLeaveQuarterMutation.mutate({
        id: leaveQuarter?.data?.data?.data[0]._id,
        leaveQuarters: {quarters: payload},
      })
    } else {
      addLeaveQuarterMutation.mutate({quarters: payload})
    }
  }

  const handleOpenEditQuarterModal = () => {
    setQuarterModel(true)
    setQuarterIsEditMode(true)
  }

  return (
    <>
      {openModal && (
        <LeaveModal
          toggle={openModal}
          isEditMode={isEditMode}
          duplicateValue={duplicateValue}
          setDuplicateValue={setDuplicateValue}
          currentData={arrayDataToSend}
          editData={dataToEdit}
          isLoading={
            addLeaveTypeMutation.isLoading || editLeaveTypeMutation.isLoading
          }
          onSubmit={isEditMode ? handleEditClick : handleAddClick}
          onCancel={handleCloseModal}
        />
      )}
      {openQuarterModel && (
        <LeaveQuarterModal
          toggle={openQuarterModel}
          isEditMode={isQuarterEditMode}
          editData={leaveQuarter?.data?.data?.data[0]}
          isLoading={
            addLeaveQuarterMutation.isLoading ||
            editLeaveQuarterMutation.isLoading
          }
          onSubmit={addLeaveQuarters}
          onCancel={closeQuarterModel}
        />
      )}

      <ApplyNotificationModal
        toggle={notificationModal}
        closeModal={() => setNotificationModal(false)}
      />

      <Row>
        <Col span={6} xs={24} md={12}>
          <Card
            title="Leave Type"
            extra={
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={() => handleOpenModal('Leave Type', leaveTypes)}
                disabled={getIsAdmin()}
              >
                Add
              </Button>
            }
          >
            <SettingTable
              data={leaveTypes?.data?.data?.data}
              columns={LEAVES_COLUMN(
                (value) => handleDeleteClick(value),
                (value) => handleOpenEditModal(value, 'Leave Type', leaveTypes)
              )}
              onAddClick={() => handleOpenModal('Leave Type', leaveTypes)}
              isLoading={isLoading || deleteLeaveTypeMutation.isLoading}
            />
          </Card>
        </Col>
        <Col span={6} xs={24} md={12} style={{paddingLeft: 0}}>
          <Card headStyle={{padding: '10px 24px'}}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{display: 'flex', columnGap: '5px', flex: 'none'}}>
                <Typography
                  className="typography"
                  style={{
                    fontSize: '15px',
                    fontWeight: '400',
                  }}
                >
                  Auto Leave Apply Notification
                </Typography>{' '}
                <Switch
                  disabled={maintenanceMutation?.isLoading}
                  style={{width: '50px'}}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  checked={SendLeaveApplyNotification}
                  onChange={(checked: boolean) =>
                    maintenanceMutation.mutate({
                      SendLeaveApplyNotification: checked,
                    })
                  }
                />
              </div>
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={() => setNotificationModal(true)}
                disabled={getIsAdmin()}
              >
                Notify to Apply Leave
              </Button>
            </div>
          </Card>

          <Card
            title="Leave Quarter"
            extra={
              <Popconfirm
                title="Adding next year's quarters will remove current year's quarters. Do you want to proceed?"
                onConfirm={() => handleOpenModal('Leave Quarter', '')}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                  disabled={getIsAdmin()}
                >
                  Add
                </Button>
              </Popconfirm>
            }
          >
            <SettingTable
              data={tempQuarters}
              columns={LEAVES_QUARTER_COLUMN()}
              isLoading={
                leaveQuarterLoading || deleteQuarterTypeMutation.isLoading
              }
              pagination={false}
              footer={
                leaveQuarter?.data?.data?.data.length !== 0 ? Footer : undefined
              }
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Leave
