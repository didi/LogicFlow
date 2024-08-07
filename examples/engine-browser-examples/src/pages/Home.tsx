import { useRouteError } from 'react-router-dom'

export interface IErrorProps {
  statusText?: string | number
  message?: string
}

export default function ErrorPage() {
  const error = useRouteError()
  console.log('page error ===>>>', error)

  return (
    <div id="error-page">
      <h1>Wire Your Ideas with LogicFlow!</h1>
      <p>低成本实现，让逻辑管理更简单、更高效</p>
    </div>
  )
}
