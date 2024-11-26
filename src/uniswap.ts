import * as a from "alchemy-sdk";
import * as us from "@uniswap/v3-sdk";
import {SwapDescription} from "./routers";
import {computePoolAddress} from "@uniswap/v3-sdk";
import * as v2 from "@uniswap/v2-sdk";
import * as v3 from "@uniswap/v3-sdk";
import * as uc from "@uniswap/sdk-core";
import {ethers} from "ethers";
import {assert} from "./utils";
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import V3PoolAbi from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'

const V2_FACTORY = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
const V3_FACTORY = '0x1f98431c8ad98523631ae4a59f267346ea31f984'
const V3_QUOTER = '0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6'

async function getUniswapToken(addr: string, client: a.Alchemy) {
    const meta = await client.core.getTokenMetadata(addr);
    if (!meta.symbol || !meta.decimals)
        throw new Error(`Meta for token is incomplete ${addr}`);

    return new uc.Token(
        1, addr, meta.decimals, meta.symbol, meta.name ?? undefined);
}

// Input tokens must be sorted, output array is also sorted in the same way
async function getV2PairReserves(
    token_a: uc.Token, token_b: uc.Token, client: a.Alchemy) {

    assert(token_a.sortsBefore(token_b));

    const pair_addr = v2.computePairAddress({
        factoryAddress: V2_FACTORY,
        tokenA: token_a,
        tokenB: token_b
    }).toLowerCase();

    const v2_pair_contract = new ethers.Contract(
        pair_addr,
        ["function getReserves() public view returns (uint112,uint112,uint32)"],
        // @ts-ignore
        await client.config.getProvider());

    const reserves = await v2_pair_contract.getReserves();
    return [reserves[0], reserves[1]];
}

async function getV2PriceImpact(
    token_in: uc.Token, token_out: uc.Token,
    swap: SwapDescription, client: a.Alchemy) {

    const [token_a, token_b] = token_in.sortsBefore(token_out) ?
        [token_in, token_out] : [token_out, token_in];

    const reserves = await getV2PairReserves(token_a, token_b, client);

    const v2_pair = new v2.Pair(
        uc.CurrencyAmount.fromRawAmount(token_a, reserves[0].toString()),
        uc.CurrencyAmount.fromRawAmount(token_b, reserves[1].toString()));

    const price_before = v2_pair.priceOf(token_in);

    const actual_amount_in = (() => {
        if (swap.amount_in != '0x0')
            return uc.CurrencyAmount.fromRawAmount(token_in, swap.amount_in);

        assert(swap.amount_out != '0x0'); // need at least some amount
        return v2_pair.getInputAmount(
            uc.CurrencyAmount.fromRawAmount(token_out, swap.amount_out))[0];
    })();

    const actual_amount_out = (() => {
        if (swap.amount_out != '0x0')
            return uc.CurrencyAmount.fromRawAmount(token_out, swap.amount_out);

        assert(swap.amount_in != '0x0'); // need at least some amount
        return v2_pair.getOutputAmount(
            uc.CurrencyAmount.fromRawAmount(token_in, swap.amount_in))[0];
    })();

    return uc.computePriceImpact(
        price_before,
        actual_amount_in,
        actual_amount_out);
}

async function getV3PriceImpact(
    token_in: uc.Token, token_out: uc.Token, fee: v3.FeeAmount,
    swap: SwapDescription, client: a.Alchemy) {

    const pool_addr = v3.computePoolAddress({
        factoryAddress: V3_FACTORY,
        tokenA: token_in,
        tokenB: token_out,
        fee
    });

    const pool_contract = new a.Contract(
        pool_addr, V3PoolAbi.abi,
        // @ts-ignore
        await client.config.getProvider());

    const slot0 = await pool_contract.slot0();
    // only used to simplify starting price computation
    const pool = new v3.Pool(
        token_in, token_out, fee,
        slot0.sqrtPriceX96.toString(), '0', Number(slot0.tick));

    const quoter_contract = new a.Contract(
        V3_QUOTER, Quoter.abi,
        // @ts-ignore
        await client.config.getProvider());

    const price_before = pool.priceOf(token_in);

    const actual_amount_in = await (async () => {
        if (swap.amount_in != '0x0')
            return uc.CurrencyAmount.fromRawAmount(token_in, swap.amount_in);

        assert(swap.amount_out != '0x0'); // need at least some amount
        const quoted_amount_in = await quoter_contract.callStatic.quoteExactOutputSingle(
            token_in.address,
            token_out.address,
            fee,
            swap.amount_out,
            0);

        return uc.CurrencyAmount.fromRawAmount(token_in, quoted_amount_in);
    })();

    const actual_amount_out = await (async () => {
        if (swap.amount_out != '0x0')
            return uc.CurrencyAmount.fromRawAmount(token_out, swap.amount_out);

        assert(swap.amount_in != '0x0'); // need at least some amount
        const quoted_amount_out = await quoter_contract.callStatic.quoteExactInputSingle(
            token_in.address,
            token_out.address,
            fee,
            swap.amount_in,
            0);

        return uc.CurrencyAmount.fromRawAmount(token_out, quoted_amount_out);
    })();

    return uc.computePriceImpact(
        price_before,
        actual_amount_in,
        actual_amount_out);
}

// Returns pair [min price impact, max price impact]
export async function estimatePriceImpact(
    swap: SwapDescription, client: a.Alchemy): Promise<[number, number]> {

    const token_in = await getUniswapToken(swap.token_in, client);
    const token_out = await getUniswapToken(swap.token_out, client);

    return [1, 1];
}

export const _for_testing = {
    getV2PairReserves, getUniswapToken,
    getV2PriceImpact, getV3PriceImpact
}
