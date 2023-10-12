import React from 'react'

import RewardStat from 'components/RewardStat'
import { Status } from 'types'
import { useWeeklyRewardRate } from 'hooks/useRewardRate'

const messages = {
  label: `ESTIMATED WEEKLY REWARD RATE`
}

interface EstimatedWeeklyStatProps {
  className?: string
}

const EstimatedWeeklyStat: React.FC<EstimatedWeeklyStatProps> = ({
  className
}) => {
  const claimRate = useWeeklyRewardRate()
  const value =
    claimRate.status === Status.Success
      ? `${claimRate.rate!.toFixed(3)}%`
      : null
  return (
    <RewardStat className={className} label={messages.label} stat={value} />
  )
}

export default EstimatedWeeklyStat
