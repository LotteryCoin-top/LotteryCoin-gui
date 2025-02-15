import { Address, Color, Flex, TooltipIcon } from '@lottery-network/core';
import { Trans } from '@lingui/macro';
import { alpha, Box, Typography } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

import usePlotNFTName from '../../hooks/usePlotNFTName';
import type PlotNFT from '../../types/PlotNFT';
import PlotNFTExternal from '../../types/PlotNFTExternal';

const StyledTitle = styled(Box)`
  font-size: 0.625rem;
  color: ${alpha(Color.Neutral[50], 0.7)};
`;

type Props = {
  nft: PlotNFT | PlotNFTExternal;
  variant?: string;
};

export default function PlotNFTName(props: Props) {
  const {
    variant = 'body1',
    nft,
    nft: {
      poolState: { p2SingletonPuzzleHash },
    },
  } = props;

  const humanName = usePlotNFTName(nft);

  return (
    <Flex gap={1} alignItems="center">
      <Typography variant={variant} noWrap>
        {humanName}
      </Typography>
      <TooltipIcon>
        <Flex flexDirection="column" gap={1}>
          <StyledTitle>
            <Trans>Autogenerated name from pool contract address</Trans>
          </StyledTitle>
          <Address value={p2SingletonPuzzleHash} copyToClipboard />
        </Flex>
      </TooltipIcon>
    </Flex>
  );
}
