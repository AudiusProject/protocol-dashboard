import { useSelector, useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { Action } from 'redux'

import Audius from 'services/Audius'
import { AppState } from 'store/types'
import { useEffect } from 'react'
import { setVotes, setUserVote } from './slice'
import { Vote, VoteEvent } from 'types'
import { useDispatchBasedOnBlockNumber } from '../protocol/hooks'

// -------------------------------- Selectors  --------------------------------

export const getVotes = (
  state: AppState,
  { proposalId }: { proposalId: number }
) => state.cache.votes.votes[proposalId]
export const getVotesFor = (
  state: AppState,
  { proposalId }: { proposalId: number }
) => getVotes(state, { proposalId })?.filter(v => v.vote === Vote.Yes)
export const getVotesAgainst = (
  state: AppState,
  { proposalId }: { proposalId: number }
) => getVotes(state, { proposalId })?.filter(v => v.vote === Vote.No)

export const getUserVote = (
  state: AppState,
  { proposalId }: { proposalId: number }
) => state.cache.votes.userVotes[proposalId]

// -------------------------------- Thunk Actions  --------------------------------

export function fetchVotes(
  proposalId: number
): ThunkAction<void, AppState, Audius, Action<string>> {
  return async (dispatch, getState, aud) => {
    const originalVotes = (
      await aud.Governance.getVotesForProposal(proposalId)
    ).filter(Boolean) as VoteEvent[]
    const voteUpdates = (
      await aud.Governance.getVoteUpdatesForProposal(proposalId)
    ).filter(Boolean) as VoteEvent[]

    // Addresses to most up to date vote
    const updatedVoteMap: { [key: string]: VoteEvent } = {}
    for (const vote of voteUpdates) {
      updatedVoteMap[vote.voter] = vote
    }

    const votes = originalVotes.map(vote =>
      vote.voter in updatedVoteMap ? updatedVoteMap[vote.voter] : vote
    )

    dispatch(setVotes({ proposalId, votes }))
  }
}

export function fetchUserVote(
  proposalId: number
): ThunkAction<void, AppState, Audius, Action<string>> {
  return async (dispatch, getState, aud) => {
    const vote = await aud.Governance.getVoteByProposalForOwner(proposalId)
    if (vote) {
      dispatch(setUserVote({ proposalId, vote }))
    }
  }
}

// -------------------------------- Hooks  --------------------------------

export const useVotes = (proposalId: number) => {
  const votes = useSelector(state =>
    getVotes(state as AppState, { proposalId })
  )
  const votesFor = useSelector(state =>
    getVotesFor(state as AppState, { proposalId })
  )
  const votesAgainst = useSelector(state =>
    getVotesAgainst(state as AppState, { proposalId })
  )
  const dispatch = useDispatch()
  useEffect(() => {
    if (votes === null || votes === undefined) {
      dispatch(fetchVotes(proposalId))
    }
  }, [dispatch, votes, proposalId])

  useDispatchBasedOnBlockNumber([fetchVotes(proposalId)], 5)

  return { votes, votesFor, votesAgainst }
}

export const useUserVote = (proposalId: number) => {
  const userVote = useSelector(state =>
    getUserVote(state as AppState, { proposalId })
  )
  const dispatch = useDispatch()

  useEffect(() => {
    if (userVote === null || userVote === undefined) {
      dispatch(fetchUserVote(proposalId))
    }
  }, [dispatch, userVote, proposalId])

  return { userVote }
}
