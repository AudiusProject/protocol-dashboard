import Tooltip from 'components/Tooltip'
import React from 'react'
import clsx from 'clsx'
import { ReactComponent as IconUhOh } from 'assets/img/uhOh.svg'

import styles from './Error.module.css'

const DEFAULT_ERROR_TEXT = 'Incomplete Data'

const Error = ({
  text = DEFAULT_ERROR_TEXT,
  className
}: {
  text?: string
  className?: string
}) => {
  return (
    <div className={clsx(styles.error, className)}>
      <Tooltip text={text}>
        <IconUhOh className={styles.icon} />
      </Tooltip>
    </div>
  )
}

export default Error
