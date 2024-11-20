import {Alchemy, AlchemySubscription, Network} from "alchemy-sdk";
import {decodeCalldata, getAllKnownRouterAddresses} from "./routers";
import { Tenderly, Network as TenderlyNetwork } from '@tenderly/sdk';
import axios from 'axios';

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

const tenderly = new Tenderly({
  accessKey: 'aDcl02woP0zlU4hXrEaCQIPU7V7NDU7C',
  accountName: 'igmyrj',
  projectName: 'test',
  network: TenderlyNetwork.MAINNET,
});

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
    console.log("\n\n\n\n>>>>>New transaction")
    console.log(res);

    // Tanderly simulation
    const simulation = await axios.post(
        `https://mainnet.gateway.tenderly.co/5XUsylSD8lnwM0meFknXr5`,
        {
            id: 0,
            jsonrpc: "2.0",
            method: "tenderly_simulateTransaction",
            params: [
                {
                    from: res.from,
                    to: res.to,
                    data: res.input,
                    value: res.value
                },
                "latest"
            ]
        }
    );

    console.log(simulation.data);
    console.log(simulation.data.result?.trace);
    console.log(simulation.data.result?.stateChanges);

    // Manual simulation
    // const descr = decodeCalldata(res.to, res.input);
    // console.log(descr);
}
