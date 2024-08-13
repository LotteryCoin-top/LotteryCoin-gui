import BigNumber from 'bignumber.js';

import Unit from '../constants/Unit';

import lotteryFormatter from './lotteryFormatter';

export default function lotteryToMojo(lottery: string | number | BigNumber): BigNumber {
  return lotteryFormatter(lottery, Unit.LOTTERY).to(Unit.MOJO).toBigNumber();
}
