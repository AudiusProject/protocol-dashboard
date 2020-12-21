import { Address } from 'types'
import BN from 'bn.js'
import {
  GetRegisteredServiceProviderEventsResponse,
  GetDeregisteredServiceProviderEventsResponse,
  GetIncreasedStakeEventResponse
} from '../services/Audius/serviceProviderClient'
import {
  GetClaimEventsResponse,
  GetDelegatorRemovedEventsResponse,
  GetIncreaseDelegateStakeEventsResponse,
  GetSlashEventsResponse
} from 'services/Audius/delegate'

type EventType =
  /* Governance */
  | 'GovernanceVote'
  | 'GovernanceProposal'

  /* Delegation */
  | 'DelegateIncreaseStake'
  | 'DelegateDecreaseStake'

  /* Claims */
  | 'ClaimProcessed'

  /* ServiceProvider */
  | 'ServiceProviderRegistered'
  | 'ServiceProviderDeregistered'
  | 'ServiceProviderIncreaseStake'
  | 'ServiceProviderDecreaseStake'
  | 'ServiceProviderClaim'

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

export type TimelineEvent = ServiceProviderRegisteredEvent
