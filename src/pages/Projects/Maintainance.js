import React from 'react'
import {useSelector} from 'react-redux'
import {Checkbox, Collapse, Input, Form, Select, Tag} from 'antd'
import {THEME_TYPE_DARK} from 'constants/ThemeSetting'
import {useQueryClient} from '@tanstack/react-query'
import {emptyText} from 'constants/EmptySearchAntd'
import {filterOptions} from 'helpers/utils'

const {Panel} = Collapse
const CheckboxGroup = Checkbox.Group
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    xs: {span: 0},
    sm: {span: 16},
  },
  wrapperCol: {
    xs: {span: 0},
    sm: {span: 24},
  },
}
const plainOptions = [
  'Toggle All',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const Option = Select.Option

function Maintainance({maintenance, setMaintenance, readOnly}) {
  const {themeType} = useSelector((state) => state.settings)
  const queryClient = useQueryClient()
  const state = queryClient.getQueryState({queryKey: ['allUsers']})
  const allUsersEmail = state?.data?.data?.data?.data?.map((user) => user.email)
  const darkMode = themeType === THEME_TYPE_DARK

  const tagRender = (props) => {
    const {label, onClose} = props

    const isActiveUser = allUsersEmail.includes(label)

    return (
      <Tag
        closable={isActiveUser && !readOnly}
        onClose={onClose}
        style={{
          opacity: 1,
          marginTop: '4px',
          marginBottom: '4px',
          background: '#f5f5f5',
          fontSize: '14px',
          borderRadius: '6px',
          border: '1px solid #e8e8e8',
        }}
      >
        {label}
      </Tag>
    )
  }

  const handleMonthChange = (value) => {
    if (value.includes('Toggle All')) {
      const valuesWithoutToggleAll = value.slice(1)

      if (
        valuesWithoutToggleAll.length < 12 &&
        !maintenance[0]?.selectMonths?.includes('Toggle All')
      ) {
        setMaintenance((prev) => [{...prev[0], selectMonths: plainOptions}])
        return
      }

      setMaintenance((prev) => [
        {...prev[0], selectMonths: valuesWithoutToggleAll},
      ])
      return
    }

    if (!value.includes('Toggle All')) {
      if (value.length === 12) {
        setMaintenance((prev) => [{...prev[0], selectMonths: []}])
        return
      }

      setMaintenance((prev) => [{...prev[0], selectMonths: value}])
      return
    }
  }

  const handleMonthlyChange = (value) => {
    setMaintenance((prev) => [{...prev[0], enabled: Boolean(value.length)}])
  }

  const handleMailDayChange = (event) => {
    setMaintenance((prev) => [{...prev[0], emailDay: event.target.value}])
  }

  const handleEmailChange = (value) => {
    setMaintenance((prev) => [{...prev[0], sendEmailTo: value.join(',')}])
  }

  const preventClose = (event) => {
    if (event.key === 'Backspace') {
      return event.stopPropagation()
    }
  }
  return (
    <Collapse accordion>
      <Panel header="Maintenance" key="1">
        <FormItem
          {...formItemLayout}
          style={{marginBottom: '30px', display: 'block'}}
          label="Enable Maintenance"
        >
          <CheckboxGroup
            options={[{label: 'Yes', value: true}]}
            onChange={handleMonthlyChange}
            value={[maintenance[0]?.enabled]}
            disabled={readOnly}
          />
        </FormItem>
        <FormItem
          {...formItemLayout}
          style={{marginBottom: '30px', display: 'block'}}
          label="Select Month"
        >
          <CheckboxGroup
            className="gx-d-flex gx-flex-row gx-row-gap-10"
            style={{marginTop: '15px'}}
            options={plainOptions}
            onChange={handleMonthChange}
            value={maintenance[0]?.selectMonths}
            disabled={readOnly}
          />
        </FormItem>

        <FormItem
          style={{marginBottom: '30px', display: 'block'}}
          {...formItemLayout}
          label="Send Mail On"
          name="emailDay"
          rules={[
            {
              validator: async (rule, value) => {
                try {
                  if (maintenance[0]?.enabled === true) {
                    if (value < 0) {
                      throw new Error('Positive number is required.')
                    }

                    if (value > 31) {
                      throw new Error('Maximum available date is 31')
                    }
                    if (value - Math.floor(value) !== 0) {
                      throw new Error('Please do not enter decimal values.')
                    }
                  }
                } catch (err) {
                  throw new Error(err.message)
                }
              },
            },
          ]}
        >
          <Input
            placeholder="0"
            style={{marginTop: '15px'}}
            // value={maintenance[0]?.emailDay}
            onChange={handleMailDayChange}
            disabled={readOnly}
            type="number"
            min={1}
            max={31}
          />
        </FormItem>
        <p
          style={{
            color: darkMode ? '#e0e0e0' : 'rgba(0, 0, 0, 0.45)',
            marginLeft: '1rem',
          }}
        >
          Select the day of the month e.g. if you input 12 - the field mail will
          be sent on the 12th of every month.
        </p>
        <FormItem
          {...formItemLayout}
          style={{marginBottom: '30px', display: 'block', marginTop: '1rem'}}
          label="Project Coordinator E-mail"
          name="sendEmailTo"
        >
          <Select
            notFoundContent={emptyText}
            showSearch
            onInputKeyDown={preventClose}
            filterOption={filterOptions}
            placeholder=""
            disabled={readOnly}
            mode="multiple"
            onChange={handleEmailChange}
            tagRender={tagRender}
          >
            {allUsersEmail?.map((email) => (
              <Option value={email} key={email}>
                {email}
              </Option>
            ))}
          </Select>
        </FormItem>
        <p
          style={{
            color: darkMode ? '#e0e0e0' : 'rgba(0, 0, 0, 0.45)',
            marginLeft: '1rem',
          }}
        >
          will default to info@webexpertsnepal.com if left blank
        </p>
      </Panel>
    </Collapse>
  )
}

export default Maintainance
