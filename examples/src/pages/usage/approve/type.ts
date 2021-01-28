export type HtmlNodeConfig = {
  type: string,
  label: string,
  style: {
    width: string,
    height: string,
    borderRadius?: string,
    border: string,
    transform?: string,
  }
}
export type IApproveUser = {
  label: string,
  value: string,
}
export type nodeProperty = {
  labelColor: string,
  approveTypeLabel: string,
  approveType: string,
}