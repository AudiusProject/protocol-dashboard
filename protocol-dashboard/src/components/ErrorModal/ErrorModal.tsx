import React from 'react'
import SimpleBar from 'simplebar-react'
import { ButtonType } from '@audius/stems'

import Modal from 'components/Modal'
import Button from 'components/Button'
import styles from './ErrorModal.module.css'

const messages = {
  title: 'An Error Has Occured',
  header:
    'Actions cannot be taken until pending transactions are completed. Please try again.',
  okay: 'OKAY'
}

type OwnProps = {
  isOpen: boolean
  onClose: () => void
  message: string
}

type ErrorModalProps = OwnProps

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  message
}: ErrorModalProps) => {
  return (
    <Modal
      title={messages.title}
      className={styles.container}
      wrapperClassName={styles.wrapperClassName}
      isOpen={isOpen}
      onClose={onClose}
      isCloseable={true}
      dismissOnClickOutside={false}
    >
      <div className={styles.header}>{messages.header}</div>

      <SimpleBar className={styles.scrollableMessage}>{message}</SimpleBar>
      <Button
        text={messages.okay}
        type={ButtonType.PRIMARY}
        onClick={onClose}
      />
    </Modal>
  )
}

export default ErrorModal
