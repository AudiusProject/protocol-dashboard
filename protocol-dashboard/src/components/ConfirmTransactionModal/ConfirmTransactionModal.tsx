import React, { ReactNode } from 'react'
import clsx from 'clsx'
import SimpleBar from 'simplebar-react'
import BN from 'bn.js'

import AudiusClient from 'services/Audius'
import { IconArrow, ButtonType } from '@audius/stems'
import Modal from 'components/Modal'
import Button from 'components/Button'
import styles from './ConfirmTransactionModal.module.css'
import { BigNumber, ServiceType, Address, Status } from 'types'
import Loading from 'components/Loading'
import { TICKER } from 'utils/consts'
import UserImage from 'components/UserImage'

const messages = {
  title: 'Confirm Transaction',
  metamask: 'Confirm With MetaMask',
  error: 'An Error Has Occured',
  okay: 'OKAY',
  discoveryProvider: 'Discovery Node',
  contentNode: 'Content Node',
  stakingAmount: `Staking Amount ${TICKER}`,
  newService: 'NEW SERVICES',
  delegateOwnerWallet: 'Delegate Owner Wallet',
  oldStake: `Old Stake ${TICKER}`,
  newStake: `New Stake ${TICKER}`,
  delegatingAmount: `DELEGATING ${TICKER}`,
  errorTitle: 'An Error Has Occured',
  errorHeader:
    'There was an error in executing the transaction. Please try again.',
  errorBtn: 'OKAY'
}

type OperatorStakingProps = {
  className?: string
  image?: string
  name: string
  amount: BigNumber
  wallet: Address
}
export const OperatorStaking: React.FC<OperatorStakingProps> = props => {
  return (
    <Box
      className={clsx(styles.topBox, { [props.className!]: !!props.className })}
    >
      <UserImage
        alt={'User Profile'}
        wallet={props.wallet}
        className={clsx(styles.operatorStakingImage, styles.boxImage)}
      />
      <div className={styles.operatorStakingName}>{props.name}</div>
      <div className={styles.operatorStakingAmountLabel}>
        {messages.stakingAmount}
      </div>
      <div className={styles.boxValue}>
        {AudiusClient.displayAud(props.amount)}
      </div>
    </Box>
  )
}

type NewServiceProps = {
  className?: string
  serviceType: ServiceType
  delegateOwnerWallet: string
}
export const NewService: React.FC<NewServiceProps> = props => {
  return (
    <Box
      className={clsx(styles.bottomBox, {
        [props.className!]: !!props.className
      })}
    >
      <div className={styles.newServiceTitle}>{messages.newService}</div>
      <div className={styles.newServiceType}>
        {props.serviceType === ServiceType.DiscoveryProvider
          ? messages.discoveryProvider
          : messages.contentNode}
      </div>
      <div className={styles.newServiceDelegateWallet}>
        {messages.delegateOwnerWallet}
      </div>
      <div className={styles.boxValue}>{props.delegateOwnerWallet}</div>
    </Box>
  )
}

type OldStakeProps = {
  className?: string
  title: string
  oldStakeAmount: BigNumber
  stakeDiff: BigNumber | null
  isIncrease: boolean
}
export const OldStake: React.FC<OldStakeProps> = props => {
  return (
    <Box
      className={clsx(styles.topBox, { [props.className!]: !!props.className })}
    >
      <div className={styles.stakeHeader}>{props.title}</div>
      <div className={clsx(styles.stakeValue, styles.stakeSpacing)}>
        {AudiusClient.displayAud(props.oldStakeAmount)}
      </div>
      <div
        className={clsx(styles.stakeValue, {
          [styles.increase]: props.isIncrease,
          [styles.decrease]: !props.isIncrease
        })}
      >
        {`${props.isIncrease ? '+' : '-'} ${AudiusClient.displayAud(
          props.stakeDiff ?? new BN('0')
        )}`}
      </div>
    </Box>
  )
}

type NewStakeProps = {
  className?: string
  title: string
  stakeAmount: BigNumber
}
export const NewStake: React.FC<NewStakeProps> = props => {
  return (
    <Box
      className={clsx(styles.bottomBox, {
        [props.className!]: !!props.className
      })}
    >
      <div className={styles.stakeHeader}>{props.title}</div>
      <div className={styles.stakeValue}>
        {AudiusClient.displayAud(props.stakeAmount)}
      </div>
    </Box>
  )
}

type DelegatingProps = {
  className?: string
  amount: BigNumber
}
export const Delegating: React.FC<DelegatingProps> = props => {
  return (
    <Box
      className={clsx(styles.topBox, { [props.className!]: !!props.className })}
    >
      <div>{messages.delegatingAmount}</div>
      <div className={styles.delegatingAmount}>
        {AudiusClient.displayAud(props.amount)}
      </div>
    </Box>
  )
}

type StandaloneBoxProps = {
  className?: string
}
export const StandaloneBox: React.FC<StandaloneBoxProps> = props => {
  return (
    <Box
      className={clsx(styles.topBox, styles.standalone, {
        [props.className!]: !!props.className
      })}
    >
      {props.children}
    </Box>
  )
}

type ToOperatorProps = {
  className?: string
  image: string
  name: string
  wallet: Address
}
export const ToOperator: React.FC<ToOperatorProps> = props => {
  return (
    <Box
      className={clsx(styles.bottomBox, {
        [props.className!]: !!props.className
      })}
    >
      <div>To Operator</div>
      <UserImage
        alt={'User Profile'}
        wallet={props.wallet}
        className={clsx(styles.boxImage, styles.toOperatorImg)}
      />
      <div className={styles.toOperatorName}>{props.name}</div>
      <div className={styles.toOperatorWallet}>{props.wallet}</div>
    </Box>
  )
}

type BoxProps = { className?: string }
export const Box: React.FC<BoxProps> = props => {
  return (
    <div
      className={clsx(styles.box, { [props.className!]: !!props.className })}
    >
      {props.children}
    </div>
  )
}

type OwnProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  topBox?: ReactNode
  bottomBox?: ReactNode
  withArrow?: boolean
  status?: Status
  error?: string
}

type ConfirmTransactionModalProps = OwnProps

const ConfirmTransactionModal: React.FC<ConfirmTransactionModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  topBox,
  withArrow = true,
  bottomBox,
  status,
  error
}: ConfirmTransactionModalProps) => {
  return (
    <Modal
      title={messages.title}
      className={styles.container}
      wrapperClassName={styles.wrapperClassName}
      isOpen={isOpen}
      onClose={onClose}
      isCloseable={status !== Status.Loading}
      dismissOnClickOutside={false}
    >
      {status !== Status.Failure ? (
        <>
          {topBox}
          {withArrow && <IconArrow className={styles.arrowDown} />}
          {bottomBox}
          {!status && (
            <Button
              text={messages.metamask}
              type={ButtonType.PRIMARY}
              onClick={onConfirm}
            />
          )}
          {status === Status.Loading && (
            <div>
              <Loading className={styles.loading} />
            </div>
          )}
        </>
      ) : (
        <>
          <div className={styles.errorHeader}>{messages.errorHeader}</div>
          <SimpleBar className={styles.scrollableMessage}>{error}</SimpleBar>
          <Button
            text={messages.okay}
            type={ButtonType.PRIMARY}
            onClick={onClose}
          />
        </>
      )}
    </Modal>
  )
}

export default ConfirmTransactionModal
