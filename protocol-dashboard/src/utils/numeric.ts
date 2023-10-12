import BN from 'bn.js'
import { Utils } from '@audius/sdk/dist/legacy.js'
import AudiusClient from 'services/Audius'

export const WEI = new BN('1000000000000000000')

export const checkOnlyNumeric = (number: string) => {
  let reg = /^\d+$/
  return reg.test(number)
}

export const checkOnlyWeiFloat = (number: string): boolean => {
  let reg = /^[+-]?\d+(\.\d+)?$/
  const isFloat = reg.test(number)
  if (!isFloat) return false
  const nums = number.split('.')
  if (nums.length !== 2) return false
  if (!checkOnlyNumeric(nums[0]) || !checkOnlyNumeric(nums[1])) return false
  if (nums[1].length > 18) return false
  return true
}

export const convertFloatToWei = (number: string) => {
  const nums = number.split('.')
  if (nums.length !== 2) return null
  if (!checkOnlyNumeric(nums[0]) || !checkOnlyNumeric(nums[1])) return null
  let aud = Utils.toBN(nums[0]).mul(Utils.toBN('1000000000000000000'))
  const weiMultiplier = 18 - nums[1].length
  let wei = Utils.toBN(nums[1]).mul(
    Utils.toBN('1'.padEnd(weiMultiplier + 1, '0'))
  )
  return aud.add(wei)
}

export const checkWeiNumber = (number: string) => {
  return checkOnlyNumeric(number) || checkOnlyWeiFloat(number)
}

export const parseWeiNumber = (number: string) => {
  if (checkOnlyNumeric(number)) {
    return AudiusClient.getWei(Utils.toBN(number))
  } else if (checkOnlyWeiFloat(number)) {
    return convertFloatToWei(number)
  }
}

/**
 * Divides $AUDIO in Wei into whole $AUDIO and casts to number
 * @param num
 */
export const weiAudToAud = (num: BN) => {
  return num.div(WEI).toNumber()
}

/**
 * Computes the fraction between two BNs when they are
 * @param numerator
 * @param denominator
 */
export const fraction = (numerator: BN, denominator: BN) => {
  return numerator.div(WEI).toNumber() / denominator.div(WEI).toNumber()
}
