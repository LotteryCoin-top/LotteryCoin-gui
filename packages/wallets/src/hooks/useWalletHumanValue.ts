import type { Wallet } from '@lottery-network/api';
import { WalletType } from '@lottery-network/api';
import { mojoToCATLocaleString, mojoToLotteryLocaleString, useLocale } from '@lottery-network/core';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

export default function useWalletHumanValue(
  wallet: Wallet,
  value?: string | number | BigNumber,
  unit?: string,
): string {
  const [locale] = useLocale();

  return useMemo(() => {
    if (wallet && value !== undefined) {
      const localisedValue = [WalletType.CAT, WalletType.CRCAT].includes(wallet.type)
        ? mojoToCATLocaleString(value, locale)
        : mojoToLotteryLocaleString(value, locale);

      return `${localisedValue} ${unit}`;
    }

    return '';
  }, [wallet, value, unit, locale]);
}
