import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const port = 3000;
const app = express();

const WEI_IN_ETH = 1000000000000000000;
const API_URL = 'https://api.etherscan.io/api';

app.get('/search', (req, res) => {
  console.log(req);
  const walletAddress = req.query.walletAddress;
  res.redirect(`/${walletAddress}`);
});

app.get('/:walletAddress', async (req, res) => {
  let balanceInEth = undefined;
  const transactions = [];
  const walletAddress = req.params.walletAddress;
  
  // balance
  try {
    const result = await axios.get(API_URL, {
      params: {
        module: 'account',
        action: 'balance',
        address: walletAddress,
        tag: 'latest',
        apikey: process.env.ETHERSCAN_API_KEY,
      },
    });
    const balanceInWei = result.data.result;
    balanceInEth = balanceInWei / WEI_IN_ETH;
  } catch (error) {
    console.error('Failed to make request:', JSON.stringify(error.message));
  }

  // transactions
  try {
    const result = await axios.get(API_URL, {
      params: {
        module: 'account',
        action: 'txlist',
        address: walletAddress,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 10,
        sort: 'desc',
        apikey: process.env.ETHERSCAN_API_KEY,
      },
    }); 
    transactions.push(...result.data.result);
  } catch (error) {
    console.error('Failed to make request:', JSON.stringify(error.message));
  }

  console.log(transactions[0]);

  if (balanceInEth && !transactions.empty) {
    res.render('index.ejs', {
      address: walletAddress,
      balance: balanceInEth,
      txs: transactions,
    });
  }
});

app.get('/', (req, res) => {
  res.render('index.ejs', {
    name: 'Dan',
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
