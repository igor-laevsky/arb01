// Same as uniswap-sdk but for ethers v6

import { ethers } from 'ethers'
import abi from '@uniswap/universal-router/artifacts/contracts/UniversalRouter.sol/UniversalRouter.json' with {type: "json"};

/**
 * CommandTypes
 * @description Flags that modify a command's execution
 * @enum {number}
 */
export enum CommandType {
  V3_SWAP_EXACT_IN = 0x00,
  V3_SWAP_EXACT_OUT = 0x01,
  PERMIT2_TRANSFER_FROM = 0x02,
  PERMIT2_PERMIT_BATCH = 0x03,
  SWEEP = 0x04,
  TRANSFER = 0x05,
  PAY_PORTION = 0x06,

  V2_SWAP_EXACT_IN = 0x08,
  V2_SWAP_EXACT_OUT = 0x09,
  PERMIT2_PERMIT = 0x0a,
  WRAP_ETH = 0x0b,
  UNWRAP_WETH = 0x0c,
  PERMIT2_TRANSFER_FROM_BATCH = 0x0d,
  BALANCE_CHECK_ERC20 = 0x0e,

  V4_SWAP = 0x10,
  V3_POSITION_MANAGER_PERMIT = 0x11,
  V3_POSITION_MANAGER_CALL = 0x12,
  V4_INITIALIZE_POOL = 0x13,
  V4_POSITION_MANAGER_CALL = 0x14,

  EXECUTE_SUB_PLAN = 0x21,
}

export enum Subparser {
  V3PathExactIn,
  V3PathExactOut,
}

export enum Parser {
  Abi,
  V4Actions,
  V3Actions,
}

export type ParamType = {
  readonly name: string
  readonly type: string
  readonly subparser?: Subparser
}

export type CommandDefinition =
  | {
      parser: Parser.Abi
      params: ParamType[]
    }
  | {
      parser: Parser.V4Actions
    }
  | {
      parser: Parser.V3Actions
    }

const ALLOW_REVERT_FLAG = 0x80
const REVERTIBLE_COMMANDS = new Set<CommandType>([CommandType.EXECUTE_SUB_PLAN])

const PERMIT_STRUCT =
  '((address token,uint160 amount,uint48 expiration,uint48 nonce) details,address spender,uint256 sigDeadline)'

const PERMIT_BATCH_STRUCT =
  '((address token,uint160 amount,uint48 expiration,uint48 nonce)[] details,address spender,uint256 sigDeadline)'

const POOL_KEY_STRUCT = '(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks)'

const PERMIT2_TRANSFER_FROM_STRUCT = '(address from,address to,uint160 amount,address token)'
const PERMIT2_TRANSFER_FROM_BATCH_STRUCT = PERMIT2_TRANSFER_FROM_STRUCT + '[]'

export const COMMAND_DEFINITION: { [key in CommandType]: CommandDefinition } = {
  // Batch Reverts
  [CommandType.EXECUTE_SUB_PLAN]: {
    parser: Parser.Abi,
    params: [
      { name: 'commands', type: 'bytes' },
      { name: 'inputs', type: 'bytes[]' },
    ],
  },

  // Permit2 Actions
  [CommandType.PERMIT2_PERMIT]: {
    parser: Parser.Abi,
    params: [
      { name: 'permit', type: PERMIT_STRUCT },
      { name: 'signature', type: 'bytes' },
    ],
  },
  [CommandType.PERMIT2_PERMIT_BATCH]: {
    parser: Parser.Abi,
    params: [
      { name: 'permit', type: PERMIT_BATCH_STRUCT },
      { name: 'signature', type: 'bytes' },
    ],
  },
  [CommandType.PERMIT2_TRANSFER_FROM]: {
    parser: Parser.Abi,
    params: [
      { name: 'token', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint160' },
    ],
  },
  [CommandType.PERMIT2_TRANSFER_FROM_BATCH]: {
    parser: Parser.Abi,
    params: [
      {
        name: 'transferFrom',
        type: PERMIT2_TRANSFER_FROM_BATCH_STRUCT,
      },
    ],
  },

  // Uniswap Actions
  [CommandType.V3_SWAP_EXACT_IN]: {
    parser: Parser.Abi,
    params: [
      { name: 'recipient', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', subparser: Subparser.V3PathExactIn, type: 'bytes' },
      { name: 'payerIsUser', type: 'bool' },
    ],
  },
  [CommandType.V3_SWAP_EXACT_OUT]: {
    parser: Parser.Abi,
    params: [
      { name: 'recipient', type: 'address' },
      { name: 'amountOut', type: 'uint256' },
      { name: 'amountInMax', type: 'uint256' },
      { name: 'path', subparser: Subparser.V3PathExactOut, type: 'bytes' },
      { name: 'payerIsUser', type: 'bool' },
    ],
  },
  [CommandType.V2_SWAP_EXACT_IN]: {
    parser: Parser.Abi,
    params: [
      { name: 'recipient', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'payerIsUser', type: 'bool' },
    ],
  },
  [CommandType.V2_SWAP_EXACT_OUT]: {
    parser: Parser.Abi,
    params: [
      { name: 'recipient', type: 'address' },
      { name: 'amountOut', type: 'uint256' },
      { name: 'amountInMax', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'payerIsUser', type: 'bool' },
    ],
  },
  [CommandType.V4_SWAP]: { parser: Parser.V4Actions },

  // Token Actions and Checks
  [CommandType.WRAP_ETH]: {
    parser: Parser.Abi,
    params: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  [CommandType.UNWRAP_WETH]: {
    parser: Parser.Abi,
    params: [
      { name: 'recipient', type: 'address' },
      { name: 'amountMin', type: 'uint256' },
    ],
  },
  [CommandType.SWEEP]: {
    parser: Parser.Abi,
    params: [
      { name: 'token', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amountMin', type: 'uint256' },
    ],
  },
  [CommandType.TRANSFER]: {
    parser: Parser.Abi,
    params: [
      { name: 'token', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
  },
  [CommandType.PAY_PORTION]: {
    parser: Parser.Abi,
    params: [
      { name: 'token', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'bips', type: 'uint256' },
    ],
  },
  [CommandType.BALANCE_CHECK_ERC20]: {
    parser: Parser.Abi,
    params: [
      { name: 'owner', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'minBalance', type: 'uint256' },
    ],
  },
  [CommandType.V4_INITIALIZE_POOL]: {
    parser: Parser.Abi,
    params: [
      { name: 'poolKey', type: POOL_KEY_STRUCT },
      { name: 'sqrtPriceX96', type: 'uint160' },
    ],
  },

  // Position Actions
  [CommandType.V3_POSITION_MANAGER_PERMIT]: { parser: Parser.V3Actions },
  [CommandType.V3_POSITION_MANAGER_CALL]: { parser: Parser.V3Actions },
  [CommandType.V4_POSITION_MANAGER_CALL]: { parser: Parser.V4Actions },
}

export class RoutePlanner {
  commands: string
  inputs: string[]

  constructor() {
    this.commands = '0x'
    this.inputs = []
  }

  addSubPlan(subplan: RoutePlanner): RoutePlanner {
    this.addCommand(CommandType.EXECUTE_SUB_PLAN, [subplan.commands, subplan.inputs], true)
    return this
  }

  addCommand(type: CommandType, parameters: any[], allowRevert = false): RoutePlanner {
    let command = createCommand(type, parameters)
    this.inputs.push(command.encodedInput)
    if (allowRevert) {
      if (!REVERTIBLE_COMMANDS.has(command.type)) {
        throw new Error(`command type: ${command.type} cannot be allowed to revert`)
      }
      command.type = command.type | ALLOW_REVERT_FLAG
    }

    this.commands = this.commands.concat(command.type.toString(16).padStart(2, '0'))
    return this
  }
}

export type RouterCommand = {
  type: CommandType
  encodedInput: string
}

export function createCommand(type: CommandType, parameters: any[]): RouterCommand {
  const commandDef = COMMAND_DEFINITION[type]
  switch (commandDef.parser) {
    case Parser.Abi:
      const encodedInput = ethers.AbiCoder.defaultAbiCoder().encode(
        commandDef.params.map((abi) => abi.type),
        parameters
      )
      return { type, encodedInput }
    case Parser.V4Actions:
      // v4 swap data comes pre-encoded at index 0
      return { type, encodedInput: parameters[0] }
    case Parser.V3Actions:
      // v4 swap data comes pre-encoded at index 0
      return { type, encodedInput: parameters[0] }
  }
}

export type Param = {
  readonly name: string
  readonly value: any
}

export type UniversalRouterCommand = {
  readonly commandName: string
  readonly commandType: CommandType
  readonly params: readonly Param[]
}

export type UniversalRouterCall = {
  readonly commands: readonly UniversalRouterCommand[]
}

export type V3PathItem = {
  readonly tokenIn: string
  readonly tokenOut: string
  readonly fee: number
}

export interface CommandsDefinition {
  [key: number]: CommandDefinition
}

// Parses UniversalRouter V2 commands
export abstract class CommandParser {
  public static INTERFACE: ethers.Interface = new ethers.Interface(abi.abi);

  public static parseCalldata(calldata: string): UniversalRouterCall {
    const genericParser = new GenericCommandParser(COMMAND_DEFINITION)
    const txDescription = CommandParser.INTERFACE.parseTransaction({ data: calldata })
    // @ts-ignore
    const { commands, inputs } = txDescription.args
    return genericParser.parse(commands, inputs)
  }
}

// Parses commands based on given command definition
export class GenericCommandParser {
  constructor(private readonly commandDefinition: CommandsDefinition) {}

  public parse(commands: string, inputs: string[]): UniversalRouterCall {
    const commandTypes = GenericCommandParser.getCommands(commands)

    return {
      commands: commandTypes.map((commandType: CommandType, i: number) => {
        const commandDef = this.commandDefinition[commandType]

        if (commandDef.parser === Parser.V4Actions) {
          // @ts-ignore
          const { actions } = V4BaseActionsParser.parseCalldata(inputs[i])
          return {
            commandName: CommandType[commandType],
            commandType,
            params: v4RouterCallToParams(actions),
          }
        } else if (commandDef.parser === Parser.Abi) {
          const abiDef = commandDef.params
          const rawParams = ethers.AbiCoder.defaultAbiCoder().decode(
            abiDef.map((command) => command.type),
            inputs[i]
          )

          const params = rawParams.map((param: any, j: number) => {
            switch (abiDef[j].subparser) {
              case Subparser.V3PathExactIn:
                return {
                  name: abiDef[j].name,
                  value: parseV3PathExactIn(param),
                }
              case Subparser.V3PathExactOut:
                return {
                  name: abiDef[j].name,
                  value: parseV3PathExactOut(param),
                }
              default:
                return {
                  name: abiDef[j].name,
                  value: param,
                }
            }
          })
          return {
            commandName: CommandType[commandType],
            commandType,
            params,
          }
        } else if (commandDef.parser === Parser.V3Actions) {
          // TODO: implement better parsing here
          return {
            commandName: CommandType[commandType],
            commandType,
            params: inputs.map((input) => ({ name: 'command', value: input })),
          }
        } else {
          throw new Error(`Unsupported parser: ${commandDef}`)
        }
      }),
    }
  }

  // parse command types from bytes string
  private static getCommands(commands: string): CommandType[] {
    const commandTypes = []

    for (let i = 2; i < commands.length; i += 2) {
      const byte = commands.substring(i, i + 2)
      commandTypes.push(parseInt(byte, 16) as CommandType)
    }

    return commandTypes
  }
}

export function parseV3PathExactIn(path: string): readonly V3PathItem[] {
  const strippedPath = path.replace('0x', '')
  let tokenIn = ethers.getAddress(strippedPath.substring(0, 40))
  let loc = 40
  const res = []
  while (loc < strippedPath.length) {
    const feeAndTokenOut = strippedPath.substring(loc, loc + 46)
    const fee = parseInt(feeAndTokenOut.substring(0, 6), 16)
    const tokenOut = ethers.getAddress(feeAndTokenOut.substring(6, 46))

    res.push({
      tokenIn,
      tokenOut,
      fee,
    })
    tokenIn = tokenOut
    loc += 46
  }

  return res
}

export function parseV3PathExactOut(path: string): readonly V3PathItem[] {
  const strippedPath = path.replace('0x', '')
  let tokenIn = ethers.getAddress(strippedPath.substring(strippedPath.length - 40))
  let loc = strippedPath.length - 86 // 86 = (20 addr + 3 fee + 20 addr) * 2 (for hex characters)
  const res = []
  while (loc >= 0) {
    const feeAndTokenOut = strippedPath.substring(loc, loc + 46)
    const tokenOut = ethers.getAddress(feeAndTokenOut.substring(0, 40))
    const fee = parseInt(feeAndTokenOut.substring(40, 46), 16)

    res.push({
      tokenIn,
      tokenOut,
      fee,
    })
    tokenIn = tokenOut

    loc -= 46
  }

  return res
}

// @ts-ignore
function v4RouterCallToParams(actions: readonly V4RouterAction[]): readonly Param[] {
  return actions.map((action) => {
    return {
      name: action.actionName,
      // @ts-ignore
      value: action.params.map((param) => {
        return {
          name: param.name,
          value: param.value,
        }
      }),
    }
  })
}
