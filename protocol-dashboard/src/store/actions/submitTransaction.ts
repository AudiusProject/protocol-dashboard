import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { Action } from 'redux'

import { PendingTransactionName, Status, Address } from 'types'
import Audius from 'services/Audius'
import { AppState } from 'store/types'
import { fetchPendingTransactions, getAccountWallet } from 'store/account/hooks'
import { fetchUser } from 'store/cache/user/hooks'

function decreaseStake(
  setStatus: (status: Status) => void,
  setError: (error: string) => void
): ThunkAction<void, AppState, Audius, Action<void>> {
  return async (dispatch, getState, aud) => {
    setStatus(Status.Loading)
    try {
      await aud.ServiceProviderClient.decreaseStake()

      // Repull for user information and pending transactions
      const state = getState()
      const wallet = getAccountWallet(state)
      if (wallet) await dispatch(fetchUser(wallet))
      if (wallet) await dispatch(fetchPendingTransactions(wallet))

      setStatus(Status.Success)
    } catch (error) {
      console.log(error)
      setError(error.message)
      setStatus(Status.Failure)
    }
  }
}

function updateOperatorCut(
  setStatus: (status: Status) => void,
  setError: (error: string) => void
): ThunkAction<void, AppState, Audius, Action<void>> {
  return async (dispatch, getState, aud) => {
    setStatus(Status.Loading)
    try {
      const wallet = getState().account.wallet
      if (!wallet) throw new Error('Not signed in')
      await aud.ServiceProviderClient.updateDeployerCut(wallet)

      // Repull for user information and pending transactions
      await dispatch(fetchUser(wallet))
      await dispatch(fetchPendingTransactions(wallet))

      setStatus(Status.Success)
    } catch (error) {
      console.log(error)
      setError(error.message)
      setStatus(Status.Failure)
    }
  }
}

function undelegate(
  setStatus: (status: Status) => void,
  setError: (error: string) => void
): ThunkAction<void, AppState, Audius, Action<void>> {
  return async (dispatch, getState, aud) => {
    setStatus(Status.Loading)
    try {
      await aud.Delegate.undelegateStake()

      // Repull for user information and pending transactions
      const state = getState()
      const wallet = getAccountWallet(state)
      if (wallet) await dispatch(fetchUser(wallet))
      if (wallet) await dispatch(fetchPendingTransactions(wallet))

      setStatus(Status.Success)
    } catch (error) {
      console.log(error)
      setError(error.message)
      setStatus(Status.Failure)
    }
  }
}

function removeDelegator(
  wallet: Address,
  setStatus: (status: Status) => void,
  setError: (error: string) => void
): ThunkAction<void, AppState, Audius, Action<void>> {
  return async (dispatch, getState, aud) => {
    setStatus(Status.Loading)
    try {
      const accountWallet = getState().account.wallet
      if (!accountWallet) throw new Error('Not signed in')
      if (!wallet) throw new Error('Delegator wallat not provided')
      await aud.Delegate.removeDelegator(accountWallet, wallet)

      // Repull for user information and pending transactions
      await dispatch(fetchUser(wallet))
      await dispatch(fetchUser(accountWallet))
      await dispatch(fetchPendingTransactions(accountWallet))

      setStatus(Status.Success)
    } catch (error) {
      console.log(error)
      setError(error.message)
      setStatus(Status.Failure)
    }
  }
}

export const useSubmitTransaction = (name: PendingTransactionName) => {
  const [status, setStatus] = useState<undefined | Status>()
  const [error, setError] = useState<string>('')
  const dispatch = useDispatch()

  const submitTransaction = useCallback(
    (wallet?: Address) => {
      if (status !== Status.Loading) {
        switch (name) {
          case PendingTransactionName.DecreaseStake: {
            dispatch(decreaseStake(setStatus, setError))
            break
          }
          case PendingTransactionName.UpdateOperatorCut: {
            dispatch(updateOperatorCut(setStatus, setError))
            break
          }
          case PendingTransactionName.Undelegate: {
            dispatch(undelegate(setStatus, setError))
            break
          }
          case PendingTransactionName.RemoveDelegator: {
            dispatch(removeDelegator(wallet!, setStatus, setError))
            break
          }
        }
      }
    },
    [dispatch, name, status, setStatus, setError]
  )
  return { status, error, submitTransaction }
}
