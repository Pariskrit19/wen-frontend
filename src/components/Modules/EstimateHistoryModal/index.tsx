import React from 'react'
import {Modal, Button, Table} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import {isoDateWithoutTimeZone} from 'helpers/utils'

type propsData = {
  estimatedHours: number
  updatedAt: string
  _id: string
  updatedBy: {_id: string; name: string}
}

type estimateModal = {
  open: boolean
  setEstimateHourOpen: React.Dispatch<React.SetStateAction<boolean>>
  data: Array<propsData>
}

const columns: ColumnsType<propsData> = [
  {
    title: 'Updated At',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: (_, {updatedAt}) => (
      <span>{isoDateWithoutTimeZone(updatedAt)}</span>
    ),
  },
  {
    title: 'Estimated Hour',
    dataIndex: 'estimatedHours',
    key: 'estimatedHours',
    render: (text: number | string) => <span>{text} hr</span>,
  },
  {
    title: 'Updated By',
    dataIndex: 'updatedBy',
    key: 'updatedBy',
    render: (info: {_id: string; name: string}) => <span>{info?.name}</span>,
  },
]

const EstimateHistoryModal: React.FC<estimateModal> = ({
  open,
  setEstimateHourOpen,
  data,
}: estimateModal) => {
  const handleCancel = () => setEstimateHourOpen(false)

  const reversedData = data && [...data]?.reverse()
  return (
    <Modal
      footer={[
        <Button key="back" onClick={handleCancel}>
          Close
        </Button>,
      ]}
      title="Estimated Hour History"
      visible={open}
      onCancel={handleCancel}
    >
      <Table columns={columns} dataSource={reversedData} pagination={false} />
    </Modal>
  )
}

export default EstimateHistoryModal
