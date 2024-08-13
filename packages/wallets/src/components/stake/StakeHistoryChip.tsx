import {toBech32m, Transaction} from '@lottery-network/api';
import {useGetTimestampForHeightQuery, useGetHeightInfoQuery, useGetAutoWithdrawStakeQuery} from '@lottery-network/api-react';
import { useTrans, Button } from '@lottery-network/core';
import { defineMessage } from '@lingui/macro';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';
import moment from 'moment';
import React from 'react';

type Props = {
  transactionRow: Transaction;
  feeUnit: string;
  setStakeWithdrawDialogProps: (props: object) => void;
};

export default function StakeHistoryChip(props: Props) {
  const { transactionRow, feeUnit, setStakeWithdrawDialogProps } = props;

  const { data: autoWithdrawData, isLoading: isGetAutoWithdrawLoading } = useGetAutoWithdrawStakeQuery();
  const isAutoWithdrawEnabled = !isGetAutoWithdrawLoading && autoWithdrawData?.enabled;

  const { data: height, isLoading: isGetHeightInfoLoading } = useGetHeightInfoQuery(undefined, {
    pollingInterval: 3000,
  });

  const { data: lastBlockTimeStampData, isLoading: isGetTimestampForHeightLoading } = useGetTimestampForHeightQuery({
    height: height || 0,
  });

  const lastBlockTimeStamp = lastBlockTimeStampData?.timestamp || 0;

  const t = useTrans();

  if (isGetHeightInfoLoading || isGetTimestampForHeightLoading || !lastBlockTimeStamp) return null;

  let text = '';
  let Icon;
  let onClick;
  let color = '';
  const canBeWithdrawAt = moment(transactionRow.createdAtTime * 1000);
  if (transactionRow.metadata?.timeLock) {
    canBeWithdrawAt.add(transactionRow.metadata.timeLock, 'seconds');
  }
  const currentTime = moment.unix(lastBlockTimeStamp - 20);
  // extra 20 seconds so if the auto withdraw stake is enabled, it will not show to button to withdraw it
  // console.log('currentTime___: ', currentTime.format());
  // console.log('canBeWithdrawAt: ', canBeWithdrawAt.format());

  const timeLeft = canBeWithdrawAt.diff(currentTime, 'seconds');
  // const address = transactionRow.metadata?.recipientPuzzleHash;

  if (timeLeft > 0) {
    color = timeLeft < 86_400 ? 'warning' : 'default';
    Icon = <AccessTimeIcon />;
    text = t(defineMessage({message: 'Lock in '}))+canBeWithdrawAt.from(currentTime, true); // ... 3 days
  } else if (transactionRow.sent === 0) {
    const address = toBech32m(transactionRow.metadata?.recipientPuzzleHash??'', feeUnit)
    color = 'success';
    text = isAutoWithdrawEnabled
      ? t(
          defineMessage({
            message: 'Will be auto withdraw',
          })
        )
      : t(
          defineMessage({
            message: 'Can be withdraw',
          })
        );
    onClick = () =>
      setStakeWithdrawDialogProps({
        coinId: transactionRow.metadata?.coinId,
        amountInMojo: transactionRow.amount,
        address,
      });
  } else {
    color = 'primary';
    Icon = <AccessTimeIcon />;
    text = t(
      defineMessage({
        message: 'Withdrawing...',
      })
    );
  }

  if (onClick) {
    return (
      <Button variant="outlined" color="primary" onClick={onClick} size="small">
        {text}
      </Button>
    );
  }
  return (
    <Chip
      size="small"
      variant="outlined"
      color={color}
      icon={Icon}
      label={<>{text}</>}
    />
  );
}
