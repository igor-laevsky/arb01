import {assert, expect, test} from 'vitest'
import {decodeCalldata} from "../src/routers";

test('uniswap universal router v2 exact in', () => {
    // V2_SWAP_EXACT_IN (txid 0x25c0698f3cd26511fbdeee7cde5b956da7a2f5c76eee5efa8530013c7d7ec10e)
    let res = decodeCalldata(
        '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        '0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006738ddd900000000000000000000000000000000000000000000000000000000000000040a08060c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000016000000000000000000000000014fee680690900ba0cccfc76ad70fd1b95d10e16000000000000000000000000ffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000676063b700000000000000000000000000000000000000000000000000000000000000000000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad000000000000000000000000000000000000000000000000000000006738ddbf00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000041726e07ca9549078e0ba66d51c647200ec5b687474eb06f92ffa4d90a592e4b313d89aa6b39c732e349a4a5c45b78d46ba9a9676ca5b6f0ce4bcf1698e563e6ff1c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000550bec2f37d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000014fee680690900ba0cccfc76ad70fd1b95d10e16000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000000060000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000fee13a103a10d593b9ae06b3e05f2e7e1c000000000000000000000000000000000000000000000000000000000000001900000000000000000000000000000000000000000000000000000000000000400000000000000000000000001b906dad530d3df5e8f405538cc5bb52be2b118d000000000000000000000000000000000000000000000000037b6d628d870d140c');

    assert(res !== undefined);
    expect(res.length).eq(1);
    expect(res[0]).toEqual({
        token_in: '0x14fee680690900ba0cccfc76ad70fd1b95d10e16',
        token_out: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        amount_in: '0x0550BEC2F37D'.toLowerCase(),
        amount_out: '0x0'
    });
});

test('uniswap universal router v3 exact in', () => {
    // V3_SWAP_EXACT_IN (txid 0x51530678c50744538be500a653428749771c1283ffefdc8359dfe7a341716c63)
    const res = decodeCalldata(
        '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        '0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006738fbf2000000000000000000000000000000000000000000000000000000000000000300060400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000003b9aca00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000042dac17f958d2ee523a2206206994597c13d831ec7000064c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb87ce89243cc0d9e746609c57845eccbd9bb4b731500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000007ce89243cc0d9e746609c57845eccbd9bb4b7315000000000000000000000000000000fee13a103a10d593b9ae06b3e05f2e7e1c000000000000000000000000000000000000000000000000000000000000001900000000000000000000000000000000000000000000000000000000000000600000000000000000000000007ce89243cc0d9e746609c57845eccbd9bb4b73150000000000000000000000000ba0936d77ed1232ef5b34dc67dd341277715c8500000000000000000000000000000000000000000000007ee8b05faebc784ba20c');

    assert(res !== undefined);
    expect(res.length).eq(1);
    expect(res[0]).toEqual({
        token_in: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        token_out: '0x7ce89243cc0d9e746609c57845eccbd9bb4b7315',
        amount_in: '0x3b9aca00',
        amount_out: '0x0'
    });
});

test('uniswap universal router v2 exact out', () => {
    // V2_SWAP_EXACT_OUT (txid 0xf1383ff7af7cfd4143085f10a679184e52304045029fbb9e6e1a7a7775c28615)
    const res = decodeCalldata(
        '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        '0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006739089100000000000000000000000000000000000000000000000000000000000000050b0905040c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002a000000000000000000000000000000000000000000000000000000000000003200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000ef4dc3a6979661000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000014e39cf213cb8000000000000000000000000000000000000000000000000000ef4dc3a697966100000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000069babe9811cc86dcfc3b8f9a14de6470dd18eda4000000000000000000000000000000000000000000000000000000000000006000000000000000000000000069babe9811cc86dcfc3b8f9a14de6470dd18eda4000000000000000000000000000000fee13a103a10d593b9ae06b3e05f2e7e1c00000000000000000000000000000000000000000000000000000d55f0015380000000000000000000000000000000000000000000000000000000000000006000000000000000000000000069babe9811cc86dcfc3b8f9a14de6470dd18eda4000000000000000000000000b248d7d9401dc9d6bc58f3b5917d67769ffc3bef0000000000000000000000000000000000000000000000000014d647021278000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000b248d7d9401dc9d6bc58f3b5917d67769ffc3bef00000000000000000000000000000000000000000000000000000000000000000c');

    assert(res !== undefined);
    expect(res.length).eq(1);
    expect(res[0]).toEqual({
        token_in: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        token_out: '0x69babe9811cc86dcfc3b8f9a14de6470dd18eda4',
        amount_in: '0x0',
        amount_out: '0x14e39cf213cb80'
    });
});

test('uniswap universal router v3 exact out', () => {
    // V3_SWAP_EXACT_OUT (txid 0xcecd841fcd7979acc53041906d364d0ed253df77bb5ee4f2b028231833685392)
    const res = decodeCalldata(
        '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        '0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000673a44c000000000000000000000000000000000000000000000000000000000000000050b0105040c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000005ae3c8a459414bdd0000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000004ab12b8800000000000000000000000000000000000000000000000005ae3c8a459414bdd00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bdac17f958d2ee523a2206206994597c13d831ec70001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000000000fee13a103a10d593b9ae06b3e05f2e7e1c0000000000000000000000000000000000000000000000000000000002faf0800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000749b9ea92056420b7e635eabae3d48f2d9b4d49700000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000749b9ea92056420b7e635eabae3d48f2d9b4d49700000000000000000000000000000000000000000000000000000000000000000c');

    assert(res !== undefined);
    expect(res.length).eq(1);
    expect(res[0]).toEqual({
        token_in: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        token_out: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        amount_in: '0x0',
        amount_out: '0x04ab12b880'
    });
});