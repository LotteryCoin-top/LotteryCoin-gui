import { useGetTotalHarvestersSummaryQuery } from '@lottery-network/api-react';
import { FormatLargeNumber, CardSimple } from '@lottery-network/core';
import { Trans } from '@lingui/macro';
import React from 'react';

export default function PlotCardPlotsDuplicate() {
  const { duplicates, initializedHarvesters, isLoading } = useGetTotalHarvestersSummaryQuery();

  return (
    <CardSimple
      title={<Trans>Duplicate Plots</Trans>}
      value={<FormatLargeNumber value={duplicates} />}
      loading={isLoading || !initializedHarvesters}
    />
  );
}
