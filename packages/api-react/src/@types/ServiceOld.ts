import type { Daemon, Events, Farmer, FullNode, Harvester, PlotterService, WalletService } from '@lottery-network/api';

type Service =
  | typeof Daemon
  | typeof Events
  | typeof Farmer
  | typeof FullNode
  | typeof Harvester
  | typeof PlotterService
  | typeof WalletService;

export default Service;
