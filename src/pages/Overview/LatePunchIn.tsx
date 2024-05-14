import React, {useState} from 'react'
import {Button, Card, Modal, Table} from 'antd'
import {OVERVIEW_LATEPUNCHIN} from 'constants/Overview'
import {emptyText} from 'constants/EmptySearchAntd'
import {LATE_ARRIVAL_KEY, decrypt} from 'util/crypto'
import {sortFromDate, subtractHourTime} from 'helpers/utils'
import moment from 'moment'

function LatePunchedIn({latePunchInSection}: {latePunchInSection: any}) {
  const [sort, setSort] = useState({
    column: undefined,
    order: 'ascend',
    field: 'name',
    columnKey: 'name',
  })
  const [lateModal, setLateModal] = useState(false)
  const [lateReason, setLateReason] = useState('')
  const [page, setPage] = useState({page: 1, limit: 50})

  const sortedData = (datas: any[]) => {
    // group by attendance date in object
    const groupByAttendance = datas?.reduce((acc, item: any) => {
      acc[item.attendanceDate] = [...(acc[item.attendanceDate] || [])].concat(
        item
      )
      return acc
    }, {})

    return Object.values(groupByAttendance)?.reduce((acc: any, x: any) => {
      acc.push(x[0])
      return sortFromDate(acc, 'attendanceDate')
    }, [])
  }

  const lateArrivalThreshold = decrypt(
    latePunchInSection?.data?.data?.lateArrivalThreshold,
    LATE_ARRIVAL_KEY
  )

  const formattedAttendancesFunction = (attendances: any) => {
    return attendances?.map((att: any) => {
      const checkInTime = att?.data?.[0]?.punchInTime
      const officeTime = att?.data?.[0]?.officeTime?.utcDate

      const lateBy = subtractHourTime({
        userOfficeTime: officeTime,
        lateArrivalThreshold,
        userPunchIn: checkInTime,
      })
      return {
        ...att,
        key: att?._id?.userId,
        name: att?._id?.user,
        checkIn: moment(att?.data?.[0]?.punchInTime).format('LTS'),
        checkOut: att?.data?.[0]?.punchOutTime
          ? moment(att?.data?.[0]?.punchOutTime).format('LTS')
          : 'N/A',
        lateBy: lateBy.lateTime,
        lateByInMilliseconds: lateBy.timeInMilliSeconds,
        lateReason: att?.data?.[0]?.punchInNote,
      }
    })
  }

  const formattedAttendacesData = decrypt(
    latePunchInSection?.data?.data?.attendances,
    LATE_ARRIVAL_KEY
  )?.map((att: any) => ({
    ...att,
    data: att.data && sortedData(att.data),
  }))

  const onShowSizeChange = (_: any, pageSize: number) => {
    setPage((prev) => ({...page, limit: pageSize}))
  }

  const handlePageChange = (pageNumber: number) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (!sorter.order) {
      setSort({...sorter, order: 'ascend'})
    } else setSort(sorter)
  }

  const handleToggleModal = (lateReason: string) => {
    setLateModal((prev) => !prev)
    setLateReason(lateReason)
  }
  return (
    <Card title={''}>
      {lateModal && (
        <Modal
          title={'Late Punch In Reason'}
          visible={lateModal}
          mask={false}
          onCancel={() => setLateModal(false)}
          footer={[
            <Button key="back" onClick={() => setLateModal(false)}>
              Close
            </Button>,
          ]}
        >
          <p style={{fontSize: '14px'}}>{lateReason}</p>
        </Modal>
      )}
      <Table
        locale={{emptyText}}
        className="gx-table-responsive"
        columns={OVERVIEW_LATEPUNCHIN(sort, handleToggleModal)}
        dataSource={formattedAttendancesFunction(formattedAttendacesData)}
        onChange={handleTableChange}
        pagination={{
          current: page.page,
          pageSize: page.limit,
          pageSizeOptions: ['25', '50', '100'],
          showSizeChanger: true,
          total: latePunchInSection?.length || 1,
          onShowSizeChange,
          hideOnSinglePage: true,
          onChange: handlePageChange,
        }}
      />
    </Card>
  )
}

export default LatePunchedIn
