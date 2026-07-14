/* eslint-disable */
import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDRCLKLYCP6LXXV6GD2VQVNPUPKPNO5A5XKNEEL7TNKYCZCL7XXVDSYL",
  }
} as const


export interface Task {
  category: string;
  completed_at: u64;
  created_at: u64;
  deadline: u64;
  description: string;
  hours: u32;
  id: u64;
  provider: string;
  requester: string;
  status: TaskStatus;
  title: string;
}

export type DataKey = {tag: "Task", values: readonly [u64]} | {tag: "UserTasks", values: readonly [string]} | {tag: "Balance", values: readonly [string]} | {tag: "TotalMembers", values: void};

export type TaskStatus = {tag: "Open", values: void} | {tag: "Claimed", values: void} | {tag: "Submitted", values: void} | {tag: "Completed", values: void} | {tag: "Cancelled", values: void} | {tag: "Disputed", values: void};

export interface Client {
  /**
   * Construct and simulate a mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Admin mints initial TIME credits to bootstrap members
   */
  mint: ({admin, recipient, amount}: {admin: string, recipient: string, amount: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_task: ({task_id}: {task_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Task>>

  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a post_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Post a task offering TIME credits in exchange for help
   */
  post_task: ({requester, title, description, category, hours, deadline_offset}: {requester: string, title: string, description: string, category: string, hours: u32, deadline_offset: u64}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a claim_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Provider claims an open task
   */
  claim_task: ({provider, task_id}: {provider: string, task_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the time bank
   */
  initialize: ({admin, ledger_address}: {admin: string, ledger_address: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a cancel_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cancel an Open task — refund escrowed credits
   */
  cancel_task: ({requester, task_id}: {requester: string, task_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_balance: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Provider submits work for review
   */
  submit_work: ({provider, task_id}: {provider: string, task_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a dispute_task transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Raise a dispute on a Claimed or Submitted task
   */
  dispute_task: ({caller, task_id}: {caller: string, task_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_user_tasks transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_user_tasks: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Task>>>

  /**
   * Construct and simulate a get_total_tasks transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_total_tasks: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_total_supply transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_total_supply: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_total_members transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_total_members: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a confirm_completion transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Requester confirms work and releases TIME credits to provider
   */
  confirm_completion: ({requester, task_id}: {requester: string, task_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAADVBZG1pbiBtaW50cyBpbml0aWFsIFRJTUUgY3JlZGl0cyB0byBib290c3RyYXAgbWVtYmVycwAAAAAAAARtaW50AAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAYAAAAA",
        "AAAAAQAAAAAAAAAAAAAABFRhc2sAAAALAAAAAAAAAAhjYXRlZ29yeQAAABAAAAAAAAAADGNvbXBsZXRlZF9hdAAAAAYAAAAAAAAACmNyZWF0ZWRfYXQAAAAAAAYAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAFaG91cnMAAAAAAAAEAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAIcHJvdmlkZXIAAAATAAAAAAAAAAlyZXF1ZXN0ZXIAAAAAAAATAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAKVGFza1N0YXR1cwAAAAAAAAAAAAV0aXRsZQAAAAAAABA=",
        "AAAAAAAAAAAAAAAIZ2V0X3Rhc2sAAAABAAAAAAAAAAd0YXNrX2lkAAAAAAYAAAABAAAH0AAAAARUYXNr",
        "AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAAT",
        "AAAAAAAAADZQb3N0IGEgdGFzayBvZmZlcmluZyBUSU1FIGNyZWRpdHMgaW4gZXhjaGFuZ2UgZm9yIGhlbHAAAAAAAAlwb3N0X3Rhc2sAAAAAAAAGAAAAAAAAAAlyZXF1ZXN0ZXIAAAAAAAATAAAAAAAAAAV0aXRsZQAAAAAAABAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAACGNhdGVnb3J5AAAAEAAAAAAAAAAFaG91cnMAAAAAAAAEAAAAAAAAAA9kZWFkbGluZV9vZmZzZXQAAAAABgAAAAEAAAAG",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAEAAAAAAAAABFRhc2sAAAABAAAABgAAAAEAAAAAAAAACVVzZXJUYXNrcwAAAAAAAAEAAAATAAAAAQAAAAAAAAAHQmFsYW5jZQAAAAABAAAAEwAAAAAAAAAAAAAADFRvdGFsTWVtYmVycw==",
        "AAAAAAAAABxQcm92aWRlciBjbGFpbXMgYW4gb3BlbiB0YXNrAAAACmNsYWltX3Rhc2sAAAAAAAIAAAAAAAAACHByb3ZpZGVyAAAAEwAAAAAAAAAHdGFza19pZAAAAAAGAAAAAA==",
        "AAAAAAAAABhJbml0aWFsaXplIHRoZSB0aW1lIGJhbmsAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAA5sZWRnZXJfYWRkcmVzcwAAAAAAEwAAAAA=",
        "AAAAAAAAAC9DYW5jZWwgYW4gT3BlbiB0YXNrIOKAlCByZWZ1bmQgZXNjcm93ZWQgY3JlZGl0cwAAAAALY2FuY2VsX3Rhc2sAAAAAAgAAAAAAAAAJcmVxdWVzdGVyAAAAAAAAEwAAAAAAAAAHdGFza19pZAAAAAAGAAAAAA==",
        "AAAAAAAAAAAAAAALZ2V0X2JhbGFuY2UAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAABg==",
        "AAAAAAAAACBQcm92aWRlciBzdWJtaXRzIHdvcmsgZm9yIHJldmlldwAAAAtzdWJtaXRfd29yawAAAAACAAAAAAAAAAhwcm92aWRlcgAAABMAAAAAAAAAB3Rhc2tfaWQAAAAABgAAAAA=",
        "AAAAAAAAAC5SYWlzZSBhIGRpc3B1dGUgb24gYSBDbGFpbWVkIG9yIFN1Ym1pdHRlZCB0YXNrAAAAAAAMZGlzcHV0ZV90YXNrAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAd0YXNrX2lkAAAAAAYAAAAA",
        "AAAAAgAAAAAAAAAAAAAAClRhc2tTdGF0dXMAAAAAAAYAAAAAAAAAAAAAAARPcGVuAAAAAAAAAAAAAAAHQ2xhaW1lZAAAAAAAAAAAAAAAAAlTdWJtaXR0ZWQAAAAAAAAAAAAAAAAAAAlDb21wbGV0ZWQAAAAAAAAAAAAAAAAAAAlDYW5jZWxsZWQAAAAAAAAAAAAAAAAAAAhEaXNwdXRlZA==",
        "AAAAAAAAAAAAAAAOZ2V0X3VzZXJfdGFza3MAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+oAAAfQAAAABFRhc2s=",
        "AAAAAAAAAAAAAAAPZ2V0X3RvdGFsX3Rhc2tzAAAAAAAAAAABAAAABg==",
        "AAAAAAAAAAAAAAAQZ2V0X3RvdGFsX3N1cHBseQAAAAAAAAABAAAABg==",
        "AAAAAAAAAAAAAAARZ2V0X3RvdGFsX21lbWJlcnMAAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAD1SZXF1ZXN0ZXIgY29uZmlybXMgd29yayBhbmQgcmVsZWFzZXMgVElNRSBjcmVkaXRzIHRvIHByb3ZpZGVyAAAAAAAAEmNvbmZpcm1fY29tcGxldGlvbgAAAAAAAgAAAAAAAAAJcmVxdWVzdGVyAAAAAAAAEwAAAAAAAAAHdGFza19pZAAAAAAGAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    mint: this.txFromJSON<null>,
        get_task: this.txFromJSON<Task>,
        get_admin: this.txFromJSON<string>,
        post_task: this.txFromJSON<u64>,
        claim_task: this.txFromJSON<null>,
        initialize: this.txFromJSON<null>,
        cancel_task: this.txFromJSON<null>,
        get_balance: this.txFromJSON<u64>,
        submit_work: this.txFromJSON<null>,
        dispute_task: this.txFromJSON<null>,
        get_user_tasks: this.txFromJSON<Array<Task>>,
        get_total_tasks: this.txFromJSON<u64>,
        get_total_supply: this.txFromJSON<u64>,
        get_total_members: this.txFromJSON<u32>,
        confirm_completion: this.txFromJSON<null>
  }
}
