import {
  StakeValue,
} from '@lottery-network/api';
import {
  useGetSyncStatusQuery,
  useSendStakeMutation,
} from '@lottery-network/api-react';
import {
  Amount,
  ButtonLoading,
  EstimatedFee,
  FeeTxType,
  Form,
  Flex,
  Card,
  useOpenDialog,
  lotteryToMojo,
  mojoToLottery,
  getTransactionResult,
  Select,
  TooltipIcon,
} from '@lottery-network/core';
import { Trans, t } from '@lingui/macro';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Typography,
} from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import isNumeric from 'validator/es/lib/isNumeric';

import useWallet from '../../hooks/useWallet';
import AddressBookAutocomplete from "../AddressBookAutocomplete";
import CreateWalletSendTransactionResultDialog from '../WalletSendTransactionResultDialog';

type SendCardProps = {
  walletId: number;
  stakeMin: number;
  stakeList: StakeValue[];
};

type SendTransactionData = {
  address: string;
  amount: string;
  fee: string;
  stakeType: number;
};

export default function StakeSend(props: SendCardProps) {
  const { walletId, stakeMin , stakeList} = props;
  const [submissionCount, setSubmissionCount] = React.useState(0);
  const openDialog = useOpenDialog();
  const [sendStake, { isLoading: isStakeSendLoading }] = useSendStakeMutation();
  const [, setSearchParams] = useSearchParams();
  const methods = useForm<SendTransactionData>({
    defaultValues: {
      address: '',
      amount: '',
      fee: '',
      stakeType: 0,
    },
  });


  const {watch, formState: { isSubmitting }} = methods;

  const { data: walletState, isLoading: isWalletSyncLoading } = useGetSyncStatusQuery(
    {},
    {
      pollingInterval: 10_000,
    }
  );

  const { wallet } = useWallet(walletId);

  if (!wallet || isWalletSyncLoading) {
    return null;
  }

  const syncing = !!walletState?.syncing;

  function stakeDisplayName(val: StakeValue): string {
    return ` ${val.timeLock/86_400} ${t`days`} (${val.coefficient})`;
  }

  async function handleSubmit(data: SendTransactionData) {
    if (isStakeSendLoading) {
      return;
    }

    if (syncing) {
      throw new Error(t`Please finish syncing before making a transaction`);
    }

    const amount = data.amount.trim();
    if (!isNumeric(amount)) {
      throw new Error(t`Please enter a valid numeric amount`);
    }
    if (Number(amount)%1 !== 0) {
      throw new Error(t`Please enter an integer amount`);
    }
    const amountMojo = lotteryToMojo(amount);
    if (amountMojo < stakeMin) {
      throw new Error(t`stake min ${mojoToLottery(stakeMin)}`);
    }
    const fee = data.fee.trim() || '0';
    if (!isNumeric(fee)) {
      throw new Error(t`Please enter a valid numeric fee`);
    }

    const address = data.address.trim();
    const {stakeType} = data;

    const queryData = {
      walletId,
      stakeType,
      address,
      amount: amountMojo,
      fee: lotteryToMojo(fee),
      waitForConfirmation: true,
    };
    const response = await sendStake(queryData).unwrap();

    const result = getTransactionResult(response.transaction);
    const resultDialog = CreateWalletSendTransactionResultDialog({
      success: result.success,
      message: result.message,
    });

    if (resultDialog) {
      await openDialog(resultDialog);
    } else {
      throw new Error(result.message ?? 'Something went wrong');
    }

    methods.reset();
    // Workaround to force a re-render of the form. Without this, the fee field will not be cleared.
    setSubmissionCount((prev: number) => prev + 1);

    setSearchParams({ selectedTab: 'summary' });
  }

  return (
    <Form methods={methods} key={submissionCount} onSubmit={handleSubmit}>
      <Flex gap={2} flexDirection="column">
        <Typography variant="h6">
          <Trans>Create Stake Lock</Trans>
          &nbsp;
          <TooltipIcon>
            <Trans>
              On average there is one minute between each transaction block. Unless there is congestion you can expect
              your transaction to be included in less than a minute.
            </Trans>
          </TooltipIcon>
        </Typography>
        <Card>
        <Grid spacing={2} container>
          <Grid xs={12} item>
              <AddressBookAutocomplete
                name="address"
                getType="address"
                freeSolo
                variant="filled"
                required
                disabled={isSubmitting}
              />
            </Grid>
            <Grid xs={12} md={4} item>
              <FormControl variant="filled" fullWidth>
                <InputLabel required focused>
                   <Trans>Lock Period</Trans>
                </InputLabel>
                {stakeList.length && (
                 <Select name="stakeType" disabled={isSubmitting}>
                    {stakeList.map((val, index) => (
                      <MenuItem value={index} key={val.timeLock}>
                        {stakeDisplayName(val)}
                      </MenuItem>
                    ))}
                  </Select>
                  )}
              </FormControl>
            </Grid>
            <Grid xs={12} md={4} item>
              <Amount
                id="filled-secondary"
                variant="filled"
                name="amount"
                color="secondary"
                disabled={isSubmitting}
                label={<Trans>Amount</Trans>}
                data-testid="WalletStakeSend-amount"
                required
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={4} item>
              <EstimatedFee
                id="filled-secondary"
                variant="filled"
                name="fee"
                color="secondary"
                disabled={isSubmitting}
                label={<Trans>Fee</Trans>}
                data-testid="WalletStakeSend-fee"
                fullWidth
                txType={FeeTxType.walletSendLOT}
              />
            </Grid>
          </Grid>
        </Card>
        <Flex justifyContent="flex-end" gap={1}>
          <ButtonLoading
            variant="contained"
            color="primary"
            type="submit"
            loading={isStakeSendLoading}
            data-testid="WalletStakeSend-send"
          >
            <Trans>Send</Trans>
          </ButtonLoading>
        </Flex>
      </Flex>
    </Form>
  );
}
