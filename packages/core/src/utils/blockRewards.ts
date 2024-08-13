import BigNumber from 'bignumber.js';

const MOJO_PER_LOTTERY = new BigNumber('1000000000');
const POOL_REWARD = '0.875'; // 7 / 8
const FARMER_REWARD = '0.125'; // 1 /8
const REWARD_PER_VALUE: Array<[number, [number, number, number]]> = [
  [6_000_000, [1, 5, 4]],
  [12_000_000, [0.5, 2.5, 1.5]],
  [18_000_000, [0.25, 1.25, 0.75]],
  [24_000_000, [0.125, 0.625, 0.375]],
  [50_000_000, [0.0625, 0.3125, 0.1875]],
];

export function calculateReward(height: number, group: number, index: number = 0): number {
  if (height > 50_000_000) {
    return [0.0625, 0.3125, 0.1875][group]
  }
  const [heightPer, rewardPer] = REWARD_PER_VALUE[index]
  return height < heightPer ? rewardPer[group] : calculateReward(height, group, index + 1);
}

export function calculatePoolReward(height: number): BigNumber {
  if (height === 0) {
    return MOJO_PER_LOTTERY.times(50_000_000).times(POOL_REWARD)
  }
  return MOJO_PER_LOTTERY.times(calculateReward(height, 0)).times(POOL_REWARD);
}

export function calculateBaseFarmerReward(height: number): BigNumber {
  if (height === 0) {
    return MOJO_PER_LOTTERY.times(50_000_000).times(FARMER_REWARD)
  }
  return MOJO_PER_LOTTERY.times(calculateReward(height, 0)).times(FARMER_REWARD);
}

export function calculateLotteryBonus(height: number): BigNumber {
  if (height === 0) {
    return MOJO_PER_LOTTERY.times(30_000_000)
  }
  if (height % 1000) {
    return MOJO_PER_LOTTERY.times(calculateReward(height, 1) * 1000);
  }
  return MOJO_PER_LOTTERY.times(0);
}
