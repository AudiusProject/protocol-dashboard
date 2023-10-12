import React from 'react'
import BN from 'bn.js'
import Paper from 'components/Paper'
import styles from './StatsChip.module.css'
import clsx from 'clsx'
import Loading from 'components/Loading'
import DisplayAudio from 'components/DisplayAudio'

export const Divider = ({ className }: { className?: string }) => {
  return (
    <div className={clsx(styles.divider, { [className!]: !!className })}></div>
  )
}

type StatsChipProps = {
  className?: string
  tooltipText: string
  amount: BN
  primaryStatName: string
  isLoading: boolean
}

/** Wrapper for showing stats, used on the SP page */
const StatsChip: React.FC<StatsChipProps> = ({
  children,
  className,
  tooltipText,
  amount,
  primaryStatName,
  isLoading
}) => {
  return (
    <Paper className={clsx(styles.statsChip, className)}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Loading />
        </div>
      ) : (
        <>
          <DisplayAudio
            className={styles.tooltipStyle}
            amount={amount}
            shortFormat
          />
          <div className={styles.label}>{primaryStatName}</div>
          <Divider />
          {children}
        </>
      )}
    </Paper>
  )
}

export default StatsChip
