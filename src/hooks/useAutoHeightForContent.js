import {useEffect, useState} from 'react'

function useAutoHeightForContent(isLoading) {
  const [tableHeight, setTableHeight] = useState(0)
  const handleTableHeight = () => {
    const tableContainer = document.getElementById(
      'table-scroll-wrapper-container'
    )
    if (tableContainer) {
      let tableContainerTop = tableContainer.getBoundingClientRect().top
      setTableHeight(window.innerHeight - tableContainerTop - 25)
    }
  }

  useEffect(() => {
    handleTableHeight()
  }, [isLoading])

  useEffect(() => {
    document.body.style.overflowY = 'hidden'
    window.addEventListener('resize', handleTableHeight)
    return () => {
      window.removeEventListener('resize', handleTableHeight)
      window.removeEventListener('scroll', () => {})
      document.body.style.overflowY = 'auto'
    }
  }, [])
  return {tableHeight}
}

export default useAutoHeightForContent
