import React, {useEffect, useState} from 'react'
import {Select as Dropdown} from 'antd'
import {filterSortOptions, projectFilterOptions} from 'helpers/utils'
import './selectLabel.less'
import {SearchOutlined} from '@ant-design/icons'
import {emptyText} from 'constants/EmptySearchAntd'

const Option = Dropdown.Option

const ProjectSelect = ({
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
  isProjectSearch = false,
  autoFocus = false,
  searchProjectValue = undefined,
}) => {
  const [searchValue, setSearchValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const dropdownOpen = !inputSelect ? undefined : isOpen

  const handleClear = () => {
    setSearchValue('')
    onChange('')
  }

  useEffect(() => {
    if (value === undefined) {
      handleClear()
    }
  }, [value])

  const getHighlightedText = (text) => {
    const index = text.toLowerCase()?.indexOf(searchValue.toLowerCase())
    return (
      <>
        <span>{text?.substring(0, index)}</span>
        <span className="search-highlight">
          {text?.substring(index, index + searchValue.length)}
        </span>
        <span>{text.substring(index + searchValue.length)}</span>
      </>
    )
  }

  return (
    <div>
      <Dropdown
        autoFocus={autoFocus}
        notFoundContent={emptyText}
        suffixIcon={showSearchIcon ? <SearchOutlined /> : undefined}
        disabled={disabled}
        className={placeholderClass}
        allowClear={allowClear}
        defaultActiveFirstOption={false}
        showSearch
        searchValue={searchValue || searchProjectValue}
        placeholder={placeholderClass ? null : placeholder}
        style={style}
        onChange={onChange}
        onInputKeyDown={(e) => {
          if (e.key === 'Enter') {
            setIsOpen(false)
            onChange(searchValue)
          }
          if (e.key === 'Backspace' && e.target.value.length === 1) {
            handleClear()
            setIsOpen(false)
          }
        }}
        defaultValue={initialValues ? initialValues : undefined}
        onSearch={(e) => {
          setIsOpen(
            e?.length > 1 || (searchValue.length > e.length && e.length > 0)
          )
          inputSelect && setSearchValue(e)
          handleSearch(e)
        }}
        onClear={handleClear}
        value={value}
        filterOption={projectFilterOptions}
        filterSort={sortAscend && filterSortOptions}
        mode={mode}
        open={dropdownOpen}
        onSelect={(e) => {
          onChange(e, 'isSelect')
          setIsOpen(false)
        }}
      >
        {options &&
          options?.map((opt) => (
            <Option value={opt?.id} key={opt?.id}>
              {getHighlightedText(opt?.value)}
              <div style={{display: 'none'}}>{opt?.value}</div>
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

export default ProjectSelect

ProjectSelect.defaultProps = {
  onChange: () => {},
  handleSearch: () => {},
  value: undefined,
  options: [],
  placeholder: 'Select Option',
  style: {},
  mode: '',
}
