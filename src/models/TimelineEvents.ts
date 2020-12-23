import { Address, ProposalEvent, VoteEvent } from 'types'
import BN from 'bn.js'
import {
  GetRegisteredServiceProviderEventsResponse,
  GetDeregisteredServiceProviderEventsResponse,
  GetIncreasedStakeEventResponse
} from '../services/Audius/service-provider/types'
import { GetIncreaseDelegateStakeEventsResponse } from 'services/Audius/delegate/types'
import {
  GetClaimEventsResponse,
  GetDelegatorRemovedEventsResponse,
  GetSlashEventsResponse
} from 'services/Audius/delegate/types'
import { GetClaimProcessedResponse } from '../services/Audius/claim/types'

/* ServiceProvider Events */

export type ServiceProviderRegisteredEvent = GetRegisteredServiceProviderEventsResponse & {
  _type: 'ServiceProviderRegistered'
}

export type ServiceProviderDeregisteredEvent = GetDeregisteredServiceProviderEventsResponse & {
  _type: 'ServiceProviderDeregistered'
}

export type ServiceProviderIncreaseStakeEvent = GetIncreasedStakeEventResponse & {
  _type: 'ServiceProviderIncreaseStake'
}

/** Decrease Stake Event, in requested | cancelled | evaluated phases */
export type ServiceProviderDecreaseStakeEvent = {
  _type: 'ServiceProviderDecreaseStake'
  blockNumber: number
  owner: Address
  decreaseAmount: BN
  data:
    | {
        lockupExpiryBlock: number
        _type: 'Requested'
      }
    | {
        lockupExpiryBlock: number
        _type: 'Cancelled'
      }
    | {
        newStakeAmount: BN
        _type: 'Evaluated'
      }
}

/* Delegate Client events */

/** Increase Delegation Event, from Received and Sent directions */
export type DelegateIncreaseStakeEvent = GetIncreaseDelegateStakeEventsResponse & {
  _type: 'DelegateIncreaseStake'
  direction: 'Received' | 'Sent'
}

export type DelegateDecreaseStakeEvent = {
  _type: 'DelegateDecreaseStake'
  direction: 'Received' | 'Sent'
  blockNumber: number
  delegator: Address
  amount: BN
  serviceProvider: Address
  data:
    | {
        _type: 'Requested'
        lockupExpiryBlock: number
      }
    | {
        _type: 'Evaluated'
      }
    | {
        _type: 'Cancelled'
      }
}

export type DelegateClaimEvent = GetClaimEventsResponse & {
  _type: 'DelegateClaim'
}

export type DelegateSlashEvent = GetSlashEventsResponse & {
  _type: 'DelegateSlash'
}

export type DelegateRemovedEvent = GetDelegatorRemovedEventsResponse & {
  _type: 'DelegateRemoved'
}

/* Governance Events */

export type GovernanceVoteEvent = VoteEvent & {
  _type: 'GovernanceVote'
}

export type GovernanceVoteUpdateEvent = VoteEvent & {
  _type: 'GovernanceVoteUpdate'
}

export type GovernanceProposalEvent = ProposalEvent & {
  _type: 'GovernanceProposal'
}

/* Claim Events */

export type ClaimProcessedEvent = GetClaimProcessedResponse & {
  _type: 'ClaimProcessed'
}

/* Combined Events */

export type TimelineEvent =
  | ServiceProviderRegisteredEvent
  | ServiceProviderDeregisteredEvent
  | ServiceProviderIncreaseStakeEvent
  | ServiceProviderDecreaseStakeEvent
  | DelegateIncreaseStakeEvent
  | DelegateDecreaseStakeEvent
  | DelegateClaimEvent
  | DelegateSlashEvent
  | DelegateRemovedEvent
  | GovernanceVoteEvent
  | GovernanceVoteUpdateEvent
  | GovernanceProposalEvent
  | ClaimProcessedEvent
