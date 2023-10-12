import InlineStat from 'components/InlineStat/InlineStat'
import StatsChip from 'components/StatsChip/StatsChip'
import React from 'react'
import BN from 'bn.js'
import { formatWei } from 'utils/format'
import { TICKER } from 'utils/consts'
import DisplayAudio from 'components/DisplayAudio'

type DelegationStatsChipProps = {
  className?: string
  deployerCut: number
  minDelegation: BN
  delegated: BN
  delegators: number
  isLoading: boolean
}

const messages = {
  deployerCut: 'Deployer Cut',
  delegators: 'Delegators',
  minDelegation: 'Min Delegation',
  delegated: `Delegated ${TICKER}`
}

/**
 * Shows stats about delegation. Lives on the SP page
 */
const DelegationStatsChip = ({
  className,
  deployerCut,
  delegated,
  delegators,
  minDelegation,
  isLoading
}: DelegationStatsChipProps) => {
  return (
    <StatsChip
      className={className}
      tooltipText={formatWei(delegated)}
      amount={delegated}
      primaryStatName={messages.delegated}
      isLoading={isLoading}
    >
      <InlineStat label={messages.deployerCut} value={`${deployerCut}%`} />
      <InlineStat
        label={messages.minDelegation}
        value={<DisplayAudio amount={minDelegation} />}
      />
      <InlineStat label={messages.delegators} value={delegators.toString()} />
    </StatsChip>
  )
}

export default DelegationStatsChip
