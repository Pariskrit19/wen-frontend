import {useEffect, useRef} from 'react'

function useDidMountEffect(func, depen) {
  const ref = useRef(false)
  useEffect(() => {
    if (ref.current) func()
    else ref.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, depen)
}

export default useDidMountEffect
