import InlineStat from 'components/InlineStat/InlineStat'
import StatsChip from 'components/StatsChip/StatsChip'
import React from 'react'
import BN from 'bn.js'
import { formatShortAud, formatWei } from 'utils/format'
import { TICKER } from 'utils/consts'

type DelegationStatsChipProps = {
  deployerCut: number
  delegated: BN
  delegators: number
  isLoading: boolean
}

const messages = {
  deployerCut: 'Deployer Cut',
  delegators: 'Delegators',
  delegated: `Delegated ${TICKER}`
}

const DelegationStatsChip = ({
  deployerCut,
  delegated,
  delegators,
  isLoading
}: DelegationStatsChipProps) => {
  return (
    <StatsChip
      tooltipText={formatWei(delegated)}
      primaryStat={formatShortAud(delegated)}
      primaryStatName={messages.delegated}
      isLoading={isLoading}
    >
      <InlineStat label={messages.deployerCut} value={`${deployerCut}%`} />
      <InlineStat label={messages.delegators} value={delegators.toString()} />
    </StatsChip>
  )
}

export default DelegationStatsChip
