import { TransactionType, TransactionTypeFilterMode, toBech32m } from '@lottery-network/api';
import {
  useGetSyncStatusQuery,
} from '@lottery-network/api-react';
import {
  AddressBookContext,
  Button,
  Card,
  CopyToClipboard,
  Flex,
  TableControlled,
  useCurrencyCode,
  mojoToLottery,
  FormatLargeNumber,
  truncateValue,
} from '@lottery-network/core';
import type { Row } from '@lottery-network/core';
import { Trans } from '@lingui/macro';
import {
  Box, Chip,
  Tooltip,
  Typography,
} from '@mui/material';
import moment from 'moment';
import React, { useContext, useMemo } from 'react';

import useWallet from '../../hooks/useWallet';
import useWalletTransactions from '../../hooks/useWalletTransactions';
import LotteryNum from "@lottery-network/icons/src/LotteryNum";
import type {Shell} from "electron";

const getCols = () => [
  {
    field: (row: Row, metadata) => {
      return (
        <>
          <strong>
            <FormatLargeNumber
              value={mojoToLottery(row.amount)}
            />
          </strong>
          &nbsp;
          {metadata.unit}
        </>
      );
    },
    title: <Trans>Amount</Trans>,
  },
  {
    field: (row: Row, metadata) => {
      const numbers = metadata.memos[row.name]["v"];
      return (
        <Flex flexDirection="column">
          {numbers.map((nums, index) => (
            <Flex flexDirection="row" key={index}>
              {nums.map((num) => (
                <LotteryNum style={{width: '32px'}} num={num}/>
              ))}
            </Flex>
          ))}
        </Flex>
      );
    },
    title: <Trans>Pos Num</Trans>,
  },
  {
    field: (row: Row, metadata) => {

      const { name, confirmed: isConfirmed } = row;
      let displayAddress = truncateValue(row.toAddress, {});
      let awardAddress = metadata.memos[name]["W"] || "";
      let displayEmoji = null;
      let displayEmojiAward = null;
      if (awardAddress) {
        awardAddress = toBech32m(awardAddress, metadata.feeUnit);
      }
      let displayAddressAward = awardAddress ? truncateValue(awardAddress, {}) : "";

      if (metadata.matchList) {
        metadata.matchList.forEach((contact) => {
          if (contact.address === row.toAddress) {
            displayAddress = contact.displayName;
            displayEmoji = contact.emoji;
          }
        });
        if (awardAddress) {
          metadata.matchList.forEach((contact) => {
            if (contact.address === awardAddress) {
              displayAddressAward = contact.displayName;
              displayEmojiAward = contact.emoji;
            }
          });
        }
      }

      return (
        <Flex
          flexDirection="column"
          gap={1}
        >
          <div>
            <Typography color="textSecondary" variant="body2">
              {moment(row.createdAtTime * 1000).format('LLL')}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" component="span">
              <Trans>Guess Address: </Trans>
            </Typography>
            <Tooltip
              title={
                <Flex flexDirection="column" gap={1}>
                  <Flex flexDirection="row" alignItems="center" gap={1}>
                    <Box maxWidth={200}>{row.toAddress}</Box>
                    <CopyToClipboard value={row.toAddress} fontSize="small"/>
                  </Flex>
                </Flex>
              }
            >
              <span>
                {displayEmoji} {displayAddress}
              </span>
            </Tooltip>
          </div>
          {awardAddress && <div>
            <Typography variant="caption" component="span">
              <Trans>Award Address: </Trans>
            </Typography>
            <Tooltip
              title={
                <Flex flexDirection="column" gap={1}>
                  <Flex flexDirection="row" alignItems="center" gap={1}>
                    <Box maxWidth={200}>{awardAddress}</Box>
                    <CopyToClipboard value={awardAddress} fontSize="small"/>
                  </Flex>
                </Flex>
              }
            >
              <span>
                {displayEmojiAward} {displayAddressAward}
              </span>
            </Tooltip>
          </div>
          }
          <div>
            <Typography variant="caption" component="span">
              <Trans>Multiple: </Trans>
            </Typography>
            <span>{metadata.memos[row.name]["m"]}</span>
          </div>
        </Flex>
      );
    },
    title: <Trans>Creation Date</Trans>,
  },
  {
    field: (row: Row, metadata) => (
      <Flex
        flexDirection="column"
        gap={1}
      >
        {row.confirmed ? (
          <>
          <div>
            <Typography variant="caption" component="span">
              <Trans>Issue: </Trans>
            </Typography>
            <span>{parseInt((row.confirmedAtHeight - 1)/1000, 10) + 1}</span>
          </div>
          <div>
            <Typography variant="caption" component="span">
              <Trans>Confirmed Height: </Trans>
            </Typography>
            <span>{row.confirmedAtHeight}</span>
          </div>
          </>
         ) : (
          <Flex gap={0.5}><Chip size="small" color="primary" variant="outlined" label={<Trans>Pending</Trans>}/></Flex>
        )}
        {metadata.memos[row.name]["B"] && (
          <div>
            <Typography variant="caption" component="span">
              <Trans>Win Bets:</Trans>
            </Typography>
            <Tooltip title="bet1/bet2/bet3">
              <span>{metadata.memos[row.name]["B"][0]}/{metadata.memos[row.name]["B"][1]}/{metadata.memos[row.name]["B"][2]}</span>
            </Tooltip>
          </div>
        )}
        {metadata.memos[row.name]["N"] && (
          <div>
            {metadata.memos[row.name]["N"].map((num) => (
              <LotteryNum style={{width: '24px'}} num={num}/>
            ))}
          </div>
        )}
      </Flex>
    ),
    title: <Trans>Status</Trans>,
    forceWrap: true,
  },
];

type Props = {
  walletId: number;
};

export default function GuessHistory(props: Props) {
  const { walletId } = props;

  const { data: walletState, isLoading: isWalletSyncLoading } = useGetSyncStatusQuery(undefined, {
    pollingInterval: 10_000,
  });
  const { wallet, loading: isWalletLoading, unit } = useWallet(walletId);

  const {
    transactions,
    isLoading: isWalletTransactionsLoading,
    page,
    rowsPerPage,
    count,
    pageChange,
  } = useWalletTransactions({
    walletId,
    defaultRowsPerPage: 10,
    defaultPage: 0,
    sortKey: 'RELEVANCE',
    reverse: false,
    // confirmed: true,
    typeFilter: {
      mode: TransactionTypeFilterMode.INCLUDE,
      values: [
        TransactionType.OUTGOING_GUESS,
      ],
    },
  });
  //console.log(transactions);

  const feeUnit = useCurrencyCode();

  const [, , , , , getContactByAddress] = useContext(AddressBookContext);

  const isLoading = isWalletTransactionsLoading || isWalletLoading;

  const contacts = useMemo(() => {
    if (!transactions || isWalletTransactionsLoading) {
      return [];
    }

    const contactList: { displayName: string; address: string }[] = [];

    (transactions ?? []).forEach((transaction) => {
      const match = getContactByAddress(transaction.toAddress);

      if (match) {
        match.addresses.forEach((addressInfo) => {
          if (transaction.toAddress === addressInfo.address) {
            const nameStr = JSON.stringify(match.name).slice(1, -1);
            const emojiStr = match.emoji ? match.emoji : '';
            const matchColor = (theme) => `${match.color ? theme.palette.colors[match.color].main : null}`;
            const addNameStr = JSON.stringify(addressInfo.name).slice(1, -1);
            const matchName = `${emojiStr} ${nameStr} | ${addNameStr}`;
            contactList.push({ displayName: matchName, address: addressInfo.address, color: matchColor });
          }
        });
      }
    });
    return contactList;
  }, [transactions, getContactByAddress, isWalletTransactionsLoading]);

    const memos = useMemo(() => {
    if (!transactions || isWalletTransactionsLoading) {
      return {};
    }

    const memosList: Object<string, Object> = {};

    (transactions ?? []).forEach((transaction) => {
      try {
        const memoValues = Object.values(transaction.memos);
        memosList[transaction.name] = JSON.parse(Buffer.from(memoValues[0], 'hex').toString('utf8'));
      } catch (e) {
        memosList[transaction.name]= {"v": []}
      }
    });
    return memosList;
  }, [transactions, isWalletTransactionsLoading]);

  const metadata = useMemo(() => {
    const matchList = contacts;

    return {
      unit,
      feeUnit,
      matchList,
      memos,
    };
  }, [unit, feeUnit, contacts, memos]);

  const cols = useMemo(() => {
    if (!wallet) {
      return [];
    }
    return getCols();
  }, [wallet]);


  async function handleGuessHistory() {
    try {
      const { shell } = window as unknown as { shell: Shell };
      await shell.openExternal('https://explorer.lotterycoin.top/lottery-issue');
    } catch (error: any) {
      console.log(error);
    }
  }

  return (
    <Card title={<Trans>Guess Transactions</Trans>} titleVariant="h6" action={<Button variant="outlined" color="primary" onClick={handleGuessHistory}><Trans>Guess History</Trans></Button>} transparent>
      <TableControlled
        cols={cols}
        rows={transactions ?? []}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        page={page}
        rowsPerPage={rowsPerPage}
        count={count}
        onPageChange={pageChange}
        isLoading={isLoading}
        metadata={metadata}
        expandedCellShift={1}
        uniqueField="name"
        caption={
          !transactions?.length && (
            <Typography variant="body2" align="center">
              <Trans>No previous transactions</Trans>
            </Typography>
          )
        }
        pages={!!transactions?.length}
      />
    </Card>
  );
}
