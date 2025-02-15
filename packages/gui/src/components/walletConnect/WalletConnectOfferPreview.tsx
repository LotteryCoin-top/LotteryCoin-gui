import { Button, Flex, useOpenDialog, lotteryToMojo } from '@lottery-network/core';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React from 'react';

import parseFee from '../../util/parseFee';
import OfferBuilderViewerDialog from '../offers2/OfferBuilderViewerDialog';

export type WalletConnectOfferPreviewProps = {
  value: string;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
};

export default function WalletConnectOfferPreview(props: WalletConnectOfferPreviewProps) {
  const { value: offer, values, onChange } = props;
  const openDialog = useOpenDialog();

  const fee = parseFee(values.fee);

  async function handleShowPreview() {
    const offerBuilderData = await openDialog(<OfferBuilderViewerDialog offer={offer} fee={fee} />);
    if (offerBuilderData) {
      // use new fee value
      const feeLottery = offerBuilderData.offered.fee?.[0]?.amount;
      if (feeLottery) {
        const feeMojos = feeLottery ? lotteryToMojo(feeLottery).toFixed() : '0';
        onChange({
          ...values,
          fee: feeMojos,
        });
      }
    }
  }

  // show offer value and button with offer details modal
  return (
    <Flex direction="column" gap={2}>
      <Typography noWrap>{offer}</Typography>
      <Flex>
        <Button variant="outlined" color="secondary" onClick={handleShowPreview}>
          <Trans>Show Offer Details</Trans>
        </Button>
      </Flex>
    </Flex>
  );
}
