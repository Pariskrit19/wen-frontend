import {notification as antdNotification} from 'antd'

antdNotification.config({
  maxCount: 1,
})

export const notification = ({
  type = 'warning',
  message = '',
  description = '',
  duration = 2,
  placement = 'topRight',
}) => {
  antdNotification.config({
    placement,
  })
  const test = document.querySelectorAll('.ant-notification-notice')
  if (test?.length > 0) {
    test[0].style.display = 'none'
    setTimeout(() => {
      test[0].style.display = 'block'
    }, 100)
  }
  antdNotification[type]({
    message,
    description,
    duration,
  })
}
