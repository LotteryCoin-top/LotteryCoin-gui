import { WalletType } from '@lottery-network/api';
import { useGetWalletBalanceQuery } from '@lottery-network/api-react';
import { mojoToCATLocaleString, mojoToLotteryLocaleString, useLocale } from '@lottery-network/core';
import { useWallet } from '@lottery-network/wallets';
import { Trans } from '@lingui/macro';
import React, { useMemo } from 'react';

export type OfferBuilderWalletBalanceProps = {
  walletId: number;
};

export default function OfferBuilderWalletBalance(props: OfferBuilderWalletBalanceProps) {
  const { walletId } = props;
  const [locale] = useLocale();
  const { data: walletBalance, isLoading: isLoadingWalletBalance } = useGetWalletBalanceQuery({
    walletId,
  });

  const { unit, wallet, loading } = useWallet(walletId);

  const isLoading = isLoadingWalletBalance || loading;

  const lotBalance = useMemo(() => {
    if (isLoading || !wallet || !walletBalance || !('spendableBalance' in walletBalance)) {
      return undefined;
    }

    if (wallet.type === WalletType.STANDARD_WALLET) {
      return mojoToLotteryLocaleString(walletBalance.spendableBalance, locale);
    }

    if ([WalletType.CAT, WalletType.CRCAT].includes(wallet.type)) {
      return mojoToCATLocaleString(walletBalance.spendableBalance, locale);
    }

    return undefined;
  }, [isLoading, wallet, walletBalance, locale]);

  if (!isLoading && lotBalance === undefined) {
    return null;
  }

  return (
    <Trans>
      Spendable Balance:{' '}
      {isLoading ? (
        'Loading...'
      ) : (
        <>
          {lotBalance}
          &nbsp;
          {unit?.toUpperCase()}
        </>
      )}
    </Trans>
  );
}
