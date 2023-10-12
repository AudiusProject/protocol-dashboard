import { useSelector, useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { Action } from 'redux'

import { Address, Status } from 'types'
import Audius from 'services/Audius'
import { AppState } from 'store/types'
import { useEffect } from 'react'

import {
  fetchClaim,
  setClaim,
  setClaimMetadata as setMetadata
} from 'store/cache/claims/slice'

// -------------------------------- Selectors  --------------------------------
export const getPendingClaim = (wallet: Address) => (state: AppState) =>
  state.cache.claims.users[wallet]

export const getFundsPerRound = () => (state: AppState) =>
  state.cache.claims.metadata.fundsPerRound

export const getLastFundedBlock = () => (state: AppState) =>
  state.cache.claims.metadata.lastFundedBlock

// -------------------------------- Thunk Actions  --------------------------------

export function fetchPendingClaim(
  wallet: Address
): ThunkAction<void, AppState, Audius, Action<string>> {
  return async (dispatch, getState, aud) => {
    await aud.awaitSetup()
    dispatch(fetchClaim({ wallet }))
    try {
      const hasClaim = await aud.Claim.claimPending(wallet)
      dispatch(setClaim({ wallet, hasClaim }))
    } catch (error) {
      // TODO: Handle error case
      console.log(error)
    }
  }
}

export function setClaimMetadata(): ThunkAction<
  void,
  AppState,
  Audius,
  Action
> {
  return async (dispatch, getState, aud) => {
    await aud.awaitSetup()
    try {
      const [
        fundsPerRound,
        lastFundedBlock,
        fundingRoundBlockDiff,
        totalClaimedInRound
      ] = await Promise.all([
        aud.Claim.getFundsPerRound(),
        aud.Claim.getLastFundedBlock(),
        aud.Claim.getFundingRoundBlockDiff(),
        aud.Claim.getTotalClaimedInRound()
      ])
      dispatch(
        setMetadata({
          fundsPerRound,
          lastFundedBlock,
          fundingRoundBlockDiff,
          totalClaimedInRound
        })
      )
    } catch (error) {
      // TODO: Handle error case
      console.log(error)
    }
  }
}

// -------------------------------- Hooks  --------------------------------

export const usePendingClaim = (wallet: Address) => {
  const pendingClaim = useSelector(getPendingClaim(wallet))
  const dispatch = useDispatch()
  useEffect(() => {
    if (wallet && !pendingClaim) {
      dispatch(fetchPendingClaim(wallet))
    }
  }, [dispatch, wallet, pendingClaim])
  if (!pendingClaim) return { status: Status.Loading, hasClaim: false }
  return pendingClaim
}

export const useFundsPerRound = () => {
  const fundsPerRound = useSelector(getFundsPerRound())
  const dispatch = useDispatch()
  useEffect(() => {
    if (!fundsPerRound) {
      dispatch(setClaimMetadata())
    }
  }, [dispatch, fundsPerRound])
  if (!fundsPerRound) return { status: Status.Loading }
  return { status: Status.Success, amount: fundsPerRound }
}

export const useLastFundedBlock = () => {
  const lastFundedBlock = useSelector(getLastFundedBlock())
  const dispatch = useDispatch()
  useEffect(() => {
    if (!lastFundedBlock) {
      dispatch(setClaimMetadata())
    }
  }, [dispatch, lastFundedBlock])
  if (!lastFundedBlock) return { status: Status.Loading }
  return { status: Status.Success, blockNumber: lastFundedBlock }
}
