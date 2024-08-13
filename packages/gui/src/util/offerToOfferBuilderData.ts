import { OfferSummaryRecord, type OfferSummaryCATInfo } from '@lottery-network/api';
import { mojoToCAT, mojoToLottery } from '@lottery-network/core';
import BigNumber from 'bignumber.js';

import type OfferBuilderData from '../@types/OfferBuilderData';
import type OfferSummary from '../@types/OfferSummary';

import { launcherIdToNFTId } from './nfts';

export default function offerToOfferBuilderData(
  offerSummary: OfferSummary | OfferSummaryRecord,
  setDefaultOfferedFee?: boolean,
  defaultFee?: string, // in mojos
): OfferBuilderData {
  const { fees, offered, requested, infos } = offerSummary;

  const defaultFeeLOT = defaultFee ? mojoToLottery(defaultFee).toFixed() : '';

  const offeredLot: OfferBuilderData['offered']['lot'] = [];
  const offeredTokens: OfferBuilderData['offered']['tokens'] = [];
  const offeredNfts: OfferBuilderData['offered']['nfts'] = [];
  const offeredFee: OfferBuilderData['offered']['fee'] = setDefaultOfferedFee ? [{ amount: defaultFeeLOT }] : [];
  const requestedLot: OfferBuilderData['requested']['lot'] = [];
  const requestedTokens: OfferBuilderData['requested']['tokens'] = [];
  const requestedNfts: OfferBuilderData['requested']['nfts'] = [];

  // processing requested first because it's what you/we will give

  Object.keys(requested).forEach((id) => {
    const amount = new BigNumber(requested[id]);
    const info = infos[id];

    if (info?.type === 'CAT') {
      const crCat = extractCrCatData(info);
      offeredTokens.push({
        amount: mojoToCAT(amount).toFixed(),
        assetId: id,
        crCat,
      });
    } else if (info?.type === 'singleton') {
      offeredNfts.push({
        nftId: launcherIdToNFTId(info.launcherId),
      });
    } else if (id === 'lot') {
      offeredLot.push({
        amount: mojoToLottery(amount).toFixed(),
      });
    }
  });

  Object.keys(offered).forEach((id) => {
    const amount = new BigNumber(offered[id]);
    const info = infos[id];

    if (info?.type === 'CAT') {
      const crCat = extractCrCatData(info);
      requestedTokens.push({
        amount: mojoToCAT(amount).toFixed(),
        assetId: id,
        crCat,
      });
    } else if (info?.type === 'singleton') {
      requestedNfts.push({
        nftId: launcherIdToNFTId(info.launcherId),
      });
    } else if (id === 'lot') {
      requestedLot.push({
        amount: mojoToLottery(amount).toFixed(),
      });
    }
  });

  return {
    offered: {
      lot: offeredLot,
      tokens: offeredTokens,
      nfts: offeredNfts,
      fee: offeredFee,
    },
    requested: {
      lot: requestedLot,
      tokens: requestedTokens,
      nfts: requestedNfts,
      fee: [
        {
          amount: mojoToLottery(fees).toFixed(),
        },
      ],
    },
  };
}

function extractCrCatData(info: OfferSummaryCATInfo) {
  if (!info.also) return undefined;
  if (info.also.type !== 'credential restricted') return undefined;
  const { flags, authorizedProviders } = info.also;
  return {
    flags,
    authorizedProviders,
  };
}
