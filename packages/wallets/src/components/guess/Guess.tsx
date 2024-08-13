import {number} from "@lingui/core";
import { Trans, t } from '@lingui/macro';
import {
  useSendGuessMutation,
} from '@lottery-network/api-react';
import {
  Amount,
  Button,
  ButtonLoading,
  CardSimple,
  Flex,
  Form,
  TextField,
  useOpenDialog,
  lotteryToMojo,
  getTransactionResult,
  useCurrencyCode,
  useShowError,
} from '@lottery-network/core';
import LotteryNum from "@lottery-network/icons/src/LotteryNum";
import {ButtonGroup, Chip, Grid, IconButton, InputAdornment} from '@mui/material';
import React from 'react';
import {useForm, useWatch} from 'react-hook-form';

import useWallet from "../../hooks/useWallet";
import CreateWalletSendTransactionResultDialog from "../WalletSendTransactionResultDialog";

import AddressBookAutocomplete from "../AddressBookAutocomplete";
import GuessHistory from "./GuessHistory";



type GuessProps = {
  walletId: number;
};


type SendGuessData = {
  awardAddress: string;
  type: number;
  multiple: number;
};


export default function Guess(props: GuessProps) {
  const { walletId } = props;
  const { wallet } = useWallet(walletId);
  const showError = useShowError();
  const openDialog = useOpenDialog();
  const currencyCode = useCurrencyCode();
  // const [, setSearchParams] = useSearchParams();
  const [randomAmount, setRandomAmount] = React.useState(1);
  const [submissionCount, setSubmissionCount] = React.useState(0);
  const [numbers, setNumbers] = React.useState<Array<number[]>>([[],[],[],[]])
  const [sendGuess, { isLoading: isSendGuessLoading }] = useSendGuessMutation();
  const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const btns = [
      { id: 'all', label: t`All`},
      { id: 'big', label: t`Big`},
      { id: 'small', label: t`Small`},
      { id: 'odd', label: t`Odd`},
      { id: 'even', label: t`Even`},
      { id: 'red', label: t`Red`},
      { id: 'blue', label: t`Blue`},
      { id: 'green', label: t`Green`},
      { id: 'clear', label: t`Clear`},
  ];


  const methods = useForm<SendGuessData>({
    defaultValues: {
      awardAddress: '',
      type: 0,
      multiple: 1,
    },
  });
  const {
    formState: { isSubmitting },
  } = methods;

  const multipleValue = useWatch({
    control: methods.control,
    name: 'multiple',
  });

  const totalBet = parseFloat(React.useMemo(() => (
   numbers.reduce((_amount, nums) => _amount * nums.length, 1) * multipleValue
  ), [numbers, multipleValue]).toFixed(3));

  if (!wallet) {
    return null;
  }

  const randomsGuessNumsPos: Object<string, number[][]> = {}
  for (let i = 1; i <= 16; i++){
    for (let j = 1; j <= 16; j++ ){
      for (let k = 1; k <= 16; k++ ){
        for (let l = 1; l <= 16; l++){
          const total = i * j * k * l
          if (!randomsGuessNumsPos[total]) {
            randomsGuessNumsPos[total] = []
          }
          randomsGuessNumsPos[total].push([i, j, k, l])
        }
      }
    }
  }

  const handleRandomAmount = (event) => {
    setRandomAmount(parseInt(event.target.value));
  };

  function handlePos(pos: number, num:number) {
    const newNumbers = [...numbers];
    let nums: number[] = [...new Set(numbers[pos])];
    const index = nums.indexOf(num);
    if (index !== -1) {
      nums.splice(index, 1);
    } else {
      nums.push(num);
      nums = nums.sort()
    }
    newNumbers[pos] = nums;
    setNumbers(newNumbers);
  }

  async function handleRandom(){
    if (randomAmount < 1 || randomAmount > 65_536) {
      return
    }
    const randomNumbers = allNumbers.slice();
    for (let amount = randomAmount; amount > 0; amount--) {
      if (randomsGuessNumsPos[amount]) {
        const randomKey = Math.floor(Math.random() * randomsGuessNumsPos[amount].length)
        const newNumbers:number[][] = [[],[],[],[]];
        const posNums = randomsGuessNumsPos[amount][randomKey];
        for (let i = 0; i < 4; i++) {
          randomNumbers.sort(() => 0.5 - Math.random());
          for (let j = 0; j < posNums[i]; j++) {
            newNumbers[i].push(randomNumbers[j]);
          }
        }
        setNumbers(newNumbers)
        break
      }
    }
  }

  function handleClear() {
    setNumbers([[],[],[],[]]);
  }

  function handleBtn(btn: string, pos:number) {
    const newNumbers = [...numbers];
    let nums: number[] = newNumbers[pos];
    if (btn === 'clear') {
      nums = [];
    } else if (btn === 'all') {
      nums = allNumbers;
    } else {
      let numsArr: number[] = [];
      switch(btn) {
        case 'big':
          numsArr = [9, 10, 11, 12, 13, 14, 15, 16];
          break;
        case 'small':
          numsArr = [1, 2, 3, 4, 5, 6, 7, 8];
          break;
        case 'odd':
          numsArr = [1, 3, 5, 7, 9, 11, 13, 15];
          break;
        case 'even':
          numsArr = [2, 4, 6, 8, 10, 12, 14, 16];
          break;
        case 'red':
          numsArr = [1, 2, 7, 8, 12, 13];
          break;
        case 'blue':
          numsArr = [3, 4, 9, 10, 14, 15];
          break;
        case 'green':
          numsArr = [5, 6, 11, 16];
          break;
        default:
            break
      }
      if (nums.reduce((acc, curr) => acc + (numsArr.indexOf(curr) > -1 ? 1 : 0), 0) === numsArr.length) {
        nums = nums.filter(item => numsArr.indexOf(item) === -1);
      } else {
        nums = nums.concat(numsArr.filter(item => nums.indexOf(item) === -1))
      }
    }
    newNumbers[pos] = nums
    setNumbers(newNumbers);
  }

  async function handleSubmit(data: SendGuessData) {
    if (isSendGuessLoading) {
      return;
    }
    for(let i = 0; i < numbers.length; i++) {
      const nums = numbers[i];
      if (nums.length === 0) {
        showError(new Error(t`Please select position ${i+1}`));
        return;
      }
      for (let j = 0; j < nums.length; j++) {
        if (allNumbers.indexOf(nums[j]) === -1) {
          showError(new Error(t`select position ${i+1} error`));
          return;
        }
      }
    }
    let { type, multiple, awardAddress } = data;
    if (awardAddress.startsWith('0x') || awardAddress.startsWith('0X')) {
      awardAddress = awardAddress.slice(2);
    }
    const response = await sendGuess({
      walletId,
      awardAddress,
      amount: lotteryToMojo(totalBet),
      data: JSON.stringify({t: type, v: numbers, m: multiple}),
      fee: lotteryToMojo(0.01),
      waitForConfirmation: true,
    }).unwrap();
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

    // setSearchParams({ selectedTab: 'summary' });
  }

  return (
    <Flex flexDirection="column" gap={4}>
      <Form methods={methods} key={submissionCount} onSubmit={handleSubmit}>
        <Flex flexDirection="column" gap={2}>
          <CardSimple
            title={<Trans>Guess Position</Trans>}
            tooltip={<Trans>Four betting positions from left to right</Trans>}
          >
          <Grid spacing={2} alignItems="stretch" container>
            {numbers.map((nums, index) => (
              <Grid xs={12} item>
                  <Flex flexDirection="row" gap={1}>
                    <Chip label={t`Position ${ index + 1}`} color="info" />
                    <ButtonGroup>
                    {btns.map((btn) => (
                      <Button color="primary" variant="outlined" onClick={() => handleBtn(btn.id, index)}>{btn.label}</Button>
                    ))}
                    </ButtonGroup>
                  </Flex>
                  { allNumbers.map((num) => (
                    <IconButton
                      onClick={() => handlePos(index, num)}
                      size="small">
                      <LotteryNum style={nums.indexOf(num) > -1?{width: '42px'}:{width: '42px',filter: 'brightness(0.5)'}} num={num}/>
                    </IconButton>
                  ))}
              </Grid>
            ))}
              <Grid xs={12} item>
                <Grid spacing={2} alignItems="stretch" container>
                  <Grid xs={12} md={4} item>
                    <TextField
                      name="multiple"
                      type="number"
                      InputProps={{
                        inputProps: {
                          min: 0.1,
                          step: 0.1,
                        },
                      }}
                      label={<Trans>Multiple Investment</Trans>}
                      disabled={isSubmitting}
                      data-testid="Guess-multiple"
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <Amount
                      name="amount"
                      value={totalBet}
                      label={<Trans>Amount</Trans>}
                      data-testid="Guess-amount"
                      readOnly
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <Trans>Total bets:</Trans>{totalBet}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardSimple>
          <Flex justifyContent="flex-end" gap={1}>
            <AddressBookAutocomplete
              name="awardAddress"
              getType="address"
              freeSolo
              variant="filled"
              disabled={isSubmitting}
            />
            <TextField
              name="random_amount"
              type="number"
              InputProps={{
                inputProps: {
                  min: 1,
                  max: 65_536,
                  step: 1,
                },
                endAdornment: <InputAdornment position="end">{currencyCode}</InputAdornment>,
              }}
              value={randomAmount}
              onChange={handleRandomAmount}
              label={<Trans>Random Amount</Trans>}
              data-testid="Guess-random-amount"
              style={{ minWidth: '180px' }}
            />
            <Button variant="outlined" color="primary" onClick={handleRandom}><Trans>Random</Trans></Button>
            <Button variant="outlined" color="primary" onClick={handleClear}><Trans>Clear</Trans></Button>
            <ButtonLoading
              variant="contained"
              color="primary"
              type="submit"
              loading={isSendGuessLoading}
              data-testid="Guess-Send"
            >
              <Trans>Guess</Trans>
            </ButtonLoading>
          </Flex>
        </Flex>
      </Form>
      <GuessHistory walletId={walletId} />
    </Flex>
  );
}
