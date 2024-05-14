import API from 'helpers/api'
import {Apis} from 'services/api'
import {getAPIResponse} from 'helpers/getApiResponse'

export const getUserLeavesSummary = async ({
  userId = '',
  fiscalYear = '',
  quarterId = '',
}) => {
  try {
    let response = await API.get(
      `${Apis.Leaves}/userLeaves?userId=${userId}&fiscalYear=${fiscalYear}&quarterId=${quarterId}`
    )
    return getAPIResponse(response)
  } catch (err) {
    return getAPIResponse(err.response)
  }
}
