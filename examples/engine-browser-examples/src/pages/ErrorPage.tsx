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
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>
          {(error as IErrorProps)?.statusText ||
            (error as IErrorProps)?.message}
        </i>
      </p>
    </div>
  )
}
