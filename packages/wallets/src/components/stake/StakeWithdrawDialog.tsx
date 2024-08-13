import {
  useGetAutoWithdrawStakeQuery,
  useSetAutoWithdrawStakeMutation,
  useSpendWithdrawCoinsMutation,
  useGetSyncStatusQuery,
} from '@lottery-network/api-react';
import {
  AlertDialog,
  Button,
  Form,
  ButtonLoading,
  Color,
  EstimatedFee,
  FeeTxType,
  useCurrencyCode,
  mojoToLottery,
  FormatLargeNumber,
  truncateValue,
  CopyToClipboard,
  Flex,
  lotteryToMojo,
  Checkbox,
  useOpenDialog,
} from '@lottery-network/core';
import {t, Trans} from '@lingui/macro';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import isNumeric from "validator/es/lib/isNumeric";

type FormData = {
  fee: string;
  shouldEnableAutoWithdraw: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  coinId: string;
  amountInMojo: number;
  address: string;
};

export default function StakeWithdrawDialog(props: Props) {
  const { onClose, open, coinId, amountInMojo, address } = props;
  const [setAutoWithdraw] = useSetAutoWithdrawStakeMutation();
  const [spendWithdrawCoins] = useSpendWithdrawCoinsMutation();
  const { data: autoWithdrawData, isLoading: isGetAutoWithdrawLoading } = useGetAutoWithdrawStakeQuery();
  const openDialog = useOpenDialog();

  const isAutoWithdrawEnabled = autoWithdrawData?.enabled;
  const autoWithdrawFee = autoWithdrawData?.txFee ? mojoToLottery(autoWithdrawData.txFee) : 0;

  const currencyCode = useCurrencyCode();
  const methods = useForm<FormData>({
    defaultValues: { fee: '', shouldEnableAutoWithdraw: false },
  });

  const shouldEnableAutoWithdrawValue = useWatch({
    control: methods.control,
    name: 'shouldEnableAutoWithdraw',
  });

  const feeValue = useWatch({
    control: methods.control,
    name: 'fee',
  });

  const { data: walletState, isLoading: isWalletSyncLoading } = useGetSyncStatusQuery(undefined, {
    pollingInterval: 10_000,
  });
  const isSyncing = isWalletSyncLoading || !!walletState?.syncing;
  const isSynced = !isSyncing && walletState?.synced;

  const { isSubmitting } = methods.formState;

  // The fee from EstimatedFee is a string
  const canSubmit = isSynced && !isSubmitting && !isGetAutoWithdrawLoading && feeValue !== '';

  function handleClose() {
    methods.reset();
    onClose();
  }

  function handleDialogClose(event: any, reason: any) {
    if (reason !== 'backdropClick' || reason !== 'EscapeKeyDown') {
      onClose();
    }
  }

  async function handleSubmit(values: FormData) {
    const { fee, shouldEnableAutoWithdraw } = values;
    if (!isNumeric(fee)) {
      throw new Error(t`Please enter a valid numeric fee`);
    }
    const feeInMojos = lotteryToMojo(fee);
    const response = await spendWithdrawCoins({ coinIds: [coinId], fee: feeInMojos }).unwrap();
    if (response.transactionIds.length === 0) {
      throw new Error('No transaction ids returned');
    }

    if (shouldEnableAutoWithdraw && feeInMojos > 0) {
      // do not error on this secondary action
      try {
        await setAutoWithdraw({
          enabled: true,
          txFee: feeInMojos,
          batchSize: 50,
        }).unwrap();
      } catch (e) {
        console.error('Error setting auto claim: ', e);
      }
    }

    onClose();
    openDialog(
      <AlertDialog title="">
        <Trans>Stake Lock Withdrawal</Trans>
      </AlertDialog>
    );
  }

  return (
    <Dialog onClose={handleDialogClose} maxWidth="lg" aria-labelledby="confirmation-dialog-title" open={open}>
      <DialogTitle id="confirmation-dialog-title" sx={{ minWidth: '550px' }}>
        <Trans>Stake Lock Transaction</Trans>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => (theme.palette.mode === 'dark' ? Color.Neutral[400] : Color.Neutral[500]),
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {isGetAutoWithdrawLoading && (
        <>
          <DialogContent dividers>
            <Typography variant="body1">Loading...</Typography>
          </DialogContent>{' '}
          <DialogActions>
            <Button autoFocus onClick={handleClose} color="secondary">
              <Trans>Close</Trans>
            </Button>
          </DialogActions>
        </>
      )}
      {!isGetAutoWithdrawLoading && (
        <Form methods={methods} onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Flex gap={2} flexDirection="column" sx={{ textAlign: 'center', alignItems: 'center' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5">
                  <FormatLargeNumber value={mojoToLottery(amountInMojo)} />{' '}
                  <Box
                    component="span"
                    sx={{ color: (theme) => (theme.palette.mode === 'dark' ? Color.Neutral[400] : Color.Neutral[500]) }}
                  >
                    {currencyCode}
                  </Box>
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  <Box
                    component="span"
                    sx={{ color: (theme) => (theme.palette.mode === 'dark' ? Color.Neutral[400] : Color.Neutral[500]) }}
                  >
                    <Trans>To:</Trans>{' '}
                  </Box>
                  <Tooltip
                    title={
                      <Flex flexDirection="column" gap={1}>
                        <Flex flexDirection="row" alignItems="center" gap={1}>
                          <Box maxWidth={200}>{address}</Box>
                          <CopyToClipboard value={address} fontSize="small" />
                        </Flex>
                      </Flex>
                    }
                  >
                    <span>{truncateValue(address, {})}</span>
                  </Tooltip>
                </Typography>
              </Box>
              {isAutoWithdrawEnabled && (
                <Alert severity="info" sx={{ marginBottom: 3 }}>
                  <Trans>This transaction will be automatically withdraw with a fee:</Trans>{' '}
                  {`${autoWithdrawFee} ${currencyCode}`}
                </Alert>
              )}

              {!isSynced && (
                <Alert severity="info" sx={{ marginBottom: 3 }}>
                  <Trans>Wallet needs to be synced for withdraw</Trans>
                </Alert>
              )}

              <Typography variant="body1">
                  <Trans>Please enter a transaction fee to withdraw the above amount:</Trans>
              </Typography>

              <EstimatedFee
                variant="filled"
                name="fee"
                color="secondary"
                fullWidth
                sx={{ width: '300px', textAlign: 'left' }}
                txType={FeeTxType.walletSendLOT}
              />
            </Flex>
          </DialogContent>
          {!isAutoWithdrawEnabled && feeValue && feeValue > 0 && (
            <DialogContent dividers>
              <FormControlLabel
                control={<Checkbox name="shouldEnableAutoWithdraw" />}
                label={<Trans>Auto-withdraw transactions with this fee from now on. </Trans>}
              />
              {shouldEnableAutoWithdrawValue && (
                <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                  <ul>
                    <li>
                      <Trans>Transactions will be Withdraw  automatically when the Stake time expires.</Trans>
                    </li>
                    <li>
                      <Trans>Transactions with values smaller than the fee will not be auto withdraw.</Trans>
                    </li>
                    <li>
                      <Trans>You can change the auto withdraw fee in Settings.</Trans>
                    </li>
                  </ul>
                </Typography>
              )}
            </DialogContent>
          )}

          <DialogActions>
            <Button autoFocus onClick={handleClose} color="secondary">
              <Trans>Close</Trans>
            </Button>

            <ButtonLoading
              type="submit"
              disabled={!canSubmit}
              loading={isSubmitting}
              variant="contained"
              color="primary"
              disableElevation
            >
              <Trans>Withdraw</Trans>
            </ButtonLoading>
          </DialogActions>
        </Form>
      )}
    </Dialog>
  );
}
