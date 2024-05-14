import crypto from 'crypto-js'

export const decrypt = (cipherText, secretKey) => {
  return cipherText;
  if (process.env.NODE_ENV !== 'production') {
    return cipherText
  }
  if (!cipherText) {
    return undefined
  }
  // Decrypt
  try {
    const bytes = crypto.AES.decrypt(cipherText, secretKey)
    const decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8))
    return decryptedData
  } catch (error) {
    return undefined
  }
}

export const LATE_ARRIVAL_KEY = 'latearrivalkey123456789'
export const USERS_KEY = 'userkey123456789'
export const CONFIGURATION_KEY = 'configurationkey123456789'
export const SALARY_REVIEW_KEY = 'salaryreviewkey123456789'
export const ACTIVITY_LOGS_KEY = 'activitylogskey123456789'

export const PROJECT_KEY = 'projectkey123456789'
export const CLIENT_KEY = 'clientkey123456789'
export const PROJECT_STATUS_KEY = 'projectstatuskey123456789'
export const PROJECCT_TAG_KEY = 'projecttagkey123456789'
export const PROJECT_TYPE_KEY = 'projecttypekey123456789'

export const USER_POSITION_KEY = 'userpositionkey123456789'
export const USER_POSITION_TYPE_KEY = 'userpositiontypekey123456789'
export const USER_ROLE_KEY = 'userrolekey123456789'
export const USER_INVITE_KEY = 'userinvitekey123456789'

export const LOG_TYPE_KEY = 'logtypekey123456789'
export const LOG_KEY = 'logkey123456789'

export const NOTICE_TYPE_KEY = 'noticetypekey123456789'
export const BLOG_CATEGORY_KEY = 'blogcategorykey123456789'
export const EMAIL_KEY = 'emailkey123456789'

export const ATTENDANCE_KEY = 'attendancekey123456789'

export const WEEKLY_REPORT_KEY = 'weeklyreportkey123456789'
export const WORK_LOG_REPORT_KEY = 'worklogreportkey123456789'
