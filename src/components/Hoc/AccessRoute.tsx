import {Navigate} from 'react-router-dom'

function AccessRoute({
  roles,
  children,
}: {
  roles: boolean
  children: JSX.Element
}) {
  if (roles === true) {
    return children
  }
  return <Navigate to="/" />
}

export default AccessRoute
