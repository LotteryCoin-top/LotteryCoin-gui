import BigNumber from 'bignumber.js';
import React from 'react';

import useCurrencyCode from '../../hooks/useCurrencyCode';
import mojoToLottery from '../../utils/mojoToLotteryLocaleString';
import FormatLargeNumber from '../FormatLargeNumber';

export type MojoToLotteryProps = {
  value: number | BigNumber;
};

export default function MojoToLottery(props: MojoToLotteryProps) {
  const { value } = props;
  const currencyCode = useCurrencyCode();
  const updatedValue = mojoToLottery(value);

  return (
    <>
      <FormatLargeNumber value={updatedValue} />
      &nbsp;{currencyCode ?? ''}
    </>
  );
}
