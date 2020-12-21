import { Address } from 'types'
import BN from 'bn.js'
import {
  GetRegisteredServiceProviderEventsResponse,
  GetDeregisteredServiceProviderEventsResponse,
  GetIncreasedStakeEventResponse
} from '../services/Audius/serviceProviderClient'

type EventType =
  /* Governance */
  | 'GovernanceVote'
  | 'GovernanceProposal'

  /* Delegation */
  | 'DelegateIncrease'
  | '' // TODO: what is the increaseDelegateStakeEvent?
  | 'DelegateUndelegated'

  /* Claims */
  | 'ClaimProcessed'

  /* ServiceProvider */
  | 'ServiceProviderRegistered'
  | 'ServiceProviderDeregistered'
  | 'ServiceProviderIncreaseStake'
  | 'ServiceProviderDecreaseStake'

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

export type TimelineEvent = ServiceProviderRegisteredEvent
