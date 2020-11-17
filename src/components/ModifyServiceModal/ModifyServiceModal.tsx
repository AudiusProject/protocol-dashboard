import React, { useState, useCallback, useEffect } from 'react'
import Modal from 'components/Modal'
import Button, { ButtonType } from 'components/Button'
import TextField from 'components/TextField'
import styles from './ModifyServiceModal.module.css'
import { ServiceType, Status, Address } from 'types'
import { useModifyService } from 'store/actions/modifyService'
import ConfirmTransactionModal, {
  StandaloneBox
} from 'components/ConfirmTransactionModal'
import DeregisterServiceModal from 'components/DeregisterServiceModal'
import { useModalControls } from 'utils/hooks'

const messages = {
  title: 'Modify Service',
  dpEndpoint: 'Discovery Node Service Endpoint',
  dpEndpointPlaceholder: 'https://discoveryprovider.audius.co',
  cnEndpoint: 'Content Node Service Endpoint',
  cnEndpointPlaceholder: 'https://contentnode.audius.co',
  delegate: 'Delegate Owner Wallet',
  delegatePlaceholder: '0xC7EF9651259197aA26544Af724441a46e491c12c',
  save: 'Save Changes',
  deregister: 'DEREGISTER',
  mutipleUpdated: '2 MetaMask Pop-Ups Will Appear',
  updateEndpoint: 'Update Service Endpoint',
  updateWallet: 'Update Delegate Owner Wallet'
}

type OwnProps = {
  serviceType: ServiceType
  spID: number
  endpoint: string
  delegateOwnerWallet: Address
  isOpen: boolean
  onClose: () => void
}

type ModifyServiceModalProps = OwnProps

const ModifyServiceModal: React.FC<ModifyServiceModalProps> = ({
  serviceType,
  spID,
  endpoint: oldEndpoint,
  delegateOwnerWallet: oldDelegateOwnerWallet,
  isOpen,
  onClose
}: ModifyServiceModalProps) => {
  const [endpoint, setEndpoint] = useState('')
  const [delegateOwnerWallet, setDelegateOwnerWallet] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setEndpoint('')
      setDelegateOwnerWallet('')
    } else {
      setEndpoint(oldEndpoint)
      setDelegateOwnerWallet(oldDelegateOwnerWallet)
    }
  }, [
    isOpen,
    setEndpoint,
    oldEndpoint,
    setDelegateOwnerWallet,
    oldDelegateOwnerWallet
  ])

  const {
    isOpen: isConfirmModalOpen,
    onClose: onCloseConfirm,
    onClick: onOpenConfirmation
  } = useModalControls()
  const {
    isOpen: isDeregisterModalOpen,
    onClose: onCloseDeregister,
    onClick: onOpenDeregister
  } = useModalControls()

  const onRegister = useCallback(() => {
    // TODO: validate each field

    onOpenConfirmation()
  }, [onOpenConfirmation])

  const { status, modifyService, error } = useModifyService(!isConfirmModalOpen)

  // Close All modals on success status
  useEffect(() => {
    if (status === Status.Success) {
      onCloseConfirm()
      onClose()
    }
  }, [status, onClose, onCloseConfirm])

  // Close All modals on success status
  const onDeregister = useCallback(() => {
    onClose()
    onCloseDeregister()
  }, [onClose, onCloseDeregister])

  const onConfirm = useCallback(() => {
    modifyService(
      serviceType,
      spID,
      oldEndpoint,
      endpoint,
      oldDelegateOwnerWallet,
      delegateOwnerWallet
    )
  }, [
    modifyService,
    serviceType,
    spID,
    oldEndpoint,
    endpoint,
    oldDelegateOwnerWallet,
    delegateOwnerWallet
  ])

  let topBox = null
  let endpointUpdated = oldEndpoint !== endpoint
  let walletUpdated = oldDelegateOwnerWallet !== delegateOwnerWallet
  if (endpointUpdated && walletUpdated) {
    topBox = (
      <>
        <div className={styles.doubleMetaMask}>{messages.mutipleUpdated}</div>
        <StandaloneBox className={styles.confirm}>
          <div>{messages.updateEndpoint}</div>
          <div className={styles.subtext}>{endpoint}</div>
          <div className={styles.boxSpacing}>{messages.updateWallet}</div>
          <div className={styles.subtext}>{delegateOwnerWallet}</div>
        </StandaloneBox>
      </>
    )
  } else if (endpointUpdated) {
    topBox = (
      <StandaloneBox className={styles.confirm}>
        <div>{messages.updateEndpoint}</div>
        <div className={styles.subtext}>{endpoint}</div>
      </StandaloneBox>
    )
  } else if (walletUpdated) {
    topBox = (
      <StandaloneBox className={styles.confirm}>
        <div>{messages.updateWallet}</div>
        <div className={styles.subtext}>{delegateOwnerWallet}</div>
      </StandaloneBox>
    )
  }

  return (
    <Modal
      title={messages.title}
      className={styles.container}
      isOpen={isOpen}
      onClose={onClose}
      isCloseable={!isConfirmModalOpen && !isDeregisterModalOpen}
      dismissOnClickOutside={!isConfirmModalOpen && !isDeregisterModalOpen}
    >
      <div className={styles.content}>
        <TextField
          value={endpoint}
          onChange={setEndpoint}
          label={
            serviceType === ServiceType.DiscoveryProvider
              ? messages.dpEndpoint
              : messages.cnEndpoint
          }
          className={styles.input}
        />
        <TextField
          value={delegateOwnerWallet}
          onChange={setDelegateOwnerWallet}
          label={messages.delegate}
          placeholder={messages.delegatePlaceholder}
          className={styles.input}
        />
        <div className={styles.btnContainer}>
          <Button
            text={messages.deregister}
            type={ButtonType.RED}
            className={styles.deregisterBtn}
            onClick={onOpenDeregister}
          />
          <Button
            text={messages.save}
            type={ButtonType.PRIMARY}
            className={styles.saveBtn}
            onClick={onRegister}
          />
        </div>
      </div>
      <ConfirmTransactionModal
        isOpen={isConfirmModalOpen}
        onClose={onCloseConfirm}
        onConfirm={onConfirm}
        topBox={topBox}
        status={status}
        error={error}
        withArrow={false}
      />
      <DeregisterServiceModal
        isOpen={isDeregisterModalOpen}
        onClose={onCloseDeregister}
        serviceType={serviceType}
        spID={spID}
        endpoint={endpoint}
        onDeregister={onDeregister}
      />
    </Modal>
  )
}

export default ModifyServiceModal
