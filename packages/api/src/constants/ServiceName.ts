const ServiceName = {
  WALLET: 'lottery_wallet',
  FULL_NODE: 'lottery_full_node',
  FARMER: 'lottery_farmer',
  HARVESTER: 'lottery_harvester',
  SIMULATOR: 'lottery_full_node_simulator',
  DAEMON: 'daemon',
  PLOTTER: 'chia_plotter',
  TIMELORD: 'lottery_timelord',
  INTRODUCER: 'lottery_introducer',
  EVENTS: 'wallet_ui',
  DATALAYER: 'lottery_data_layer',
  DATALAYER_SERVER: 'lottery_data_layer_http',
} as const;

type ObjectValues<T> = T[keyof T];

export type ServiceNameValue = ObjectValues<typeof ServiceName>;

export default ServiceName;
