export interface Position {
  _id?: string
  name: string
}
export interface Role {
  _id?: string
  key: string
  value: string
}

export default interface User {
  _id?: string
  name: string
  email: string
  gender: string
  joinDate: string
  maritalStatus: string
  primaryPhone: number
  createdAt: string
  updateAt: string
  dob: string
  active: boolean
  position: Position
  role: Role
  [key: string]: string | boolean | number | Position | Role | undefined
}
