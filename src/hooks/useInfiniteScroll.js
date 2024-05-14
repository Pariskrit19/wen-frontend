import {useEffect, useState, useRef, useMemo} from 'react'
import {DefaultPageSize} from 'helpers/constants'

function useInfiniteScroll(
  data,
  count,
  fetchData,
  page,
  searchText,
  scrollEvent = window,
  extra = {}
) {
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const dataRef = useRef(data)
  const countRef = useRef(count)
  const pageRef = useRef(page)
  const prevPageRef = useRef(0)
  const extraInfo = useRef(extra)
  const threshold = 1

  useMemo(() => {
    dataRef.current = data
    countRef.current = count
    pageRef.current = page
    extraInfo.current = extra
  }, [data, count, page, extra])

  useEffect(() => {
    prevPageRef.current = page === 1 ? 0 : prevPageRef.current
  }, [page])

  useEffect(() => {
    setHasMore(true)
    pageRef.current = 1
  }, [searchText])

  const fetchMoreData = async () => {
    if (countRef.current / pageRef.current < DefaultPageSize) {
      setHasMore(false)
      return
    }
    if (prevPageRef.current !== pageRef.current) {
      prevPageRef.current = pageRef.current
      setLoading(true)
      await fetchData(pageRef.current, dataRef.current, extraInfo.current)
      setLoading(false)
    }
  }

  useEffect(() => {
    scrollEvent.addEventListener('scroll', handleScroll)
    return () => scrollEvent.removeEventListener('scroll', handleScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const handleScroll = (e, uniqueId) => {
    if (loading) return

    if (uniqueId) {
      if (
        Math.ceil(
          document.getElementById(uniqueId).offsetHeight +
            document.getElementById(uniqueId).scrollTop
        ) -
          document.getElementById(uniqueId).scrollHeight >=
        0
      ) {
        fetchMoreData()
      }
    } else if (
      document.documentElement.offsetHeight -
        (scrollEvent.innerHeight + document.documentElement.scrollTop) <=
      threshold
    ) {
      fetchMoreData()
    }
  }
  const gotoTop = () => {
    scrollEvent.scroll({top: 0, left: 0, behavior: 'smooth'})
  }
  return {hasMore, loading, gotoTop, handleScroll}
}

export default useInfiniteScroll
