import {useState} from 'react'

export const useSearch = () => {
  const [allData, setAllData] = useState([])
  const [searchedData, setSearchData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    const {value} = e.target
    setSearchQuery(value)
    const filtered = allData.filter((x) => {
      const regex = new RegExp(value, 'gi')
      return x.name.match(regex)
    })
    setSearchData(filtered)
  }

  return {
    allData,
    setAllData,
    handleSearch,
    searchedData,
    searchQuery,
    setSearchData,
  }
}
