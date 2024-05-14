import {Table} from 'antd'
import React from 'react'
import {emptyText} from 'constants/EmptySearchAntd'

function CommonTable({
  data,
  columns,
  isLoading,
  onAddClick,
  hideAddButton = false,
  pagination = true,
  footer = undefined,
}: {
  data: any
  columns: any
  isLoading?: boolean
  onAddClick?: React.MouseEventHandler<HTMLElement>
  hideAddButton?: boolean
  pagination?: any
  footer?: any
}) {
  const formattedData = data?.map((item: any, index: number) => ({
    ...item,
    key: item?._id ?? index,
  }))
  return (
    <>
      <Table
        locale={{emptyText}}
        className="gx-table-responsive"
        columns={columns}
        dataSource={formattedData}
        pagination={pagination}
        loading={isLoading}
        footer={footer}
      />
    </>
  )
}

export default CommonTable
