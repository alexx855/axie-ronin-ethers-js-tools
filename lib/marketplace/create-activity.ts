import { GRAPHQL_URL } from "../constants";
import { apiRequest } from "../utils";

interface IActivityData {
  axieId: string;
  priceFrom: string;
  priceTo: string;
  duration: string;
  txHash: string;
}

// create the activity on the user profile, this is optional
export default async function createActivity(action: string, data: IActivityData, accessToken: string) {

  const activityQuery = `mutation AddActivity($action: Action!, $data: ActivityDataInput!) {
        createActivity(action: $action, data: $data) {
          result
          __typename
        }
      }`

  const activityVariables = {
    action,
    data
  }

  interface IActivityResult {
    data?: {
      createActivity: {
        result: boolean
      }
    }
    errors?: Array<{
      message: string
    }>
  }

  // API request authorization headers
  const headers = {
    'authorization': `Bearer ${accessToken}`,
    'x-api-key': process.env.SKIMAVIS_DAPP_KEY!
  }

  // Create the activity on the marketplace
  const activityResult = await apiRequest<IActivityResult>(GRAPHQL_URL, JSON.stringify({ query: activityQuery, variables: activityVariables }), headers)

  if (activityResult === null || activityResult.data === undefined) {
    console.log('Error creating activity')
    return false
  }

  if (activityResult.errors !== undefined) {
    console.log('Error creating activity', activityResult.errors)
    return false
  }

  console.log(activityResult)
  return activityResult.data.createActivity.result
}