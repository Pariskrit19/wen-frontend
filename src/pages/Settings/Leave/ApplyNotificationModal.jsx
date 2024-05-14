import {useQuery, useMutation} from '@tanstack/react-query'
import {Button, Modal, Select, Tag} from 'antd'
import {CANCEL_TEXT} from 'constants/Common'
import {notification} from 'helpers/notification'
import React, {useState} from 'react'
import {createNotification} from 'services/notifications'
import {getAllUsers} from 'services/users/userDetails'

const ApplyNotificationModal = ({toggle, closeModal}) => {
  const [selectedItems, setSelectedItems] = useState([])

  const {data, isLoading} = useQuery(
    ['users'],
    () =>
      getAllUsers({
        active: true,
      }),
    {
      select: (data) =>
        data?.data?.data?.data.map((d) => ({
          value: d?._id,
          label: d?.name,
        })),
    }
  )

  const filteredOptions =
    data &&
    data.filter((d) => !selectedItems.map((d) => d?.key).includes(d?.value))

  const createNotifications = useMutation(
    (payload) => createNotification(payload),
    {
      onSuccess: (response) => {
        notification({
          message: 'Notification is sent to Co-workers',
          type: 'success',
        })
        closeModal()
        setSelectedItems([])
      },
      onError: (error) => {
        notification({
          message: 'Unable to Sent Notification to Co-workers',
          type: 'error',
        })
      },
    }
  )

  return (
    <Modal
      title={'Notification for Co-workers'}
      visible={toggle}
      onCancel={() => {
        setSelectedItems([])
        closeModal()
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            setSelectedItems([])
            closeModal()
          }}
        >
          {CANCEL_TEXT}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={createNotifications.isLoading}
          onClick={() => {
            if (selectedItems.length > 0) {
              const userIds = selectedItems.map((d) => d.key)
              const data = {
                showTo: userIds,
                module: 'Leave',
                remarks: `You have not applied for Leave. Please apply !`,
                extraInfo: JSON.stringify({
                  tab: '1',
                }),
              }
              createNotifications.mutate(data)
            }
          }}
          //   disabled={isLoading}
        >
          Submit
        </Button>,
      ]}
    >
      <Select
        labelInValue
        mode="multiple"
        placeholder="Select Co-workers"
        value={selectedItems}
        onChange={(value) => {
          setSelectedItems(value)
        }}
        style={{width: '100%'}}
        options={filteredOptions}
        optionFilterProp="label"
        disabled={isLoading}
      />
    </Modal>
  )
}

export default ApplyNotificationModal
