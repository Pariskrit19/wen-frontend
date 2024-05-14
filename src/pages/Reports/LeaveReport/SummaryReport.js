import {useEffect, useState, useRef} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, DatePicker, Form, Input, Popconfirm} from 'antd'
import Select from 'components/Elements/Select'
import {PLACE_HOLDER_CLASS} from 'constants/Common'
import {ADMINISTRATOR} from 'constants/UserNames'
import {filterSpecificUser, getIsAdmin, handleResponse} from 'helpers/utils'
import React from 'react'
import {getAllUsers, resetAllocatedLeaves} from 'services/users/userDetails'
import AccessWrapper from 'components/Modules/AccessWrapper'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {socket} from 'pages/Main'
import {notification} from 'helpers/notification'
import moment from 'moment'
import {getUserLeavesSummary} from 'services/reports'
import {editLeaveQuarter, getLeaveQuarter} from 'services/settings/leaveQuarter'
import CircularProgress from 'components/Elements/CircularProgress'
import SummaryTable from './SummaryTable'

function SummaryReport() {
  const {
    role: {key, permission},
  } = useSelector(selectAuthUser)
  const [form] = Form.useForm()
  const FormItem = Form.Item

  const queryClient = useQueryClient()
  const datePickerRef = useRef()

  const usersQuery = useQuery(['users'], () => getAllUsers({sort: 'name'}))
  const [user, setUser] = useState(undefined)
  const [quarter, setQuarter] = useState(undefined)
  const {
    data: leaveQuarters,
    isLoading: leaveQuarterLoading,
    refetch,
  } = useQuery(['leaveQuarter'], () => getLeaveQuarter(yearSelected))
  const currentYear =
    leaveQuarters?.data?.data?.data?.[0]?.fiscalYear?.split('-')?.[0]

  const [yearSelected, setYearSelected] = useState(currentYear)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [yearInInput, setYearInInput] = useState('')
  const [currentQuarter, setCurrentQuarter] = useState({})
  const coWorkersPermissions = permission?.['Co-Workers']

  //leave quarter mutation
  const leaveQuarterMutation = useMutation(
    (payload) => editLeaveQuarter(payload),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('leaveQuarter')
      },
    }
  )

  const handleUserChange = (user) => {
    setUser(user)
  }

  const handleQuarterChange = (quarter) => {
    setQuarter(quarter)
  }

  const leavesSummaryQuery = useQuery(
    ['leavesSummary', yearSelected, user, quarter],
    () =>
      getUserLeavesSummary({
        userId: user ? user : '',
        fiscalYear: `${
          yearSelected ? yearSelected + '-01-01T00:00:00.000Z' : ''
        }`,
        quarterId: quarter ? quarter : '',
      }),
    {
      enabled: !!yearSelected && !!quarter,
    }
  )

  const resetLeavesMutation = useMutation(
    (payload) => resetAllocatedLeaves(payload),
    {
      onSuccess: (response) => {
        //update quarter boolean update
        const transformedQuarter =
          leaveQuarters?.data?.data?.data?.[0]?.quarters?.map((q) =>
            q?._id === quarter
              ? {
                  ...q,
                  isResetLeaveAllocatedLeavesDisabled: true,
                }
              : q
          )

        const quarterId = leaveQuarters?.data?.data?.data?.[0]?._id

        leaveQuarterMutation.mutate({
          id: quarterId,
          leaveQuarters: {quarters: transformedQuarter},
        })

        handleResponse(
          response,
          'Allocated leaves reset of all user Successfully',
          'Could not reset allocated leaves',
          [
            () => queryClient.invalidateQueries(['leavesSummary']),
            () => {
              socket.emit('CUD')
            },
          ]
        )
      },
      onError: (error) => {
        notification({
          message: 'Could not reset allocated leaves',
          type: 'error',
        })
      },
    }
  )

  // these functions are here to format the year as 2023-2024
  const modifyDateStructure = () => {
    document
      .querySelectorAll(
        '.ant-picker-year-panel .ant-picker-cell .ant-picker-cell-inner'
      )
      .forEach((item) => {
        const currentYear = item.innerText
        item.innerText = `${currentYear}-${+currentYear + 1}`
      })
  }

  const revertDateStructure = () => {
    document
      .querySelectorAll(
        '.ant-picker-year-panel .ant-picker-cell .ant-picker-cell-inner'
      )
      .forEach((item) => {
        const currentYear = item.innerText
        item.innerText = currentYear?.split('-')?.[0]
      })
  }

  const panelChangeHandler = (value, mode) => {
    if (datePickerOpen && value?.format()?.split('-')?.[0] !== yearSelected) {
      setTimeout(() => {
        modifyDateStructure()
      }, 80)
    } else {
      setDatePickerOpen(false)
      revertDateStructure()
    }
  }

  const handleResetAllocatedLeaves = () => {
    resetLeavesMutation.mutate()
  }

  // these functions are here to format the year as 2023-2024

  const manualDatePickerClicking = () => {
    setDatePickerOpen(true)
    if (!datePickerOpen) {
      setTimeout(() => modifyDateStructure(true), 100)
    }
  }

  const yearChangeHandler = (value) => {
    // setQuarter(undefined)
    if (value) {
      setYearInInput(
        `${value?.format()?.split('-')?.[0]}-${
          +value?.format()?.split('-')?.[0] + 1
        }`
      )
      setYearSelected(value?.format()?.split('-')?.[0])
    } else {
      setYearSelected(undefined)
      setUser(undefined)
      form.setFieldsValue({quarters: undefined, coWorkers: undefined})
    }
    setDatePickerOpen(false)
    setTimeout(() => revertDateStructure(), 80)
  }

  const handleResetFilter = () => {
    const currentDate = moment()
    setYearSelected(currentYear)
    setUser(undefined)
    setYearInInput(`${currentYear}-${+currentYear + 1}`)

    const currentQuarter =
      leaveQuarters?.data?.data?.data?.[0]?.quarters?.filter((item) =>
        currentDate.isBetween(
          moment(item?.fromDate),
          moment(item?.toDate),
          'days',
          []
        )
      )
    setQuarter(currentQuarter?.[0]?._id || undefined)
    form.setFieldsValue({
      selectedYear: moment().year(Number),
      coWorkers: '',
      quarters: currentQuarter?.[0]?._id,
    })
  }
  useEffect(() => {
    if (currentYear) setYearInInput(`${currentYear}-${+currentYear + 1}`)
  }, [currentYear])
  useEffect(() => {
    setYearSelected(currentYear)
  }, [leaveQuarters])
  useEffect(() => {
    form.setFieldValue('selectedYear', moment(currentYear).year(Number))
  }, [])

  useEffect(() => {
    if (leaveQuarters?.status) {
      const currentDate = moment()

      const currentQuarter =
        leaveQuarters?.data?.data?.data?.[0]?.quarters?.filter((item) => {
          return currentDate.isBetween(
            moment(item?.fromDate),
            moment(item?.toDate),
            'days',
            []
          )
        })
      console.log({currentQuarter})
      setCurrentQuarter(currentQuarter?.[0])
      setQuarter(currentQuarter?.[0]?._id || undefined)
      form.setFieldValue('quarters', currentQuarter?.[0]?._id)
    }
  }, [leaveQuarters])

  return (
    <>
      <div className="gx-d-flex gx-justify-content-between gx-flex-row ">
        <Form layout="inline" form={form}>
          <FormItem className="direct-form-search margin-1r" name="quarters">
            <Select
              placeholderClass={PLACE_HOLDER_CLASS}
              allowClear={false}
              placeholder="Select Quarter"
              onChange={handleQuarterChange}
              value={quarter}
              options={leaveQuarters?.data?.data?.data?.[0]?.quarters?.map(
                (quarter) => ({
                  id: quarter?._id,
                  value: quarter?.quarterName,
                })
              )}
            />
          </FormItem>
          <FormItem className="direct-form-search" name="coWorkers">
            <Select
              placeholderClass={PLACE_HOLDER_CLASS}
              placeholder="Select Co-Worker"
              value={user}
              options={filterSpecificUser(
                usersQuery?.data?.data?.data?.data,
                ADMINISTRATOR
              )?.map((x) => ({
                id: x._id,
                value: x.name,
              }))}
              onChange={handleUserChange}
            />
          </FormItem>

          <div
            className="direct-form-search ant-form-item"
            style={{position: 'relative'}}
          >
            <div className="customDatePicker">
              <FormItem className="direct-form-search" name="selectedYear">
                <DatePicker
                  allowClear={false}
                  className=" gx-w-100 custom-yearPicker"
                  picker="year"
                  open={datePickerOpen}
                  onChange={yearChangeHandler}
                  onPanelChange={panelChangeHandler}
                  suffixIcon={null}
                />
              </FormItem>
            </div>
            <div
              style={{position: 'absolute', top: -1, left: 8}}
              className="ant-form-item customInputDate"
            >
              <Input
                value={yearInInput}
                id="yearInput"
                placeholder="Select year"
                onClick={manualDatePickerClicking}
                onBlur={() => {
                  setDatePickerOpen(false)
                  revertDateStructure()
                }}
              />
            </div>
          </div>
          <FormItem style={{marginBottom: '3px'}}>
            <Button
              className="gx-btn-primary gx-text-white"
              onClick={handleResetFilter}
            >
              Reset
            </Button>
          </FormItem>
        </Form>
        {!getIsAdmin() && (
          <AccessWrapper
            role={
              coWorkersPermissions?.resetAllocatedLeaves &&
              !currentQuarter?.isResetLeaveAllocatedLeavesDisabled &&
              currentQuarter?._id === quarter
            }
          >
            <Popconfirm
              title={`Are you sure to reset allocated leaves?`}
              onConfirm={handleResetAllocatedLeaves}
              okText="Yes"
              cancelText="No"
              disabled={resetLeavesMutation?.isLoading}
            >
              <Button
                className={
                  resetLeavesMutation?.isLoading
                    ? ''
                    : `gx-btn-primary gx-text-white gx-mb-4`
                }
                disabled={resetLeavesMutation?.isLoading}
              >
                Reset Allocated Leaves
              </Button>
            </Popconfirm>
          </AccessWrapper>
        )}
      </div>

      {(leavesSummaryQuery?.isLoading &&
        leaveQuarters?.data?.data?.data?.[0]?.quarters?.length > 0) ||
      resetLeavesMutation?.isLoading ? (
        <CircularProgress className="" />
      ) : (
        <SummaryTable
          data={leavesSummaryQuery?.data?.data?.data || []}
          quarterId={quarter}
        />
      )}
    </>
  )
}

export default SummaryReport
