import { WalletService } from '@lottery-network/api';

import useSubscribeToEvent from './useSubscribeToEvent';

export default function useNFTCoinRemoved(callback: (coin: any) => void) {
  return useSubscribeToEvent('onNFTCoinRemoved', WalletService, callback);
}
