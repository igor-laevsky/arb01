import 'dotenv/config'

import {Alchemy, AlchemySubscription, Network} from "alchemy-sdk";
import {decodeCalldata, getAllKnownRouterAddresses} from "./routers.js";
import {estimatePriceImpact, getTokenMeta} from "./uniswap.js";
// @ts-ignore
import {binance} from 'ccxt';

const b = new binance();
const markets = await b.fetchMarkets();

const avaliable_currencies = new Set(
    markets.flatMap((m) => [m?.base, m?.quote]));
avaliable_currencies.add('WETH');
avaliable_currencies.add('WBTC');

const settings = {
  apiKey: process.env.ALCHEMY_KEY,
  network: Network.ETH_MAINNET,
};

const client = new Alchemy(settings);

client.ws.on(
    {
        method: AlchemySubscription.PENDING_TRANSACTIONS,
        toAddress: getAllKnownRouterAddresses()
    },
    (res) => new_transaction_received(res)
);

interface Transaction {
    hash: string,
    from: string,
    to: string,
    value: string,
    input: string,
    gas: string,
    gasPrice: string,
    maxFeePerGas: string,
    maxPriorityFeePerGas: string,
}

async function new_transaction_received(res: Transaction) {
    console.log("\n\n\nNew transaction", res.hash);

    const swaps = (() => {
        try {
            return decodeCalldata(res.to, res.input);
        } catch (err: any) {
            console.error(`Failed while decoding calldata ${err}`);
            console.error(err.stack);
            return [];
        }
    })();

    if (swaps.length === 0) {
        console.warn("We didn't decode any swaps from the router, skipping the transaction");
        return;
    }

    for (const swap of swaps) {
        console.log("Transaction: ", res.hash);
        console.log(swap);

        const token_in_meta = await getTokenMeta(swap.token_in, client);
        const token_out_meta = await getTokenMeta(swap.token_out, client);
        if (!avaliable_currencies.has(token_in_meta.symbol)) {
            console.warn(`Currency ${token_in_meta.symbol} is not on binance`);
            continue;
        }
        if (!avaliable_currencies.has(token_out_meta.symbol)) {
            console.warn(`Currency ${token_out_meta.symbol} is not on binance`);
            continue;
        }

        const start = performance.now();
        const impact = await (async () => {
            try {
                return await estimatePriceImpact(swap, client);
            } catch (err: any) {
                console.error(`Failed while estimating price impact ${err}`);
                console.error(err.stack);
                return 0;
            }
        })();
        const end = performance.now();

        console.log(`Estimated price impact ${impact} in ${end - start}ms`);
        if (impact >= 5.0) {
            throw Error("Detected large price change!");
        }
    }

    // Estimate price impact of each swap


    // Estimate price on binance
}
