import React, {useState} from 'react'
import {Table, Typography} from 'antd'
import {LEAVE_REPORT_COLUMNS} from 'constants/LeaveReport'
import {emptyText} from 'constants/EmptySearchAntd'
import LeaveReportModal from 'components/Modules/LeaveReportModal'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import moment from 'moment'

function SummaryTable({data, quarterId}) {
  // init states
  const [sort, setSort] = useState({
    column: undefined,
    order: 'ascend',
    field: 'name',
    columnKey: 'name',
  })

  const {
    role: {key, permission},
  } = useSelector(selectAuthUser)
  const [page, setPage] = useState({page: 1, limit: 10})
  const [openModal, setOpenModal] = useState(false)
  const [specificUserDetails, setSpecificUserDetails] = useState({})

  const summaryLeaveReport = (leaveData) => {
    return leaveData
      ?.filter((item) => {
        if (!item?.leaves || item?.leaves?.length !== 0) {
          if (!item?.user?.exitDate) {
            return true
          } else {
            if (
              moment(item?.leaves?.[0]?.quarter?.fromDate) <
              moment(item?.user?.exitDate)
            ) {
              return true
            } else return false
          }
        } else return false
      })
      ?.map((leave) => ({
        ...leave,
        name: leave?.user?.name,
        allocatedLeaves: leave?.leaves?.[0]?.allocatedLeaves,
        remainingLeaves: leave?.leaves?.[0]?.remainingLeaves,
        carriedOverLeaves: leave?.leaves?.[0]?.carriedOverLeaves,
        leaveDeductionBalance: leave?.leaves?.[0]?.leaveDeductionBalance,
        sickLeaves: leave?.leaves?.[0]?.approvedLeaves?.sickLeaves,
        casualLeaves: leave?.leaves?.[0]?.approvedLeaves?.casualLeaves,
      }))
  }

  const reportPermission = permission?.Reports?.editLeaveReport

  const handleTableChange = (pagination, filters, sorter) => {
    setSort(sorter)
  }

  const handlePageChange = (pageNumber) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const onShowSizeChange = (_, pageSize) => {
    setPage((prev) => ({...page, limit: pageSize}))
  }
  const handleOpenModal = (record) => {
    setSpecificUserDetails(record)
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const columns = LEAVE_REPORT_COLUMNS(sort, handleOpenModal)?.filter(
    (item) => {
      if (
        !reportPermission ||
        moment() > moment(data?.[0]?.leaves?.[0]?.quarter?.toDate)
      ) {
        return item?.title !== 'Action'
      } else return true
    }
  )

  return (
    <>
      {openModal && (
        <LeaveReportModal
          toggle={openModal}
          closeModal={handleCloseModal}
          userDetails={specificUserDetails}
          quarterId={quarterId}
        />
      )}
      <div className="components-table-demo-control-bar">
        <div className="gx-d-flex gx-justify-content-between gx-flex-row"></div>
      </div>
      <Table
        locale={{emptyText}}
        className="gx-table-responsive"
        columns={columns}
        dataSource={summaryLeaveReport(data)}
        onChange={handleTableChange}
        pagination={{
          current: page.page,
          pageSize: page.limit,
          pageSizeOptions: ['5', '10', '20', '50'],
          showSizeChanger: true,
          // total: data?.data?.data?.data?.[quarter - 1]?.length || 1,
          onShowSizeChange,
          // hideOnSinglePage: data?.data?.data?.data?.[quarter - 1]?.length
          //   ? false
          //   : true,
          onChange: handlePageChange,
        }}
        footer={() => (
          <Typography
            className="typography"
            style={{
              fontSize: '15px',
              fontWeight: '400',
            }}
          >
            Leave adj is leaves to be deducted.
          </Typography>
        )}
        // loading={isLoading || isFetching}
      />
    </>
  )
}

export default SummaryTable
