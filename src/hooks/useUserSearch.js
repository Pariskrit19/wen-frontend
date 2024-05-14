import {useState} from 'react'

export const useUserSearch = () => {
  const [allData, setAllData] = useState([])
  const [searchedData, setSearchData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    const {value} = e.target
    setSearchQuery(value)
    const filtered = allData.filter((x) => {
      const regex = new RegExp(value, 'gi')
      return (
        x.firstName.match(regex) ||
        x.lastName.match(regex) ||
        x.email.match(regex)
      )
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
    setSearchQuery,
  }
}
