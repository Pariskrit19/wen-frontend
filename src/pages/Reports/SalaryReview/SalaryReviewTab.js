import React, {useState} from 'react'
import {Button, Card, Form, Table} from 'antd'
import Select from 'components/Elements/Select'
import {emptyText} from 'constants/EmptySearchAntd'
import {useQuery} from '@tanstack/react-query'
import {getAllUsers, getSalaryReviewUsers} from 'services/users/userDetails'
import {ADMINISTRATOR} from 'constants/UserNames'
import {changeDate, filterSpecificUser} from 'helpers/utils'
import {REVIEWDATES, SALARY_REVIEW_COLUMN} from 'constants/SalaryReviewColumn'

const FormItem = Form.Item

const formattedSalaryReview = (data) => {
  return data?.map((d) => ({
    coworkers: d?.name,
    upcomingreviewdate: changeDate(d?.newSalaryReviewDate),
    pastreview: d?.lastReviewDate,
  }))
}

const SalaryReviewTab = () => {
  const [form] = Form.useForm()
  const [sort, setSort] = useState({
    column: undefined,
    order: 'ascend',
    field: 'upcomingreviewdate',
    columnKey: 'upcomingreviewdate',
  })
  const [page, setPage] = useState({page: 1, limit: 50})
  const [selectedCoworker, setSelectedCoworker] = useState(undefined)
  const [selectedReviewDate, setSelectedReviewDate] = useState(
    REVIEWDATES[0].id
  )

  const {
    data: salaryReview,
    isLoading: salaryLoading,
    isFetching: salaryFetching,
  } = useQuery(
    ['usersSalaryReview', selectedCoworker, selectedReviewDate],
    () =>
      getSalaryReviewUsers({
        days: selectedReviewDate ?? '',
        user: selectedCoworker ? selectedCoworker : '',
      })
  )

  const {
    data: usersData,
    isFetching,
    isLoading,
  } = useQuery(['WorkLogusers'], () =>
    getAllUsers({
      active: 'true',
      fields: '_id,name',
      sort: 'name',
    })
  )

  const handleReviewDateChange = (value) => {
    setSelectedReviewDate(value)
  }

  const handleCoworkerChange = (value) => {
    setSelectedCoworker(value)
  }

  const handleResetFilter = () => {
    setSelectedCoworker(undefined)
    setSelectedReviewDate(REVIEWDATES[0].id)
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

  return (
    <>
      <div className="gx-mt-2"></div>
      <div className="components-table-demo-control-bar">
        <div className="gx-d-flex gx-justify-content-between gx-flex-row">
          <Form layout="inline" form={form}>
            <FormItem className="direct-form-item">
              <Select
                placeholder="Select Review Date"
                onChange={handleReviewDateChange}
                value={selectedReviewDate}
                options={REVIEWDATES}
              />
            </FormItem>
            <FormItem className="direct-form-item">
              <Select
                placeholder="Select Co-worker"
                onChange={handleCoworkerChange}
                value={selectedCoworker}
                options={filterSpecificUser(
                  usersData?.data?.data?.data,
                  ADMINISTRATOR
                )?.map((x) => ({
                  id: x._id,
                  value: x.name,
                }))}
              />
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
        </div>
      </div>
      <Table
        locale={{emptyText}}
        className="gx-table-responsive"
        columns={SALARY_REVIEW_COLUMN(sort)}
        dataSource={formattedSalaryReview(salaryReview?.data?.data?.users)}
        onChange={handleTableChange}
        pagination={{
          current: page.page,
          pageSize: page.limit,
          pageSizeOptions: ['25', '50', '100'],
          showSizeChanger: true,
          total: salaryReview?.data?.data?.users.length || 1,
          onShowSizeChange,
          hideOnSinglePage: true,
          onChange: handlePageChange,
        }}
        loading={isLoading || isFetching || salaryLoading || salaryFetching}
      />
    </>
  )
}

export default SalaryReviewTab
