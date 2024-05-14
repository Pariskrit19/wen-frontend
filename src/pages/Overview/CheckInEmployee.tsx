import React, {useState} from 'react'
import {Card, Table} from 'antd'
import {OVERVIEW_CHECKEDIN} from 'constants/Overview'
import moment from 'moment'
import LocationMap from './LocationMap'
import {emptyText} from 'constants/EmptySearchAntd'

const formattedUsers = (users: any[]) => {
  return users?.map((user) => {
    const punchInLocation = user?.data?.[0]?.punchInLocation
    const punchOutLocation = user?.data?.at(-1)?.punchOutLocation
    const checkIn = user?.data?.[0]?.punchInTime
    const checkOut = user?.data?.at(-1)?.punchOutTime
    const punchInIp = user?.data?.[0]?.punchInIp || ''
    const punchOutIp = user?.data?.at(-1)?.punchOutIp || ''

    return {
      ...user,
      key: user._id.attendanceDate + user._id.user,
      name: user._id.user,
      checkIn: moment(checkIn).format('LTS'),
      checkOut: checkOut ? moment(checkOut).format('LTS') : 'N/A',
      checkOutLocation:
        punchOutLocation && punchOutLocation?.length === 2 ? 'Show On Map' : '',
      checkInLocation:
        punchInLocation && punchInLocation?.length === 2 ? 'Show On Map' : '',
      punchInLocation: punchInLocation,
      punchOutLocation: punchOutLocation,
      punchInIp,
      punchOutIp,
    }
  })
}

function CheckedInEmployee({
  checkIn,
  isLoading,
}: {
  checkIn: any[]
  isLoading: boolean
}) {
  const [openMap, setOpenMap] = useState(false)
  const [sort, setSort] = useState({
    order: 'ascend',
    field: 'name',
    columnKey: 'name',
  })
  const [page, setPage] = useState({page: 1, limit: 20})

  const [selectedCheckedInUser, setSelectedCheckedInUser] = useState([])
  const [selectedUsername, setSelectedUserName] = useState('')

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSort(sorter)
  }

  const onShowSizeChange = (_: any, pageSize: number) => {
    setPage((prev) => ({...page, limit: pageSize}))
  }

  const handlePageChange = (pageNumber: number) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const handleShowMap = (record: any, PunchOut: string | undefined) => {
    if (PunchOut) {
      if (
        Array.isArray(record?.punchOutLocation) &&
        record?.punchOutLocation?.length === 2
      ) {
        setOpenMap(true)
        setSelectedCheckedInUser(record?.punchOutLocation || undefined)
        setSelectedUserName(record?.name)
      } else {
        return
      }
    } else {
      setOpenMap(true)
      setSelectedCheckedInUser(record?.punchInLocation || undefined)
      setSelectedUserName(record?.name)
    }
  }
  return (
    <>
      <LocationMap
        title={selectedUsername}
        open={openMap}
        onClose={() => {
          setOpenMap(false)
        }}
        location={selectedCheckedInUser}
      />
      <Card title={''}>
        <Table
          locale={{emptyText}}
          className="gx-table-responsive"
          columns={OVERVIEW_CHECKEDIN(sort, handleShowMap)}
          dataSource={formattedUsers(checkIn)}
          onChange={handleTableChange}
          pagination={{
            current: page.page,
            pageSize: page.limit,
            pageSizeOptions: ['20', '50'],
            showSizeChanger: true,
            total: checkIn.length || 1,
            onShowSizeChange,
            hideOnSinglePage: true,
            onChange: handlePageChange,
          }}
          loading={isLoading}
        />
      </Card>
    </>
  )
}

export default CheckedInEmployee
