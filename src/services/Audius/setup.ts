import { AudiusClient } from './AudiusClient'
import audius, { Utils } from '@audius/libs'

declare global {
  interface Window {
    AudiusClient: any
    Audius: any
    Utils: any
    Web3: any
    audiusLibs: any
    web3: any
    ethereum: any
    dataWeb3: any
    configuredMetamaskWeb3: any
    isAccountMisconfigured: boolean
  }
}

const Web3 = window.Web3
window.Utils = Utils

const identityServiceEndpoint = process.env.REACT_APP_IDENTITY_SERVICE_ENDPOINT
const ethRegistryAddress = process.env.REACT_APP_ETH_REGISTRY_ADDRESS
const ethTokenAddress = process.env.REACT_APP_ETH_TOKEN_ADDRESS

const ethProviderUrl =
  process.env.REACT_APP_ETH_PROVIDER_URL || 'ws://localhost:8546'

const ethOwnerWallet = process.env.REACT_APP_ETH_OWNER_WALLET
const ethNetworkId = process.env.REACT_APP_ETH_NETWORK_ID

const SOLANA_CLUSTER_ENDPOINT = process.env.REACT_APP_SOLANA_CLUSTER_ENDPOINT
const WAUDIO_MINT_ADDRESS = process.env.REACT_APP_WAUDIO_MINT_ADDRESS
const SOLANA_TOKEN_ADDRESS = process.env.REACT_APP_SOLANA_TOKEN_PROGRAM_ADDRESS
const CLAIMABLE_TOKEN_PDA = process.env.REACT_APP_CLAIMABLE_TOKEN_PDA
const SOLANA_FEE_PAYER_ADDRESS = process.env.REACT_APP_SOLANA_FEE_PAYER_ADDRESS

const CLAIMABLE_TOKEN_PROGRAM_ADDRESS =
  process.env.REACT_APP_CLAIMABLE_TOKEN_PROGRAM_ADDRESS
const REWARDS_MANAGER_PROGRAM_ID =
  process.env.REACT_APP_REWARDS_MANAGER_PROGRAM_ID
const REWARDS_MANAGER_PROGRAM_PDA =
  process.env.REACT_APP_REWARDS_MANAGER_PROGRAM_PDA
const REWARDS_MANAGER_TOKEN_PDA =
  process.env.REACT_APP_REWARDS_MANAGER_TOKEN_PDA

const IS_PRODUCTION =
  process.env.REACT_APP_ETH_NETWORK_ID &&
  process.env.REACT_APP_ETH_NETWORK_ID === '1'

const IS_STAGING =
  process.env.REACT_APP_ETH_NETWORK_ID &&
  process.env.REACT_APP_ETH_NETWORK_ID === '3'

const DISCOVERY_NODE_ALLOW_LIST = IS_PRODUCTION
  ? new Set([
      'https://discoveryprovider.audius7.prod-us-west-2.staked.cloud',
      'https://discoveryprovider.audius1.prod-us-west-2.staked.cloud',
      'https://discoveryprovider.audius4.prod-us-west-2.staked.cloud',
      'https://discoveryprovider.audius2.prod-us-west-2.staked.cloud',
      'https://discovery-au-01.audius.openplayer.org',
      'https://dn-usa.audius.metadata.fyi',
      'https://discoveryprovider.audius6.prod-us-west-2.staked.cloud',
      'https://dn-jpn.audius.metadata.fyi',
      'https://dn1.monophonic.digital',
      'https://discoveryprovider.audius3.prod-us-west-2.staked.cloud',
      'https://audius-discovery-1.altego.net',
      'https://discoveryprovider.audius.prod-us-west-2.staked.cloud',
      'https://discoveryprovider.audius.co',
      'https://discoveryprovider.audius5.prod-us-west-2.staked.cloud',
      'https://audius-discovery-2.altego.net',
      'https://discoveryprovider2.audius.co',
      'https://audius-dp.johannesburg.creatorseed.com',
      'https://discoveryprovider3.audius.co',
      'https://dn2.monophonic.digital'
    ])
  : undefined

// Used to prevent two callbacks from firing triggering reload
let willReload = false

const getMetamaskChainId = async () => {
  return parseInt(
    await window.ethereum.request({ method: 'eth_chainId' }),
    16
  ).toString()
}

/**
 * Metamask sometimes returns null chainId,
 * so if this happens, try a second time after a slight delay
 */
const getMetamaskIsOnEthMainnet = async () => {
  let chainId = await getMetamaskChainId()
  if (chainId === ethNetworkId) return true

  // Try a second time just in case metamask was being slow to understand itself
  chainId = await new Promise(resolve => {
    console.debug('Metamask network not matching, trying again')
    setTimeout(async () => {
      chainId = await getMetamaskChainId()
      resolve(chainId)
    }, 2000)
  })

  return chainId === ethNetworkId
}

export async function setup(this: AudiusClient): Promise<void> {
  if (!window.web3 || !window.ethereum) {
    // Metamask is not installed
    this.isViewOnly = true
    this.libs = await configureReadOnlyLibs()
  } else {
    // Turn off auto refresh (this causes infinite reload loops)
    window.ethereum.autoRefreshOnNetworkChange = false

    // Metamask is installed
    window.web3 = new Web3(window.ethereum)
    try {
      // Add reload listeners, but make sure the page is fully loaded first
      // 2s is a guess, but the issue is really hard to repro
      if (window.ethereum) {
        setTimeout(() => {
          // Reload anytime the accounts change
          window.ethereum.on('accountsChanged', () => {
            if (!willReload) {
              console.log('Account change')
              willReload = true
              window.location.reload()
            }
          })
          // Reload anytime the network changes
          window.ethereum.on('chainChanged', () => {
            console.log('Chain change')
            if (!willReload) {
              willReload = true
              window.location.reload()
            }
          })
        }, 2000)
      }

      const isOnMainnetEth = await getMetamaskIsOnEthMainnet()
      if (!isOnMainnetEth) {
        this.isMisconfigured = true
        this.libs = await configureReadOnlyLibs()
      } else {
        this.libs = await configureLibsWithAccount()
        this.hasValidAccount = true

        // Failed to pull necessary info from metamask, configure read only
        if (!this.libs) {
          this.libs = await configureReadOnlyLibs()
          this.isAccountMisconfigured = true
          this.hasValidAccount = false
        }
      }
    } catch (err) {
      console.error(err)
      this.libs = await configureReadOnlyLibs()
      this.isMisconfigured = true
    }
  }

  window.audiusLibs = this.libs
  this.isSetup = true
  this.onSetupFinished()
}

const configureReadOnlyLibs = async () => {
  const ethWeb3Config = audius.configEthWeb3(
    ethTokenAddress,
    ethRegistryAddress,
    ethProviderUrl,
    ethOwnerWallet
  )
  const solanaWeb3Config = audius.configSolanaWeb3({
    solanaClusterEndpoint: SOLANA_CLUSTER_ENDPOINT,
    mintAddress: WAUDIO_MINT_ADDRESS,
    solanaTokenAddress: SOLANA_TOKEN_ADDRESS,
    claimableTokenPDA: CLAIMABLE_TOKEN_PDA,
    feePayerAddress: SOLANA_FEE_PAYER_ADDRESS,
    claimableTokenProgramAddress: CLAIMABLE_TOKEN_PROGRAM_ADDRESS,
    rewardsManagerProgramId: REWARDS_MANAGER_PROGRAM_ID,
    rewardsManagerProgramPDA: REWARDS_MANAGER_PROGRAM_PDA,
    rewardsManagerTokenPDA: REWARDS_MANAGER_TOKEN_PDA,
    useRelay: true
  })
  const discoveryProviderConfig = audius.configDiscoveryProvider(
    DISCOVERY_NODE_ALLOW_LIST
  )

  const identityServiceConfig = audius.configIdentityService(
    identityServiceEndpoint
  )

  let audiusLibsConfig = {
    ethWeb3Config,
    solanaWeb3Config,
    discoveryProviderConfig,
    identityServiceConfig,
    isServer: false,
    isDebug: !IS_PRODUCTION && !IS_STAGING
  }
  const libs = new audius(audiusLibsConfig)
  await libs.init()
  return libs
}

const configureLibsWithAccount = async () => {
  let configuredMetamaskWeb3 = await Utils.configureWeb3(
    window.web3.currentProvider,
    // Pass network version here for ethNetworkId. Libs uses an out of date network check
    window.ethereum.networkVersion,
    false
  )
  console.log(configuredMetamaskWeb3)

  let metamaskAccounts: any = await new Promise(resolve => {
    configuredMetamaskWeb3.eth.getAccounts((...args: any) => {
      resolve(args[1])
    })
  })
  let metamaskAccount = metamaskAccounts[0]

  // Not connected or no accounts, return
  if (!metamaskAccount) {
    return null
  }
  let audiusLibsConfig = {
    ethWeb3Config: audius.configEthWeb3(
      ethTokenAddress,
      ethRegistryAddress,
      configuredMetamaskWeb3,
      metamaskAccount
    ),
    solanaWeb3Config: audius.configSolanaWeb3({
      solanaClusterEndpoint: SOLANA_CLUSTER_ENDPOINT,
      mintAddress: WAUDIO_MINT_ADDRESS,
      solanaTokenAddress: SOLANA_TOKEN_ADDRESS,
      claimableTokenPDA: CLAIMABLE_TOKEN_PDA,
      feePayerAddress: SOLANA_FEE_PAYER_ADDRESS,
      claimableTokenProgramAddress: CLAIMABLE_TOKEN_PROGRAM_ADDRESS,
      rewardsManagerProgramId: REWARDS_MANAGER_PROGRAM_ID,
      rewardsManagerProgramPDA: REWARDS_MANAGER_PROGRAM_PDA,
      rewardsManagerTokenPDA: REWARDS_MANAGER_TOKEN_PDA,
      useRelay: true
    }),
    discoveryProviderConfig: audius.configDiscoveryProvider(
      DISCOVERY_NODE_ALLOW_LIST
    ),
    identityServiceConfig: audius.configIdentityService(
      identityServiceEndpoint
    ),
    isServer: false,
    isDebug: !IS_PRODUCTION && !IS_STAGING
  }
  const libs = new audius(audiusLibsConfig)
  await libs.init()
  return libs
}
