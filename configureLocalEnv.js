const AUDIUS_CONFIG = '.audius/config.json'
const AUDIUS_ETH_CONFIG = '.audius/eth-config.json'
const AUDIUS_SOL_CONFIG = '.audius/solana-program-config.json'

const fs = require('fs')
const path = require('path')
const homeDir = require('os').homedir()
try {
  const configFile = require(path.join(homeDir, AUDIUS_CONFIG))
  const ethConfigFile = require(path.join(homeDir, AUDIUS_ETH_CONFIG))
  const solConfigFile = require(path.join(homeDir, AUDIUS_SOL_CONFIG))
  console.log(configFile)
  console.log(ethConfigFile)
  console.log(solConfigFile)

  const remoteHost = process.env.AUDIUS_REMOTE_DEV_HOST
  const localhost = 'localhost'
  const useRemoteHost =
    remoteHost && process.argv.length > 2 && process.argv[2] == 'remote'
  const host = useRemoteHost ? remoteHost : localhost

  const REACT_APP_ENVIRONMENT = 'development'
  const REACT_APP_CONTENT_NODE = `http://${host}:4000`
  const REACT_APP_DISCOVERY_PROVIDER = `http://${host}:5000`
  const REACT_APP_IDENTITY_SERVICE = `http://${host}:7000`
  const REACT_APP_IPFS_GATEWAY = `http://${host}:8080/ipfs/`

  const REACT_APP_REGISTRY_ADDRESS = configFile.registryAddress
  const REACT_APP_WEB3_PROVIDER_URL = `http://${host}:8545`
  const REACT_APP_OWNER_WALLET = configFile.ownerWallet

  const REACT_APP_ETH_REGISTRY_ADDRESS = ethConfigFile.registryAddress
  const REACT_APP_ETH_PROVIDER_URL = `http://${host}:8546`
  const REACT_APP_ETH_TOKEN_ADDRESS = ethConfigFile.audiusTokenAddress
  const REACT_APP_ETH_OWNER_WALLET = ethConfigFile.ownerWallet
  // Chain id is 1337 for local eth ganache because we are ... leet
  const REACT_APP_ETH_NETWORK_ID = 1337

  const REACT_APP_CLAIMABLE_TOKEN_PROGRAM_ADDRESS =
    solConfigFile.claimableTokenAddress
  const REACT_APP_REWARDS_MANAGER_PROGRAM_ID =
    solConfigFile.rewardsManagerAddress
  const REACT_APP_REWARDS_MANAGER_PROGRAM_PDA =
    solConfigFile.rewardsManagerAccount
  const REACT_APP_REWARDS_MANAGER_TOKEN_PDA =
    solConfigFile.rewardsManagerTokenAccount
  const REACT_APP_SOLANA_TOKEN_PROGRAM_ADDRESS =
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  const REACT_APP_SOLANA_WEB3_CLUSTER = 'devnet'
  const REACT_APP_SOLANA_CLUSTER_ENDPOINT = `http://${host}:8899`
  const REACT_APP_WAUDIO_MINT_ADDRESS = solConfigFile.splToken
  const REACT_APP_SOLANA_FEE_PAYER_ADDRESS = solConfigFile.feePayerWalletPubkey

  const REACT_APP_AUDIUS_URL = `http://${host}:3000`
  const REACT_APP_GQL_URI = `http://${host}:8000/subgraphs/name/AudiusProject/audius-subgraph`

  const REACT_APP_IDENTITY_SERVICE_ENDPOINT = `http://${host}:7000`

  const contents = `
  # DO NOT MODIFY. SEE /scripts/configureLocalEnv.sh
  
  REACT_APP_ENVIRONMENT=${REACT_APP_ENVIRONMENT}
  
  REACT_APP_DISCOVERY_PROVIDER=${REACT_APP_DISCOVERY_PROVIDER}
  REACT_APP_CONTENT_NODE=${REACT_APP_CONTENT_NODE}
  REACT_APP_IDENTITY_SERVICE=${REACT_APP_IDENTITY_SERVICE}
  REACT_APP_IPFS_GATEWAY=${REACT_APP_IPFS_GATEWAY}
  
  REACT_APP_REGISTRY_ADDRESS=${REACT_APP_REGISTRY_ADDRESS}
  REACT_APP_WEB3_PROVIDER_URL=${REACT_APP_WEB3_PROVIDER_URL}

  REACT_APP_OWNER_WALLET=${REACT_APP_OWNER_WALLET}

  REACT_APP_ETH_REGISTRY_ADDRESS=${REACT_APP_ETH_REGISTRY_ADDRESS}
  REACT_APP_ETH_PROVIDER_URL=${REACT_APP_ETH_PROVIDER_URL}
  REACT_APP_ETH_TOKEN_ADDRESS=${REACT_APP_ETH_TOKEN_ADDRESS}
  REACT_APP_ETH_OWNER_WALLET=${REACT_APP_ETH_OWNER_WALLET}
  REACT_APP_ETH_NETWORK_ID=${REACT_APP_ETH_NETWORK_ID}

  REACT_APP_CLAIMABLE_TOKEN_PROGRAM_ADDRESS=${REACT_APP_CLAIMABLE_TOKEN_PROGRAM_ADDRESS}
  REACT_APP_SOLANA_TOKEN_PROGRAM_ADDRESS=${REACT_APP_SOLANA_TOKEN_PROGRAM_ADDRESS}
  REACT_APP_SOLANA_CLUSTER_ENDPOINT=${REACT_APP_SOLANA_CLUSTER_ENDPOINT}
  REACT_APP_SOLANA_WEB3_CLUSTER=${REACT_APP_SOLANA_WEB3_CLUSTER}
  REACT_APP_WAUDIO_MINT_ADDRESS=${REACT_APP_WAUDIO_MINT_ADDRESS}
  REACT_APP_SOLANA_FEE_PAYER_ADDRESS=${REACT_APP_SOLANA_FEE_PAYER_ADDRESS}
  REACT_APP_REWARDS_MANAGER_PROGRAM_ID=${REACT_APP_REWARDS_MANAGER_PROGRAM_ID}
  REACT_APP_REWARDS_MANAGER_PROGRAM_PDA=${REACT_APP_REWARDS_MANAGER_PROGRAM_PDA}
  REACT_APP_REWARDS_MANAGER_TOKEN_PDA=${REACT_APP_REWARDS_MANAGER_TOKEN_PDA}

  REACT_APP_AUDIUS_URL=${REACT_APP_AUDIUS_URL}
  REACT_APP_GQL_URI=${REACT_APP_GQL_URI}

  REACT_APP_IDENTITY_SERVICE_ENDPOINT=${REACT_APP_IDENTITY_SERVICE_ENDPOINT}
  `

  // Note .env.development.local takes precidence over .env.development
  // https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables
  fs.writeFile('./.env.dev.local', contents, err => {
    if (err) {
      console.error(err)
    }
    console.log('Configured .env.dev.local')
  })
} catch (e) {
  console.error(`
    Did not find configuration file.
    See https://github.com/AudiusProject/audius-e2e-tests to configure a local dev environment.
  `, e)
}
