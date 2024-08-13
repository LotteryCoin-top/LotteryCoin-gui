import defaultsForPlotter from '../utils/defaultsForPlotter';
import optionsForPlotter from '../utils/optionsForPlotter';

import PlotterName from './PlotterName';

export default {
  displayName: 'Lottery Proof of Space',
  options: optionsForPlotter(PlotterName.LOTTERYPOS),
  defaults: defaultsForPlotter(PlotterName.LOTTERYPOS),
  installInfo: { installed: true },
};
