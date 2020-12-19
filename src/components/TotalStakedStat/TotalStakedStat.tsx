import React, { ReactNode } from 'react'
import BN from 'bn.js'

import { formatShortAud } from 'utils/format'
import Stat from 'components/Stat'
import { useUsers } from 'store/cache/user/hooks'
import { TICKER } from 'utils/consts'
import Tooltip from 'components/Tooltip'
import { formatWei } from 'utils/format'
import getActiveStake from 'utils/activeStake'
import styles from './TotalStakedStat.module.css'
import { Status } from 'types'

const messages = {
  staked: `Active Stake ${TICKER}`
}

type OwnProps = {}

type TotalStakedStatProps = OwnProps

const TotalStakedStat: React.FC<TotalStakedStatProps> = () => {
  const { status, users } = useUsers()
  const isLoading = status === Status.Loading

  let stat: ReactNode = null

  if (users && !isLoading) {
    const totalVotingPowerStake = users.reduce((total, user) => {
      const activeStake = getActiveStake(user)
      return total.add(activeStake)
    }, new BN('0'))
  
    stat = <Tooltip className={styles.stat} text={formatWei(totalVotingPowerStake)}>
      {formatShortAud(totalVotingPowerStake)}
    </Tooltip>
  }

  return <Stat label={messages.staked} stat={stat} />
}

export default TotalStakedStat
