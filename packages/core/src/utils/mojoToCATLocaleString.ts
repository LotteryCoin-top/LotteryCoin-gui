import BigNumber from 'bignumber.js';

import Unit from '../constants/Unit';

import lotteryFormatter from './lotteryFormatter';

export default function mojoToCATLocaleString(mojo: string | number | BigNumber, locale?: string) {
  return lotteryFormatter(mojo, Unit.MOJO).to(Unit.CAT).toLocaleString(locale);
}
