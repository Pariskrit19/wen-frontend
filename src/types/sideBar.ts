export default interface sidebarItemsInterface {
  icon: string
  name: string
  url: string
  isExpandable: boolean
  id: any
  subItems?: {
    name: string
    url: string
    id: any
    roles?: string[]
  }[]
  roles: boolean
}
