import React from 'react'

const Error404 = ({message = 'Page not found'}) => {
  return (
    <div className="gx-page-error-container">
      <div className="gx-page-error-content">
        <div className="gx-error-code gx-mb-4">404</div>
        <h2 className="gx-text-center">{message}</h2>
      </div>
    </div>
  )
}

export default Error404
