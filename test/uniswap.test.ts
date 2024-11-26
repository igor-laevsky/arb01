import {assert, expect, test} from 'vitest'
import {Alchemy, Network} from "alchemy-sdk";
import * as v3 from "@uniswap/v3-sdk";

import {_for_testing, estimatePriceImpact} from "../src/uniswap";
const { getUniswapToken, getV2PairReserves, getV2PriceImpact, getV3PriceImpact } = _for_testing;

test('should get correct v2 pair reserves', async () => {
    const settings = {
      apiKey: "***REMOVED***",
      network: Network.ETH_MAINNET,
    };
    const client = new Alchemy(settings);
    const token_in = await getUniswapToken(
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', client);
    const token_out = await getUniswapToken(
        '0x69babe9811cc86dcfc3b8f9a14de6470dd18eda4', client);

    // Wrong token order
    await expect(getV2PairReserves(token_in, token_out, client)).rejects.toThrow(Error);

    const reserves = await getV2PairReserves(token_out, token_in, client);

    expect(reserves.length).to.eq(2);
    expect(reserves[0]).to.gt(0);
    expect(reserves[1]).to.gt(0);
});

test('should get v2 price impact', async () => {
    const settings = {
      apiKey: "***REMOVED***",
      network: Network.ETH_MAINNET,
    };
    const client = new Alchemy(settings);
    const token_in = await getUniswapToken(
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', client);
    const token_out = await getUniswapToken(
        '0x69babe9811cc86dcfc3b8f9a14de6470dd18eda4', client);

    const impact1 = await getV2PriceImpact(
        token_in, token_out,
        {
            token_in: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            token_out: '0x69babe9811cc86dcfc3b8f9a14de6470dd18eda4',
            amount_in: '0x4563918244F40000',
            amount_out: '0x0'
        },
        client);

    const impact2 = await getV2PriceImpact(
        token_in, token_out,
        {
            token_in: '0x69babe9811cc86dcfc3b8f9a14de6470dd18eda4',
            token_out: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            amount_in: '0x0',
            amount_out: '0x4563918244F40000'
        },
        client);

    expect(parseFloat(impact1.toSignificant(10))).to.gt(1);
    expect(parseFloat(impact2.toSignificant(10))).to.gt(1);
});

test('should get v3 price impact', async () => {
    const settings = {
      apiKey: "***REMOVED***",
      network: Network.ETH_MAINNET,
    };
    const client = new Alchemy(settings);
    const token_in = await getUniswapToken(
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', client);
    const token_out = await getUniswapToken(
        '0xdac17f958d2ee523a2206206994597c13d831ec7', client);

    const impact1 = await getV3PriceImpact(
        token_in, token_out, v3.FeeAmount.MEDIUM,
        {
            token_in: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            token_out: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            amount_in: '0x0',
            amount_out: '20050000000'
        },
        client);
    expect(parseFloat(impact1.toSignificant(10))).to.gt(0);

    const impact2 = await getV3PriceImpact(
        token_in, token_out, v3.FeeAmount.MEDIUM,
        {
            token_in: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            token_out: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            amount_in: '1000000000000000000000', // 1000 eth
            amount_out: '0x0'
        },
        client);
    expect(parseFloat(impact2.toSignificant(10))).to.gt(0);
});
