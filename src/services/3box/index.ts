import { Address } from 'types'
import { TIMED_OUT_ERROR, withTimeout } from 'utils/fetch'
import { getRandomDefaultImage } from 'utils/identicon'
import Ceramic from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'

import * as selfWeb from '@self.id/core'

const ceramic = new Ceramic('https://gateway.ceramic.network')
// https://gateway-clay.ceramic.network

const { getLegacy3BoxProfileAsBasicProfile } = requireESM('@self.id/3box-legacy')

const ipfsGateway = 'https://ipfs.infura.io/ipfs/'
const core = new Core({ ceramic: 'https://gateway.ceramic.network' })

type User = {
  status?: string
  name?: string
  image: string
}

type UserWithCache = User & {
  noCache?: boolean
}

type IDXImage = {
  src: string // ie. "ipfs://QmNnMqEbiG4HtMigg8mfPMr7LYewezncMHwAveQZyMqDp4",
  size: number
  width: number
  height: number
  mimeType: string // ie. "image/png"
}

type IDXUser = {
  image?: {
    original: IDXImage
    alternatives: IDXImage[]
  },
  background?: {
    original: IDXImage
    alternatives: IDXImage[]
  },
  name?: string,
  description?: string,
  emoji?: string
  homeLocation?: string
  residenceCountry?: string
  url?: string
}


const transformIDXUser = (user: IDXUser): User => {
  const imageSrc = user?.image?.original?.src
  let image = ''
  if (imageSrc && imageSrc.startsWith('ipfs://')) {
    const cid = imageSrc.substring(7)
    image = `${ipfsGateway}${cid}`
  }
  return {
    image
  }
}

export const get3BoxProfile = async (
  wallet: Address
): Promise<UserWithCache> => {
  const image = getRandomDefaultImage(wallet)
  try {
    const user: User = { image }
    const profile = { status: 'error' }
    // const aliases = {}
    // const idx = new IDX({ ceramic, aliases })
    console.log('fetching profile')
    try {
      // console.log({ core })
      // const res = await idx.get('basicProfile', wallet.toLowerCase() + '@eip155:1')
      // const res = await idx.get('basicProfile', '0xBc6925Aab867dF478688638EF40D3bDb8C376192' + '@eip155:1')
      // const key = await idx._toIndexKey('basicProfile')
      // const rId1 = await idx.getRecordID(key, '0xBc6925Aab867dF478688638EF40D3bDb8C376192' + '@eip155:1')
      // const rId2 = await idx.getRecordID(key, '0x9ae9155cCA4b6694Ed0e09ee506cF600a31C3199' + '@eip155:1')
      // const res = await idx.get('basicProfile', '0x9ae9155cCA4b6694Ed0e09ee506cF600a31C3199' + '@eip155:1')
      // if (rId1 && rId2) {
      // const res = await idx.ceramic.multiQuery([{ streamId: rId1 }, { streamId: rId2 }])
      // console.log({ res, rId1, rId2, key })
      // if (res) {
      //   const user = transformIDXUser(res as IDXUser)
      //   console.log({ res, user })
      // }
      // }""
    } catch (error) {
      if ((error as Error).message.startsWith('No DID found for')) {
        console.log(`No idx profile: ${(error as Error).message}`)
      } else {
        console.error((error as Error).message)
      }
    }

    let profile = await core.get('basicProfile', wallet + '@eip155:1')
    if (!profile) {
      profile = (await getLegacy3BoxProfileAsBasicProfile(getProfile(wallet), 3000)) as User
      if (profile.status === 'error') return user
    }

    // Extract the name and image url
    // if ('name' in profile) user.name = profile.name
    // if (Array.isArray(profile.image) && profile.image.length > 0) {
    //   const [firstImage] = profile.image
    //   if ('contentUrl' in firstImage && '/' in firstImage.contentUrl) {
    //     const hash = firstImage.contentUrl['/']
    //     user.image = `${ipfsGateway}${hash}`
    //   }
    // }

    // return the user
    return user
  } catch (err: any) {
    console.log(err)
    if (err.message.includes(TIMED_OUT_ERROR)) {
      // Response timed out - do not cache response
      return { image, noCache: true }
    }
    return { image }
  }
}

// NOTE: Look into storing the profiles in localstorage or indexdb.
const cache3box: {
  [address: string]: User
} = {}

export const getUserProfile = async (wallet: string): Promise<User> => {
  if (wallet in cache3box) return cache3box[wallet]
  const profile = await get3BoxProfile(wallet)
  if (!profile.noCache) cache3box[wallet] = profile
  return {
    name: profile.name || wallet,
    image: profile.image
  }
}

export default getUserProfile
