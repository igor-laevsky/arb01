import {CommandParser} from "./abi/universal_router.js";

export interface SwapDescription {
    token_in: string,
    token_out: string,
    amount_in?: string,
    amount_out?: string,

    pool?: {
        version?: "v2" | "v3",
        fee?: number
    }
}

type Decoder = (calldata: string) => SwapDescription[];

const KNOWN_ROUTERS: { [key: string]: Decoder } = {
    // Uniswap universal router
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': (calldata: string) => {
        const parsed = CommandParser.parseCalldata(calldata);

        const swaps: SwapDescription[] = [];
        for (const command of parsed.commands) {
            switch (command.commandName) {
                case 'V3_SWAP_EXACT_OUT': {
                    const path = command.params[3].value;
                    swaps.push({
                        token_in: path[path.length - 1].tokenIn,
                        token_out: path[path.length - 1].tokenOut,
                        amount_in: undefined,
                        amount_out: command.params[1].value.toString(),
                        pool: {version: "v3", fee: path[path.length - 1].fee}
                    });
                    break;
                }
                case 'V2_SWAP_EXACT_OUT': {
                    const path = command.params[3].value;
                    swaps.push({
                        token_in: path[0],
                        token_out: path[1],
                        amount_in: undefined,
                        amount_out: command.params[1].value.toString(),
                        pool: {version: "v2"}
                    });
                    break;
                }
                case 'V3_SWAP_EXACT_IN': {
                    const path = command.params[3].value;
                    swaps.push({
                        token_in: path[0].tokenIn,
                        token_out: path[0].tokenOut,
                        amount_in: command.params[1].value.toString(),
                        amount_out: undefined,
                        pool: {version: "v3", fee: path[0].fee}
                    });
                    break;
                }
                case 'V2_SWAP_EXACT_IN': {
                    const path = command.params[3].value;
                    swaps.push({
                        token_in: path[0],
                        token_out: path[1],
                        amount_in: command.params[1].value.toString(),
                        amount_out: undefined,
                        pool: {version: "v2"}
                    });
                    break;
                }
            }
        }

        return swaps;
    },

    // // 1inch
    // '0x1111111254fb6c44bAC0beD2854e76F90643097d': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    // '0xe069CB01D06bA617bCDf789bf2ff0D5E5ca20C71': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    // '0x11111254369792b2Ca5d084aB5eEA397cA8fa48B': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    // '0x11111112542D85B3EF69AE05771c2dCCff4fAa26': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    // '0x111111125434b319222CdBf8C261674aDB56F3ae': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    // '0x111111125421cA6dc452d289314280a0f8842A65': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    // '0x1111111254EEB25477B68fb85Ed929f73A960582': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    //
    // // metamask swap router
    // '0x881D40237659C251811CEC9c364ef91dC08D300C': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    //
    // // paraswap p4
    // '0x1bD435F3C054b6e901B7b108a0ab7617C808677b': (calldata: string): SwapDescription[] | undefined => { return undefined; },
    //
    // // bananagun router v2
    // '0x3328F7f4A1D1C57c35df56bBf0c9dCAFCA309C49':  (calldata: string): SwapDescription[] | undefined => { return undefined; }
}

export function getAllKnownRouterAddresses(): string[] {
    return Object.keys(KNOWN_ROUTERS);
}

export function isKnownRouter(addr: string): boolean {
    return addr in KNOWN_ROUTERS;
}

export function decodeCalldata(
    addr_receiver: string, input: string): SwapDescription[] {

    let res = KNOWN_ROUTERS[addr_receiver]?.(input);
    if (!res)
        return [];

    for (let s of res) {
        s.token_in = s.token_in.toLowerCase();
        s.token_out = s.token_out.toLowerCase();
    }
    return res;
}
