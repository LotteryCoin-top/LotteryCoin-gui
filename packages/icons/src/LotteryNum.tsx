import React from 'react';

import Num01Icon from './images/lottery/num01.png';
import Num02Icon from './images/lottery/num02.png';
import Num03Icon from './images/lottery/num03.png';
import Num04Icon from './images/lottery/num04.png';
import Num05Icon from './images/lottery/num05.png';
import Num06Icon from './images/lottery/num06.png';
import Num07Icon from './images/lottery/num07.png';
import Num08Icon from './images/lottery/num08.png';
import Num09Icon from './images/lottery/num09.png';
import Num10Icon from './images/lottery/num10.png';
import Num11Icon from './images/lottery/num11.png';
import Num12Icon from './images/lottery/num12.png';
import Num13Icon from './images/lottery/num13.png';
import Num14Icon from './images/lottery/num14.png';
import Num15Icon from './images/lottery/num15.png';
import Num16Icon from './images/lottery/num16.png';

const NumIconList = [
  Num01Icon, Num02Icon, Num03Icon, Num04Icon, Num05Icon, Num06Icon, Num07Icon, Num08Icon,
  Num09Icon, Num10Icon, Num11Icon, Num12Icon, Num13Icon, Num14Icon, Num15Icon, Num16Icon
]

export type LotteryNumProps = {
  num: number
}

export default function LotteryNum(props: LotteryNumProps) {
  const {num, ...rest} = props
  return <img src={NumIconList[props.num - 1]}  {...rest} alt={`num${props.num}`} />;
}
