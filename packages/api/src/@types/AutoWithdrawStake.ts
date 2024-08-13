import type BigNumber from 'bignumber.js';

type AutoWithdrawStake = {
  enabled: boolean;
  txFee: number | BigNumber;
  batchSize: number;
};

export default AutoWithdrawStake;
