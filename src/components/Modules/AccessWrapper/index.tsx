import {selectAuthUser} from 'appRedux/reducers/Auth'
import RoleAccess from 'constants/RoleAccess'
import {useSelector} from 'react-redux'

interface AccessWrapperInterface {
  noAccessRoles?: string[]
  children: JSX.Element
  role?: boolean
}

function AccessWrapper({
  noAccessRoles,
  role,
  children,
}: AccessWrapperInterface) {
  const {
    role: {key},
  } = useSelector(selectAuthUser)

  if (
    // (!noAccessRoles?.includes(key) &&
    //   Object.values(RoleAccess).includes(key)) ||
    role
  )
    return children
  return null
}

export default AccessWrapper
