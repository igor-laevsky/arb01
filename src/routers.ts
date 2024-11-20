import {BigNumber, Utils} from "alchemy-sdk";
import {
    ABI_DEFINITION,
    CommandType, extractPathFromV3,
    UNIVERSAL_ROUTER_ABI
} from "./abi/universal_router";
import { defaultAbiCoder } from "@ethersproject/abi"
import { assert } from "./utils";

export interface SwapDescription {
    token_from: string,
    token_to: string,
    amount_to: string,
    amount_from: string
}

type Decoder = (calldata: string) => SwapDescription[] | undefined;

const KNOWN_ROUTERS: { [key: string]: Decoder } = {
    // Uniswap universal router
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': (calldata: string) => {
        const decoded = new Utils.Interface(UNIVERSAL_ROUTER_ABI)
            .parseTransaction({data: calldata});

        if (decoded.name != 'execute')
            return undefined;

        const swaps: SwapDescription[] = [];
        const byte_commands = Utils.arrayify(decoded.args['commands']);
        for (let i = 0; i < byte_commands.length; ++i) {
            const real_command = byte_commands[i] & ((1 << 6) - 1);
            // unknown command
            if (!(real_command in ABI_DEFINITION)) {
                console.log("This is weird");
                continue;
            }
            const args = defaultAbiCoder.decode(
                ABI_DEFINITION[real_command], decoded.args['inputs'][i]);

            //console.log(real_command);
            // this can be multi-hop swap but only interested in entry and exit
            switch (real_command) {
                case CommandType.V3_SWAP_EXACT_IN: {
                    const path = extractPathFromV3(args[3]);
                    assert(path.length >= 4);
                    swaps.push({
                        token_from: path[0],
                        token_to: path[path.length - 2],
                        amount_from: args[1].toHexString(),
                        amount_to: '0x0'
                    })
                    break;
                }
                case CommandType.V3_SWAP_EXACT_OUT: {
                    const path = extractPathFromV3(args[3]);
                    assert(path.length >= 4);
                    swaps.push({
                        token_from: path[path.length - 2],
                        token_to: path[0],
                        amount_from: '0x0',
                        amount_to: args[1].toHexString()
                    })
                    break;
                }
                case CommandType.V2_SWAP_EXACT_OUT:
                    swaps.push({
                        token_from: args[3][0],
                        token_to: args[3][args[3].length - 1],
                        amount_from: '0x0',
                        amount_to: args[1].toHexString(),
                    });
                    break;
                case CommandType.V2_SWAP_EXACT_IN:
                    swaps.push({
                        token_from: args[3][0],
                        token_to: args[3][args[3].length - 1],
                        amount_from: args[1].toHexString(),
                        amount_to: '0x0'
                    });
                    break;
                default:
                    break;
            }
        }

        return swaps;
    },

    // 1inch
    '0x1111111254fb6c44bAC0beD2854e76F90643097d': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    '0xe069CB01D06bA617bCDf789bf2ff0D5E5ca20C71': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    '0x11111254369792b2Ca5d084aB5eEA397cA8fa48B': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    '0x11111112542D85B3EF69AE05771c2dCCff4fAa26': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    '0x111111125434b319222CdBf8C261674aDB56F3ae': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    '0x111111125421cA6dc452d289314280a0f8842A65': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    '0x1111111254EEB25477B68fb85Ed929f73A960582': (calldata: string): SwapDescription[] | undefined => { return undefined; },

    // metamask swap router
    '0x881D40237659C251811CEC9c364ef91dC08D300C': (calldata: string): SwapDescription[] | undefined => { return undefined; },

    // paraswap p4
    '0x1bD435F3C054b6e901B7b108a0ab7617C808677b': (calldata: string): SwapDescription[] | undefined => { return undefined; },

    // bananagun router v2
    '0x3328F7f4A1D1C57c35df56bBf0c9dCAFCA309C49':  (calldata: string): SwapDescription[] | undefined => { return undefined; }
}

export function getAllKnownRouterAddresses(): string[] {
    return Object.keys(KNOWN_ROUTERS);
}

export function isKnownRouter(addr: string): boolean {
    return addr in KNOWN_ROUTERS;
}

export function decodeCalldata(
    addr_receiver: string, input: string): SwapDescription[] | undefined {

    let res = KNOWN_ROUTERS[addr_receiver]?.(input);
    if (!res || res.length == 0)
        return undefined;

    for (let s of res) {
        for (let key in s) {
            s[key] = s[key].toLowerCase();
        }
    }
    return res;
}
