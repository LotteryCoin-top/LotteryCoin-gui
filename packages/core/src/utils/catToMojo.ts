import BigNumber from 'bignumber.js';

import Unit from '../constants/Unit';

import lotteryFormatter from './lotteryFormatter';

export default function catToMojo(cat: string | number | BigNumber): BigNumber {
  return lotteryFormatter(cat, Unit.CAT).to(Unit.MOJO).toBigNumber();
}
