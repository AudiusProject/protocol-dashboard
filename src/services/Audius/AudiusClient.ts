import ServiceProviderClient from './service-provider/serviceProviderClient'
import Staking from './staking/staking'
import AudiusToken from './token/audiusToken'
import Delegate from './delegate/delegate'
import Governance from './governance/governance'
import NodeType from './nodeType'
import Claim from './claim/claim'

import { setup } from './setup'
import {
  hasPermissions,
  awaitSetup,
  getEthBlockNumber,
  getAverageBlockTime,
  getBNPercentage,
  displayAud,
  displayShortAud,
  getAud,
  getWei,
  getNodeVersion,
  getEthWallet,
  getBlock,
  getBlockNearTimestamp
} from './helpers'
import { getUserDelegates } from './wrappers'

export class AudiusClient {
  constructor() {
    this.AudiusToken = new AudiusToken(this)
    this.Delegate = new Delegate(this)
    this.ServiceProviderClient = new ServiceProviderClient(this)
    this.NodeType = new NodeType(this)
    this.Staking = new Staking(this)
    this.Governance = new Governance(this)
    this.Claim = new Claim(this)
  }

  AudiusToken: AudiusToken
  Delegate: Delegate
  ServiceProviderClient: ServiceProviderClient
  NodeType: NodeType
  Staking: Staking
  Governance: Governance
  Claim: Claim

  libs: any = {}
  setup = setup

  isSetup = false // If the setup is complete
  hasValidAccount = false // If metamask is set up correctly
  isAccountMisconfigured = false // If metamask is present and account is not connected
  isMisconfigured = false // If metamask is present and misconfigured (wrong network)
  isViewOnly = false // If metamask is not present

  // Class helpers
  hasPermissions = hasPermissions
  awaitSetup = awaitSetup

  // Wrapper functions
  getUserDelegates = getUserDelegates

  // Util Functions
  getEthBlockNumber = getEthBlockNumber
  getEthWallet = getEthWallet
  getAverageBlockTime = getAverageBlockTime
  getBlockNearTimestamp = getBlockNearTimestamp
  getBlock = getBlock

  // Static Util Functions
  static getBNPercentage = getBNPercentage
  static displayAud = displayAud
  static displayShortAud = displayShortAud
  static getAud = getAud
  static getWei = getWei
  static getNodeVersion = getNodeVersion
}

window.AudiusClient = AudiusClient

export default AudiusClient
