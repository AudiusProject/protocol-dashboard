import React, { useCallback, useState, useEffect } from 'react'
import clsx from 'clsx'
import { useModalControls } from 'utils/hooks'
import BN from 'bn.js'

import { useDelegators } from 'store/cache/user/hooks'
import { ReactComponent as TrashIcon } from 'assets/img/iconTrash.svg'

import styles from './DelegatorsModal.module.css'
import { Address, Delegate, Status } from 'types'
import ModalTable from 'components/ModalTable'
import { formatShortWallet, formatWei } from 'utils/format'
import { useAccount } from 'store/account/hooks'
import { useRemoveDelegator } from 'store/actions/removeDelegator'
import ConfirmTransactionModal, {
  StandaloneBox
} from 'components/ConfirmTransactionModal'
import { useUndelegateStake } from 'store/actions/undelegateStake'
import { accountPage } from 'utils/routes'
import { usePushRoute } from 'utils/effects'
import Tooltip from 'components/Tooltip'
import AudiusClient from 'services/Audius'

const messages = {
  title: 'Delegators',
  modalTitle: 'Delegators',
  viewMore: 'View All Delegators',
  removeDelegator: 'Remove Delegator'
}

type Delegator = {
  img: string
  address: string
  name: string | undefined
  amount: BN
}

type OwnProps = {
  wallet: string
  isOpen: boolean
  onClose: () => void
}
type DelegatorsTableProps = OwnProps

const DelegatorsTable: React.FC<DelegatorsTableProps> = ({
  wallet,
  isOpen,
  onClose
}: DelegatorsTableProps) => {
  const { delegators } = useDelegators({ wallet })
  const { wallet: accountWallet } = useAccount()

  const isOwner = accountWallet === wallet

  const data = (delegators as Delegate[]).map(delegator => {
    return {
      img: delegator.img,
      name: delegator.name,
      address: delegator.wallet,
      amount: delegator.amount
    }
  })

  const {
    isOpen: removeDelegatorOpen,
    onClick: openRemoveDelegator,
    onClose: onCloseRemoveDelegator
  } = useModalControls()
  const [delegatorToRemove, setDelegatorToRemove] = useState<Address>('')
  const onClickRemoveDelegator = useCallback(
    (e: React.MouseEvent, delegator: Address) => {
      e.stopPropagation()
      setDelegatorToRemove(delegator)
      openRemoveDelegator()
    },
    [setDelegatorToRemove, openRemoveDelegator]
  )

  const {
    removeDelegator,
    status: removeDelegatorStatus,
    error: removeDelegatorError
  } = useRemoveDelegator(isOpen)
  const {
    undelegateStake,
    status: undelegateStatus,
    error: undelegateError
  } = useUndelegateStake(isOpen)

  useEffect(() => {
    if (
      undelegateStatus === Status.Success ||
      removeDelegatorStatus === Status.Success
    ) {
      onCloseRemoveDelegator()
      onClose()
    }
  }, [undelegateStatus, removeDelegatorStatus, onCloseRemoveDelegator, onClose])

  const onConfirmRemoveDelegator = useCallback(() => {
    if (delegatorToRemove === accountWallet) {
      const delegator = delegators.find(d => d.wallet === accountWallet)
      const amount = delegator?.amount
      if (amount) undelegateStake(wallet, amount)
    } else {
      removeDelegator(wallet, delegatorToRemove)
    }
  }, [
    delegatorToRemove,
    accountWallet,
    delegators,
    wallet,
    undelegateStake,
    removeDelegator
  ])

  const pushRoute = usePushRoute()
  const onRowClick = useCallback(
    (row: Delegator) => {
      pushRoute(accountPage(row.address))
    },
    [pushRoute]
  )

  const renderTableRow = (data: Delegator) => {
    return (
      <div className={styles.rowContainer} onClick={() => onRowClick(data)}>
        <img
          className={clsx(styles.rowCol, styles.colImg)}
          src={data.img}
          alt={'User Profile'}
        />
        <div className={clsx(styles.rowCol, styles.colAddress)}>
          {data.name || formatShortWallet(data.address)}
        </div>
        <Tooltip
          className={clsx(styles.rowCol, styles.colAmount)}
          text={formatWei(data.amount)}
        >
          {AudiusClient.displayShortAud(data.amount)}
        </Tooltip>
        {(isOwner || data.address === accountWallet) && (
          <div
            className={clsx(styles.rowCol, styles.trashIconContainer)}
            onClick={(e: React.MouseEvent) =>
              onClickRemoveDelegator(e, data.address)
            }
          >
            <TrashIcon className={styles.trashIcon} />
          </div>
        )}
      </div>
    )
  }

  const count = data.length
  const modalHeader = `${count} Addresses`

  const removeDelegatorBox = (
    <StandaloneBox>
      <div>{messages.removeDelegator}</div>
      <div className={styles.subtext}>{delegatorToRemove}</div>
    </StandaloneBox>
  )
  const status =
    delegatorToRemove === accountWallet
      ? undelegateStatus
      : removeDelegatorStatus
  const error =
    delegatorToRemove === accountWallet ? undelegateError : removeDelegatorError

  return (
    <ModalTable
      title={messages.modalTitle}
      header={modalHeader}
      isOpen={isOpen}
      onClose={onClose}
      dismissOnClickOutside={!removeDelegatorOpen}
    >
      {data.map(d => (
        <div
          onClick={() => onRowClick(d)}
          key={d.address}
          className={styles.modalRow}
        >
          {renderTableRow(d)}
        </div>
      ))}
      <ConfirmTransactionModal
        withArrow={false}
        topBox={removeDelegatorBox}
        isOpen={removeDelegatorOpen}
        onClose={onCloseRemoveDelegator}
        status={status}
        error={error}
        onConfirm={onConfirmRemoveDelegator}
      />
    </ModalTable>
  )
}

export default DelegatorsTable
