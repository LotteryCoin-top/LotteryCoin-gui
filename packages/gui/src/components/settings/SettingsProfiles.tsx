import { WalletType } from '@lottery-network/api';
import { useGetWalletsQuery } from '@lottery-network/api-react';
import { Flex, SettingsHR, SettingsSection, SettingsText } from '@lottery-network/core';
import { Trans } from '@lingui/macro';
import { Grid } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import IdentitiesPanel from './IdentitiesPanel';
import ProfileAdd from './ProfileAdd';
import ProfileView from './ProfileView';

export default function SettingsProfiles() {
  const navigate = useNavigate();
  const { data: wallets, isLoading } = useGetWalletsQuery();
  const [profileStartDisplay, setProfileStartDisplay] = useState(true);

  const didList = useMemo(() => {
    const dids: number[] = [];
    if (wallets) {
      wallets.forEach((wallet) => {
        if (wallet.type === WalletType.DECENTRALIZED_ID) {
          dids.push(wallet.id);
        }
      });
    }
    setProfileStartDisplay(true);
    return dids;
  }, [wallets]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (profileStartDisplay) {
      if (didList.length) {
        navigate(`/dashboard/settings/profiles/${didList[0]}`);
      } else {
        navigate(`/dashboard/settings/profiles/add`);
      }
      setProfileStartDisplay(false);
    }
  }, [isLoading, profileStartDisplay, didList, navigate]);

  return (
    <Grid container style={{ maxWidth: '928px' }} gap={3}>
      <Grid item>
        <Flex flexDirection="column" gap={1}>
          <SettingsSection>
            <Trans>Profiles (DIDs)</Trans>
          </SettingsSection>
          <SettingsText>
            <Trans>
              A profile is a decentralized identifier (DID) that you can prove control and ownership of without having
              to rely on any centralized authority.
            </Trans>
          </SettingsText>
        </Flex>
      </Grid>

      <Grid item xs={12} sm={12} lg={12}>
        <SettingsHR />
      </Grid>

      <Grid item xs={12} sm={12} lg={12}>
        <Flex flexDirection="row" gap={2}>
          <IdentitiesPanel />
          <Flex flexDirection="column" flexGrow={1}>
            <Routes>
              <Route path=":walletId" element={<ProfileView />} />
              <Route path="add" element={<ProfileAdd />} />
            </Routes>
          </Flex>
        </Flex>
      </Grid>
    </Grid>
  );
}
