import {useEffect} from 'react'

// ref - node to which outside click shouldnt work or click shouldnt invoke the outside click function
// setDrop - function what happens on outside click
// parentRef - parentNode or other node where click shouldn't do anything
function useOutsideClick(ref, setDrop, parentRef) {
  /**
   * Alert if clicked on outside of element
   */

  function handleClickOutside(event) {
    const parent = document.getElementById(parentRef)
    const button = event.target.tagName === 'SPAN'
    const outSide =
      event.target.className === 'MuiDialog-container  MuiDialog-scrollPaper'
    const outSideOrButton = button || outSide

    if (parentRef && outSideOrButton) {
      if (ref.current && !ref.current.contains(event.target)) {
        if (parent.contains(event.target)) {
          setDrop()
        }
      }
    } else if (ref.current && !ref.current.contains(event.target)) {
      setDrop()
    }
  }

  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })
}

export default useOutsideClick
