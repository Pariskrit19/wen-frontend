import {useEffect, useReducer, useCallback} from 'react'
const debounce = (func, delay) => {
  let timer
  return function () {
    let self = this
    let args = arguments
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(self, args)
    }, delay)
  }
}
const INTERSECTION_THRESHOLD = 5
const LOAD_DELAY_MS = 500

const reducer = (state, action) => {
  switch (action.type) {
    case 'set': {
      return {
        ...state,
        ...action.payload,
      }
    }
    case 'onGrabData': {
      return {
        ...state,
        lazyLoading: false,
        lazyData: [...state.lazyData, ...action.payload.lazyData],
        currentPage: state.currentPage + 1,
      }
    }
    default:
      return state
  }
}

const useLazyLoad = ({triggerRef, onGrabData, options}) => {
  const [state, dispatch] = useReducer(reducer, {
    lazyLoading: false,
    currentPage: 1,
    lazyData: [],
  })

  const _handleEntry = async (entry) => {
    const boundingRect = entry.boundingClientRect
    const intersectionRect = entry.intersectionRect

    if (
      !state.lazyLoading &&
      entry.isIntersecting &&
      intersectionRect.bottom - boundingRect.bottom <= INTERSECTION_THRESHOLD
    ) {
      dispatch({type: 'set', payload: {lazyLoading: true}})
      const data = await onGrabData(state.currentPage)
      dispatch({type: 'onGrabData', payload: {lazyData: data}})
    }
  }
  const handleEntry = debounce(_handleEntry, LOAD_DELAY_MS)

  const onIntersect = useCallback(
    (entries) => {
      handleEntry(entries[0])
    },
    [handleEntry]
  )

  useEffect(() => {
    if (triggerRef.current) {
      const container = triggerRef.current
      const observer = new IntersectionObserver(onIntersect, options)

      // It will look for the pointer whether it is visible in screen or not
      observer.observe(container)

      return () => {
        observer.disconnect()
      }
    }
  }, [triggerRef, onIntersect, options])

  return state
}

export default useLazyLoad
