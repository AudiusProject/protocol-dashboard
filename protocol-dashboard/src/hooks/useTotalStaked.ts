import BN from 'bn.js'
import { gql } from '@apollo/client'
import { useUsers } from 'store/cache/user/hooks'
import { useGraphQuery as useQuery } from 'store/api/hooks'
import getActiveStake from 'utils/activeStake'
import { Status } from 'types'

const GET_TOTAL_CLAIMABLE = gql`
  query totalClaimable($id: String!) {
    audiusNetwork(id: $id) {
      totalTokensClaimable
    }
  }
`

interface TotalClaimable {
  audiusNetwork: {
    totalTokensClaimable: string
  }
}

interface TotalClaimableVars {
  id: string
}

// -------------------------------- Hooks  --------------------------------
export const useTotalStaked = () => {
  const { error: gqlError, data: gqlData } = useQuery<
    TotalClaimable,
    TotalClaimableVars
  >(GET_TOTAL_CLAIMABLE, {
    variables: { id: '1' }
  })
  const { status, users } = useUsers()

  if (gqlData) {
    const total = new BN(gqlData.audiusNetwork.totalTokensClaimable)
    return { status: Status.Success, total }
  } else if (users && status === Status.Success) {
    const totalVotingPowerStake = users.reduce((total, user) => {
      const activeStake = getActiveStake(user)
      return total.add(activeStake)
    }, new BN('0'))
    return { status: Status.Success, total: totalVotingPowerStake }
  } else if (gqlError && status === Status.Failure) {
    return { status: Status.Failure }
  }

  return { status: Status.Loading }
}

export default useTotalStaked
