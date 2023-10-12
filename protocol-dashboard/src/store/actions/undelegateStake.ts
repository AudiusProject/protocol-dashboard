import { useState, useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { Action } from 'redux'
import BN from 'bn.js'

import { Status, Address } from 'types'
import Audius from 'services/Audius'
import { AppState } from 'store/types'
import { getAccountWallet, fetchPendingTransactions } from 'store/account/hooks'

export function undelegateAudiusStake(
  address: Address,
  amount: BN,
  setStatus: (status: Status) => void,
  setError: (msg: string) => void
): ThunkAction<void, AppState, Audius, Action<string>> {
  return async (dispatch, getState, aud) => {
    setStatus(Status.Loading)
    try {
      await aud.Delegate.requestUndelegateStake(address, amount)

      // Repull pending transactions
      const state = getState()
      const wallet = getAccountWallet(state)
      if (wallet) await dispatch(fetchPendingTransactions(wallet))

      setStatus(Status.Success)
    } catch (err) {
      setStatus(Status.Failure)
      setError(err.message)
    }
  }
}

export const useUndelegateStake = (shouldReset?: boolean) => {
  const [status, setStatus] = useState<undefined | Status>()
  const [error, setError] = useState<string>('')
  const dispatch = useDispatch()
  useEffect(() => {
    if (shouldReset) {
      setStatus(undefined)
      setError('')
    }
  }, [shouldReset, setStatus, setError])

  const undelegateStake = useCallback(
    (address: Address, amount: BN) => {
      if (status !== Status.Loading) {
        dispatch(undelegateAudiusStake(address, amount, setStatus, setError))
      }
    },
    [dispatch, status, setStatus, setError]
  )
  return { status, error, undelegateStake }
}

export default useUndelegateStake
