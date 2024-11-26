import {Alchemy, AlchemySubscription, Network} from "alchemy-sdk";
import {decodeCalldata, getAllKnownRouterAddresses} from "./routers";
import {expect} from "vitest";

const settings = {
  apiKey: "***REMOVED***",
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

alchemy.ws.on(
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
    console.log("\n\n\n\n>>>>>New transaction", res.hash);

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

    // Estimate price impact of each swap


    // Estimate price on binance
}
