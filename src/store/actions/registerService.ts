import { useState, useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { Action } from 'redux'

import { Status, ServiceType, BigNumber, Address } from 'types'
import Audius from 'services/Audius'
import { AppState } from 'store/types'
import { getAccountWallet } from 'store/account/hooks'
import { fetchUser } from 'store/cache/user/hooks'
import { getDiscoveryProvider } from 'store/cache/discoveryProvider/hooks'
import { getContentNode } from 'store/cache/contentNode/hooks'
import { shuffle } from 'lodash'

function registerAudiusService(
  serviceType: ServiceType,
  endpoint: string,
  stakingAmount: BigNumber,
  delegateOwnerWallet: string | undefined,
  setStatus: (status: Status) => void,
  setError: (msg: string) => void
): ThunkAction<void, AppState, Audius, Action<string>> {
  return async (dispatch, getState, aud) => {
    setStatus(Status.Loading)

    const state = getState()
    const wallet = getAccountWallet(state)

    try {
      let spID
      // Register the service on chain (eth)
      if (!!delegateOwnerWallet) {
        const res = await aud.ServiceProviderClient.registerWithDelegate(
          serviceType,
          endpoint,
          stakingAmount,
          delegateOwnerWallet
        )
        spID = res.spID
      } else {
        const res = await aud.ServiceProviderClient.register(
          serviceType,
          endpoint,
          stakingAmount
        )
        spID = res.spID
      }

      try {
        const otherServices: string[] = await aud.libs.discoveryProvider.serviceSelector.findAll()
        const attestEndpoints = shuffle(
          otherServices.filter(s => s !== endpoint)
        ).slice(0, 3)
  
        const senderEthAddress = delegateOwnerWallet || wallet
        const attestations = await Promise.all(attestEndpoints.map(async attestEndpoint => {
          try {
            const res = await fetch(
              `${attestEndpoint}/v1/challenges/attest_sender?sender_eth_address=${senderEthAddress}`
            )
            const json = await res.json()
            return {
              ethAddress: json.data.owner_wallet,
              signature: json.data.attestation
            }
          } catch (e) {
            console.error(
              `Failed to get attestations from other nodes ${attestEndpoints}`
            )
          }
        }))

        // Register the server as a sender on the rewards manager
        const receipt = await aud.libs.solanaWeb3Manager.createSender({
          senderEthAddress,
          operatorEthAddress: wallet,
          attestations
        })
        console.info(`Successfully registered as a rewards sender ${receipt}`)
        if (receipt.error) {
          // Unfortunately, we can't error here because the eth and solana registration
          // is not atomic. Eth registration has already gone through and we should show
          // the service as registered from the user persp.
          // Good news is someone else could register this node as a sender since this
          // mechanism is permissionless
          console.error(`Received error with code ${receipt.errorCode}`, receipt.error)
        }
      } catch (e) {
        console.error('Failed to create new solana sender', e)
      }

      // Repull pending transactions
      if (wallet) await dispatch(fetchUser(wallet))
      if (serviceType === ServiceType.DiscoveryProvider) {
        await dispatch(getDiscoveryProvider(spID))
      } else {
        await dispatch(getContentNode(spID))
      }

      setStatus(Status.Success)
    } catch (err) {
      setStatus(Status.Failure)
      setError(err.message)
    }
  }
}

export const useRegisterService = (shouldReset?: boolean) => {
  const [status, setStatus] = useState<undefined | Status>()
  const [error, setError] = useState<string>('')
  const dispatch = useDispatch()
  useEffect(() => {
    if (shouldReset) {
      setStatus(undefined)
      setError('')
    }
  }, [shouldReset, setStatus, setError])

  const registerService = useCallback(
    (
      serviceType: ServiceType,
      endpoint: string,
      stakingAmount: BigNumber,
      delegateOwnerWallet: Address
    ) => {
      if (status !== Status.Loading) {
        dispatch(
          registerAudiusService(
            serviceType,
            endpoint,
            stakingAmount,
            delegateOwnerWallet,
            setStatus,
            setError
          )
        )
      }
    },
    [dispatch, status, setStatus, setError]
  )
  return { status, error, registerService }
}
