import { AudiusClient } from '../AudiusClient'

import { Address, BigNumber } from 'types'

export default class AudiusToken {
  aud: AudiusClient

  constructor(aud: AudiusClient) {
    this.aud = aud
  }

  getContract() {
    return this.aud.libs.ethContracts.AudiusTokenClient
  }

  async balanceOf(account: Address): Promise<BigNumber> {
    await this.aud.hasPermissions()
    const info = await this.getContract().balanceOf(account)
    return info
  }
}
