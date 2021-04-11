import { useSelector, useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { Action } from 'redux'

import Audius from 'services/Audius'
import { AppState } from 'store/types'
import {
  setActiveProposals,
  setAllProposals,
  setExecutionDelay,
  setProposal,
  setVotingPeriod
} from './slice'
import { useEffect } from 'react'
import {
  Proposal,
  ProposalEvent,
  Outcome,
  InProgressOutcomeSubstates
} from 'types'
import {
  useTotalStaked,
  useDispatchBasedOnBlockNumber,
  useTimeRemaining,
  useEthBlockNumber
} from 'store/cache/protocol/hooks'

// -------------------------------- Selectors  --------------------------------
export const getActiveProposals = (state: AppState) =>
  state.cache.proposals.activeProposals
export const getAllProposals = (state: AppState) =>
  state.cache.proposals.allProposals
export const getResolvedProposals = (state: AppState) => {
  const allProposals = getAllProposals(state)
  return (
    state.cache.proposals.resolvedProposals?.map(p => allProposals[p]) ?? null
  )
}
export const getRecentProposals = (state: AppState) => {
  const active = getActiveProposals(state)
  if (active && active.length < 5) {
    const resolved = getResolvedProposals(state)
    if (resolved === null) return null
    return active.concat(resolved.slice(0, 5 - active.length) || [])
  }
  return active
}
export const getProposal = (
  state: AppState,
  { proposalId }: { proposalId: number }
) => state.cache.proposals.allProposals[proposalId]

export const getVotingPeriod = (state: AppState) =>
  state.cache.proposals.votingPeriod

export const getExecutionDelay = (state: AppState) =>
  state.cache.proposals.executionDelay

// -------------------------------- Thunk Actions  --------------------------------

export function fetchActiveProposals(): ThunkAction<
  void,
  AppState,
  Audius,
  Action<string>
> {
  return async (dispatch, getState, aud) => {
    const proposalIds = await aud.Governance.getInProgressProposalIds()
    const proposals = (
      await Promise.all(
        proposalIds.map(async id => {
          const proposal = await aud.Governance.getProposalById(id)
          const quorum = await aud.Governance.getProposalQuorum(id)
          const {
            name,
            description
          } = await aud.Governance.getProposalSubmissionById(id)
          proposal.name = name
          proposal.description = description
          proposal.quorum = quorum
          return proposal
        })
      )
    ).reverse() // Reverse chronological

    dispatch(setActiveProposals({ proposals }))
  }
}

export function fetchAllProposals(): ThunkAction<
  void,
  AppState,
  Audius,
  Action<string>
> {
  return async (dispatch, getState, aud) => {
    const proposalEvents = await aud.Governance.getProposals()
    const proposals: Proposal[] = await Promise.all(
      proposalEvents.map(async (p: ProposalEvent) => {
        const { proposalId, description, name } = p
        const proposal = await aud.Governance.getProposalById(proposalId)
        const quorum = await aud.Governance.getProposalQuorum(proposalId)
        proposal.description = description
        proposal.name = name
        proposal.quorum = quorum
        if (proposal.outcome !== Outcome.InProgress) {
          const evaluationBlockNumber = await aud.Governance.getProposalEvaluationBlock(
            proposalId
          )
          proposal.evaluatedBlock = evaluationBlockNumber
        }
        return proposal
      })
    )

    dispatch(setAllProposals({ proposals }))
  }
}

export function fetchProposal(
  proposalId: number
): ThunkAction<void, AppState, Audius, Action<string>> {
  return async (dispatch, getState, aud) => {
    const proposal = await aud.Governance.getProposalById(proposalId)
    const quorum = await aud.Governance.getProposalQuorum(proposalId)
    const {
      name,
      description
    } = await aud.Governance.getProposalSubmissionById(proposalId)
    proposal.name = name
    proposal.description = description
    proposal.quorum = quorum
    if (proposal.outcome !== Outcome.InProgress) {
      const evaluationBlockNumber = await aud.Governance.getProposalEvaluationBlock(
        proposalId
      )
      proposal.evaluatedBlock = evaluationBlockNumber
    }

    dispatch(setProposal({ proposal }))
  }
}

export function fetchVotingPeriod(): ThunkAction<
  void,
  AppState,
  Audius,
  Action<string>
> {
  return async (dispatch, getState, aud) => {
    const votingPeriod = await aud.Governance.getVotingPeriod()
    dispatch(setVotingPeriod({ votingPeriod }))
  }
}

export function fetchExecutionDelay(): ThunkAction<
  void,
  AppState,
  Audius,
  Action<string>
> {
  return async (dispatch, getState, aud) => {
    const executionDelay = await aud.Governance.getExecutionDelay()
    dispatch(setExecutionDelay({ executionDelay }))
  }
}

// -------------------------------- Hooks  --------------------------------

export const useProposals = () => {
  const activeProposals = useSelector(getActiveProposals)
  const allProposals = useSelector(getAllProposals)
  const resolvedProposals = useSelector(getResolvedProposals)
  const recentProposals = useSelector(getRecentProposals)
  const dispatch = useDispatch()

  useEffect(() => {
    if (activeProposals === null) {
      dispatch(fetchActiveProposals())
    }
    if (resolvedProposals === null) {
      dispatch(fetchAllProposals())
    }
  }, [dispatch, activeProposals, resolvedProposals, allProposals])

  useDispatchBasedOnBlockNumber(
    [fetchActiveProposals(), fetchAllProposals()],
    5
  )

  return { activeProposals, allProposals, resolvedProposals, recentProposals }
}

export const useProposal = (proposalId: number) => {
  const proposal = useSelector(state =>
    getProposal(state as AppState, { proposalId })
  )
  const dispatch = useDispatch()
  useEffect(() => {
    if (proposal === null || proposal === undefined) {
      dispatch(fetchProposal(proposalId))
    }
  }, [dispatch, proposal, proposalId])

  return { proposal }
}

export const useVotingPeriod = () => {
  const votingPeriod = useSelector(getVotingPeriod)
  const dispatch = useDispatch()
  useEffect(() => {
    if (!votingPeriod) {
      dispatch(fetchVotingPeriod())
    }
  }, [dispatch, votingPeriod])

  return { votingPeriod }
}

export const useExecutionDelay = () => {
  const executionDelay = useSelector(getExecutionDelay)
  const dispatch = useDispatch()
  useEffect(() => {
    if (!executionDelay) {
      dispatch(fetchExecutionDelay())
    }
  }, [dispatch, executionDelay])

  return { executionDelay }
}

export const useProposalTimeRemaining = (submissionBlock: number) => {
  const { votingPeriod } = useVotingPeriod()
  const remaining = useTimeRemaining(submissionBlock, votingPeriod)
  return remaining
}

export const useAmountAbstained = (proposal: Proposal) => {
  const totalStaked = useTotalStaked()
  if (!proposal || !totalStaked) return null
  const voteMagnitude = proposal.voteMagnitudeYes.add(proposal.voteMagnitudeNo)
  return totalStaked.sub(voteMagnitude)
}

/**
 * Although a proposal can be InProgress, there's several substates like:
 * InProgress - can be voted on
 * InProgressExecutionDelay - cannot be voted on, but not yet ready for execution
 * InProgressAwaitingExecution - can be executed
 * @param proposal Proposal object
 */
export const useGetInProgressProposalSubstate = (proposal: Proposal) => {
  const { votingPeriod } = useVotingPeriod()
  const { executionDelay } = useExecutionDelay()
  const currentBlockNumber = useEthBlockNumber()

  if (!proposal || !proposal.submissionBlockNumber)
    return InProgressOutcomeSubstates.InProgress

  const { submissionBlockNumber } = proposal
  if (
    !submissionBlockNumber ||
    !votingPeriod ||
    !executionDelay ||
    !currentBlockNumber
  )
    return InProgressOutcomeSubstates.InProgress

  if (
    currentBlockNumber >=
    submissionBlockNumber + votingPeriod + executionDelay
  )
    return InProgressOutcomeSubstates.InProgressAwaitingExecution
  else if (currentBlockNumber >= submissionBlockNumber + votingPeriod)
    return InProgressOutcomeSubstates.InProgressExecutionDelay
  else return InProgressOutcomeSubstates.InProgress
}
