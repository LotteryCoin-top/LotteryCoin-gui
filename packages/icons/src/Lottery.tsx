import { SvgIcon, SvgIconProps } from '@mui/material';
import React from 'react';

import LotteryBlackIcon from './images/lottery-black.svg';
import LotteryIcon from './images/lottery.svg';

export default function Keys(props: SvgIconProps) {
  return <SvgIcon component={LotteryIcon} viewBox="0 0 168 168" {...props} />;
}

export function LotteryBlack(props: SvgIconProps) {
  return <SvgIcon component={LotteryBlackIcon} viewBox="0 0 168 168" sx={{ width: '100px', height: '100px' }} {...props} />;
}
