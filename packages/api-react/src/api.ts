import { createApi } from '@reduxjs/toolkit/query/react';

import baseQuery from './lotteryLazyBaseQuery';

export { baseQuery };

export default createApi({
  reducerPath: 'lotteryApi',
  baseQuery,
  endpoints: () => ({}),
});
