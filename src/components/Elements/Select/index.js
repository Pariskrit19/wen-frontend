import React, {useState} from 'react'
import {Select as Dropdown} from 'antd'
import {filterOptions, filterSortOptions} from 'helpers/utils'
import './selectLabel.less'
import {SearchOutlined} from '@ant-design/icons'
import {emptyText} from 'constants/EmptySearchAntd'

const Option = Dropdown.Option

const Select = ({
  disabled = false,
  onChange,
  value,
  options,
  placeholder,
  style,
  mode,
  emptyAll = false,
  sortAscend = false,
  inputSelect = false,
  initialValues = '',
  width = 200,
  placeholderClass = false,
  handleSearch,
  showSearchIcon = false,
  allowClear = true,
}) => {
  const [searchValue, setSearchValue] = useState('')
  return (
    <div>
      <Dropdown
        notFoundContent={emptyText}
        suffixIcon={showSearchIcon ? <SearchOutlined /> : undefined}
        disabled={disabled}
        className={placeholderClass}
        allowClear={allowClear}
        showSearch
        placeholder={placeholderClass ? null : placeholder}
        style={style}
        onChange={onChange}
        defaultValue={initialValues ? initialValues : undefined}
        onSearch={(e) => {
          inputSelect && setSearchValue(e)
          handleSearch(e)
        }}
        value={value}
        filterOption={filterOptions}
        filterSort={sortAscend && filterSortOptions}
        mode={mode}
        open={!inputSelect ? undefined : searchValue.length ? true : false}
        onSelect={() => {
          inputSelect && setSearchValue('')
        }}
      >
        {options &&
          options?.map((opt) => (
            <Option value={opt?.id} key={opt?.id}>
              {opt?.value}
            </Option>
          ))}
      </Dropdown>
      {placeholderClass ? (
        <span
          className={
            value || emptyAll ? 'floating-label-fixed' : 'floating-label'
          }
        >
          {placeholder}
        </span>
      ) : null}
    </div>
  )
}

export default Select

Select.defaultProps = {
  onChange: () => {},
  handleSearch: () => {},
  value: undefined,
  options: [],
  placeholder: 'Select Option',
  style: {},
  mode: '',
}
