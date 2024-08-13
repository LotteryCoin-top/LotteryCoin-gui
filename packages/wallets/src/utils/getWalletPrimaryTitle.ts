import { WalletType } from '@lottery-network/api';
import type { Wallet } from '@lottery-network/api';

export default function getWalletPrimaryTitle(wallet: Wallet): string {
  switch (wallet.type) {
    case WalletType.STANDARD_WALLET:
      return 'Lottery';
    default:
      return wallet.meta?.name ?? wallet.name;
  }
}
