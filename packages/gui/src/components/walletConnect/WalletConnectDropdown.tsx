import { DropdownBase, Tooltip } from '@lottery-network/core';
import { WalletConnect } from '@lottery-network/icons';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import React from 'react';

import useWalletConnectContext from '../../hooks/useWalletConnectContext';

import WalletConnectConnections from './WalletConnectConnections';

export default function WalletConnectDropdown() {
  const { enabled, pairs, isLoading } = useWalletConnectContext();

  const ButtonStyle = {
    minWidth: 0,
    width: '40px',
    minHeight: '40px',
    borderRadius: '8px',
  };

  const color = enabled && !isLoading && pairs.get().length > 0 ? 'primary' : 'info';

  return (
    <DropdownBase>
      {({ onClose, onToggle }: { onClose: () => void; onToggle: () => void }) => [
        <Tooltip title={<Trans>WalletConnect</Trans>}>
          <Button key="button" onClick={onToggle} variant="text" color="secondary" size="small" sx={ButtonStyle}>
            <WalletConnect color={color} />
          </Button>
        </Tooltip>,
        <Box sx={{ minWidth: 360 }}>
          <WalletConnectConnections onClose={onClose} />
        </Box>,
      ]}
    </DropdownBase>
  );
}
