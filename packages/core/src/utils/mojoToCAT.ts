import BigNumber from 'bignumber.js';

import Unit from '../constants/Unit';

import lotteryFormatter from './lotteryFormatter';

export default function mojoToCAT(mojo: string | number | BigNumber): BigNumber {
  return lotteryFormatter(mojo, Unit.MOJO).to(Unit.CAT).toBigNumber();
}
