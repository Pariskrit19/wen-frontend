import React, {useState} from 'react'
import {Card, Table} from 'antd'
import {OVERVIEW_NOTCHECKEDIN} from 'constants/Overview'
import {emptyText} from 'constants/EmptySearchAntd'

const formattedUsers = (users: any[]) => {
  return users?.map((user) => ({
    key: user._id,
    name: user.name,
    checkIn: 'N/A',
    checkOut: 'N/A',
  }))
}

function UnCheckedInEmployee({notCheckInSection}: {notCheckInSection: any[]}) {
  const [sort, setSort] = useState({
    column: undefined,
    order: 'ascend',
    field: 'name',
    columnKey: 'name',
  })
  const [page, setPage] = useState({page: 1, limit: 50})

  const onShowSizeChange = (_: any, pageSize: number) => {
    setPage((prev) => ({...page, limit: pageSize}))
  }

  const handlePageChange = (pageNumber: number) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSort(sorter)
  }
  return (
    <Card title={''}>
      <Table
        locale={{emptyText}}
        className="gx-table-responsive"
        columns={OVERVIEW_NOTCHECKEDIN(sort)}
        dataSource={formattedUsers(notCheckInSection)}
        onChange={handleTableChange}
        pagination={{
          current: page.page,
          pageSize: page.limit,
          pageSizeOptions: ['25', '50', '100'],
          showSizeChanger: true,
          total: notCheckInSection?.length || 1,
          onShowSizeChange,
          hideOnSinglePage: true,
          onChange: handlePageChange,
        }}
      />
    </Card>
  )
}

export default UnCheckedInEmployee
