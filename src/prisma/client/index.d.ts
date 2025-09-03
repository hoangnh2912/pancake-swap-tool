
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ScanContract
 * 
 */
export type ScanContract = $Result.DefaultSelection<Prisma.$ScanContractPayload>
/**
 * Model ScanBalance
 * 
 */
export type ScanBalance = $Result.DefaultSelection<Prisma.$ScanBalancePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ScanContracts
 * const scanContracts = await prisma.scanContract.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ScanContracts
   * const scanContracts = await prisma.scanContract.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.scanContract`: Exposes CRUD operations for the **ScanContract** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ScanContracts
    * const scanContracts = await prisma.scanContract.findMany()
    * ```
    */
  get scanContract(): Prisma.ScanContractDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.scanBalance`: Exposes CRUD operations for the **ScanBalance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ScanBalances
    * const scanBalances = await prisma.scanBalance.findMany()
    * ```
    */
  get scanBalance(): Prisma.ScanBalanceDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.15.0
   * Query Engine version: 85179d7826409ee107a6ba334b5e305ae3fba9fb
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ScanContract: 'ScanContract',
    ScanBalance: 'ScanBalance'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "scanContract" | "scanBalance"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ScanContract: {
        payload: Prisma.$ScanContractPayload<ExtArgs>
        fields: Prisma.ScanContractFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ScanContractFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ScanContractFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload>
          }
          findFirst: {
            args: Prisma.ScanContractFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ScanContractFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload>
          }
          findMany: {
            args: Prisma.ScanContractFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload>[]
          }
          create: {
            args: Prisma.ScanContractCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload>
          }
          createMany: {
            args: Prisma.ScanContractCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ScanContractCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload>[]
          }
          delete: {
            args: Prisma.ScanContractDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload>
          }
          update: {
            args: Prisma.ScanContractUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload>
          }
          deleteMany: {
            args: Prisma.ScanContractDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ScanContractUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ScanContractUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload>[]
          }
          upsert: {
            args: Prisma.ScanContractUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanContractPayload>
          }
          aggregate: {
            args: Prisma.ScanContractAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateScanContract>
          }
          groupBy: {
            args: Prisma.ScanContractGroupByArgs<ExtArgs>
            result: $Utils.Optional<ScanContractGroupByOutputType>[]
          }
          count: {
            args: Prisma.ScanContractCountArgs<ExtArgs>
            result: $Utils.Optional<ScanContractCountAggregateOutputType> | number
          }
        }
      }
      ScanBalance: {
        payload: Prisma.$ScanBalancePayload<ExtArgs>
        fields: Prisma.ScanBalanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ScanBalanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ScanBalanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload>
          }
          findFirst: {
            args: Prisma.ScanBalanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ScanBalanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload>
          }
          findMany: {
            args: Prisma.ScanBalanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload>[]
          }
          create: {
            args: Prisma.ScanBalanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload>
          }
          createMany: {
            args: Prisma.ScanBalanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ScanBalanceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload>[]
          }
          delete: {
            args: Prisma.ScanBalanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload>
          }
          update: {
            args: Prisma.ScanBalanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload>
          }
          deleteMany: {
            args: Prisma.ScanBalanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ScanBalanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ScanBalanceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload>[]
          }
          upsert: {
            args: Prisma.ScanBalanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanBalancePayload>
          }
          aggregate: {
            args: Prisma.ScanBalanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateScanBalance>
          }
          groupBy: {
            args: Prisma.ScanBalanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ScanBalanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.ScanBalanceCountArgs<ExtArgs>
            result: $Utils.Optional<ScanBalanceCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    scanContract?: ScanContractOmit
    scanBalance?: ScanBalanceOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model ScanContract
   */

  export type AggregateScanContract = {
    _count: ScanContractCountAggregateOutputType | null
    _avg: ScanContractAvgAggregateOutputType | null
    _sum: ScanContractSumAggregateOutputType | null
    _min: ScanContractMinAggregateOutputType | null
    _max: ScanContractMaxAggregateOutputType | null
  }

  export type ScanContractAvgAggregateOutputType = {
    balance: number | null
  }

  export type ScanContractSumAggregateOutputType = {
    balance: number | null
  }

  export type ScanContractMinAggregateOutputType = {
    id: string | null
    wallet: string | null
    contract: string | null
    balance: number | null
    token: string | null
    isAirdrop: boolean | null
    createdAt: Date | null
  }

  export type ScanContractMaxAggregateOutputType = {
    id: string | null
    wallet: string | null
    contract: string | null
    balance: number | null
    token: string | null
    isAirdrop: boolean | null
    createdAt: Date | null
  }

  export type ScanContractCountAggregateOutputType = {
    id: number
    wallet: number
    contract: number
    balance: number
    token: number
    isAirdrop: number
    createdAt: number
    _all: number
  }


  export type ScanContractAvgAggregateInputType = {
    balance?: true
  }

  export type ScanContractSumAggregateInputType = {
    balance?: true
  }

  export type ScanContractMinAggregateInputType = {
    id?: true
    wallet?: true
    contract?: true
    balance?: true
    token?: true
    isAirdrop?: true
    createdAt?: true
  }

  export type ScanContractMaxAggregateInputType = {
    id?: true
    wallet?: true
    contract?: true
    balance?: true
    token?: true
    isAirdrop?: true
    createdAt?: true
  }

  export type ScanContractCountAggregateInputType = {
    id?: true
    wallet?: true
    contract?: true
    balance?: true
    token?: true
    isAirdrop?: true
    createdAt?: true
    _all?: true
  }

  export type ScanContractAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScanContract to aggregate.
     */
    where?: ScanContractWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanContracts to fetch.
     */
    orderBy?: ScanContractOrderByWithRelationInput | ScanContractOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ScanContractWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanContracts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanContracts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ScanContracts
    **/
    _count?: true | ScanContractCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ScanContractAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ScanContractSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ScanContractMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ScanContractMaxAggregateInputType
  }

  export type GetScanContractAggregateType<T extends ScanContractAggregateArgs> = {
        [P in keyof T & keyof AggregateScanContract]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateScanContract[P]>
      : GetScalarType<T[P], AggregateScanContract[P]>
  }




  export type ScanContractGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScanContractWhereInput
    orderBy?: ScanContractOrderByWithAggregationInput | ScanContractOrderByWithAggregationInput[]
    by: ScanContractScalarFieldEnum[] | ScanContractScalarFieldEnum
    having?: ScanContractScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ScanContractCountAggregateInputType | true
    _avg?: ScanContractAvgAggregateInputType
    _sum?: ScanContractSumAggregateInputType
    _min?: ScanContractMinAggregateInputType
    _max?: ScanContractMaxAggregateInputType
  }

  export type ScanContractGroupByOutputType = {
    id: string
    wallet: string
    contract: string
    balance: number
    token: string | null
    isAirdrop: boolean
    createdAt: Date
    _count: ScanContractCountAggregateOutputType | null
    _avg: ScanContractAvgAggregateOutputType | null
    _sum: ScanContractSumAggregateOutputType | null
    _min: ScanContractMinAggregateOutputType | null
    _max: ScanContractMaxAggregateOutputType | null
  }

  type GetScanContractGroupByPayload<T extends ScanContractGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScanContractGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ScanContractGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ScanContractGroupByOutputType[P]>
            : GetScalarType<T[P], ScanContractGroupByOutputType[P]>
        }
      >
    >


  export type ScanContractSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet?: boolean
    contract?: boolean
    balance?: boolean
    token?: boolean
    isAirdrop?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scanContract"]>

  export type ScanContractSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet?: boolean
    contract?: boolean
    balance?: boolean
    token?: boolean
    isAirdrop?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scanContract"]>

  export type ScanContractSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet?: boolean
    contract?: boolean
    balance?: boolean
    token?: boolean
    isAirdrop?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scanContract"]>

  export type ScanContractSelectScalar = {
    id?: boolean
    wallet?: boolean
    contract?: boolean
    balance?: boolean
    token?: boolean
    isAirdrop?: boolean
    createdAt?: boolean
  }

  export type ScanContractOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "wallet" | "contract" | "balance" | "token" | "isAirdrop" | "createdAt", ExtArgs["result"]["scanContract"]>

  export type $ScanContractPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ScanContract"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      wallet: string
      contract: string
      balance: number
      token: string | null
      isAirdrop: boolean
      createdAt: Date
    }, ExtArgs["result"]["scanContract"]>
    composites: {}
  }

  type ScanContractGetPayload<S extends boolean | null | undefined | ScanContractDefaultArgs> = $Result.GetResult<Prisma.$ScanContractPayload, S>

  type ScanContractCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ScanContractFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ScanContractCountAggregateInputType | true
    }

  export interface ScanContractDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ScanContract'], meta: { name: 'ScanContract' } }
    /**
     * Find zero or one ScanContract that matches the filter.
     * @param {ScanContractFindUniqueArgs} args - Arguments to find a ScanContract
     * @example
     * // Get one ScanContract
     * const scanContract = await prisma.scanContract.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScanContractFindUniqueArgs>(args: SelectSubset<T, ScanContractFindUniqueArgs<ExtArgs>>): Prisma__ScanContractClient<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ScanContract that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScanContractFindUniqueOrThrowArgs} args - Arguments to find a ScanContract
     * @example
     * // Get one ScanContract
     * const scanContract = await prisma.scanContract.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScanContractFindUniqueOrThrowArgs>(args: SelectSubset<T, ScanContractFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ScanContractClient<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ScanContract that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanContractFindFirstArgs} args - Arguments to find a ScanContract
     * @example
     * // Get one ScanContract
     * const scanContract = await prisma.scanContract.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScanContractFindFirstArgs>(args?: SelectSubset<T, ScanContractFindFirstArgs<ExtArgs>>): Prisma__ScanContractClient<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ScanContract that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanContractFindFirstOrThrowArgs} args - Arguments to find a ScanContract
     * @example
     * // Get one ScanContract
     * const scanContract = await prisma.scanContract.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScanContractFindFirstOrThrowArgs>(args?: SelectSubset<T, ScanContractFindFirstOrThrowArgs<ExtArgs>>): Prisma__ScanContractClient<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ScanContracts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanContractFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ScanContracts
     * const scanContracts = await prisma.scanContract.findMany()
     * 
     * // Get first 10 ScanContracts
     * const scanContracts = await prisma.scanContract.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const scanContractWithIdOnly = await prisma.scanContract.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ScanContractFindManyArgs>(args?: SelectSubset<T, ScanContractFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ScanContract.
     * @param {ScanContractCreateArgs} args - Arguments to create a ScanContract.
     * @example
     * // Create one ScanContract
     * const ScanContract = await prisma.scanContract.create({
     *   data: {
     *     // ... data to create a ScanContract
     *   }
     * })
     * 
     */
    create<T extends ScanContractCreateArgs>(args: SelectSubset<T, ScanContractCreateArgs<ExtArgs>>): Prisma__ScanContractClient<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ScanContracts.
     * @param {ScanContractCreateManyArgs} args - Arguments to create many ScanContracts.
     * @example
     * // Create many ScanContracts
     * const scanContract = await prisma.scanContract.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ScanContractCreateManyArgs>(args?: SelectSubset<T, ScanContractCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ScanContracts and returns the data saved in the database.
     * @param {ScanContractCreateManyAndReturnArgs} args - Arguments to create many ScanContracts.
     * @example
     * // Create many ScanContracts
     * const scanContract = await prisma.scanContract.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ScanContracts and only return the `id`
     * const scanContractWithIdOnly = await prisma.scanContract.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ScanContractCreateManyAndReturnArgs>(args?: SelectSubset<T, ScanContractCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ScanContract.
     * @param {ScanContractDeleteArgs} args - Arguments to delete one ScanContract.
     * @example
     * // Delete one ScanContract
     * const ScanContract = await prisma.scanContract.delete({
     *   where: {
     *     // ... filter to delete one ScanContract
     *   }
     * })
     * 
     */
    delete<T extends ScanContractDeleteArgs>(args: SelectSubset<T, ScanContractDeleteArgs<ExtArgs>>): Prisma__ScanContractClient<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ScanContract.
     * @param {ScanContractUpdateArgs} args - Arguments to update one ScanContract.
     * @example
     * // Update one ScanContract
     * const scanContract = await prisma.scanContract.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ScanContractUpdateArgs>(args: SelectSubset<T, ScanContractUpdateArgs<ExtArgs>>): Prisma__ScanContractClient<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ScanContracts.
     * @param {ScanContractDeleteManyArgs} args - Arguments to filter ScanContracts to delete.
     * @example
     * // Delete a few ScanContracts
     * const { count } = await prisma.scanContract.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ScanContractDeleteManyArgs>(args?: SelectSubset<T, ScanContractDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScanContracts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanContractUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ScanContracts
     * const scanContract = await prisma.scanContract.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ScanContractUpdateManyArgs>(args: SelectSubset<T, ScanContractUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScanContracts and returns the data updated in the database.
     * @param {ScanContractUpdateManyAndReturnArgs} args - Arguments to update many ScanContracts.
     * @example
     * // Update many ScanContracts
     * const scanContract = await prisma.scanContract.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ScanContracts and only return the `id`
     * const scanContractWithIdOnly = await prisma.scanContract.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ScanContractUpdateManyAndReturnArgs>(args: SelectSubset<T, ScanContractUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ScanContract.
     * @param {ScanContractUpsertArgs} args - Arguments to update or create a ScanContract.
     * @example
     * // Update or create a ScanContract
     * const scanContract = await prisma.scanContract.upsert({
     *   create: {
     *     // ... data to create a ScanContract
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ScanContract we want to update
     *   }
     * })
     */
    upsert<T extends ScanContractUpsertArgs>(args: SelectSubset<T, ScanContractUpsertArgs<ExtArgs>>): Prisma__ScanContractClient<$Result.GetResult<Prisma.$ScanContractPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ScanContracts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanContractCountArgs} args - Arguments to filter ScanContracts to count.
     * @example
     * // Count the number of ScanContracts
     * const count = await prisma.scanContract.count({
     *   where: {
     *     // ... the filter for the ScanContracts we want to count
     *   }
     * })
    **/
    count<T extends ScanContractCountArgs>(
      args?: Subset<T, ScanContractCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ScanContractCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ScanContract.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanContractAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ScanContractAggregateArgs>(args: Subset<T, ScanContractAggregateArgs>): Prisma.PrismaPromise<GetScanContractAggregateType<T>>

    /**
     * Group by ScanContract.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanContractGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ScanContractGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScanContractGroupByArgs['orderBy'] }
        : { orderBy?: ScanContractGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ScanContractGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScanContractGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ScanContract model
   */
  readonly fields: ScanContractFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ScanContract.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScanContractClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ScanContract model
   */
  interface ScanContractFieldRefs {
    readonly id: FieldRef<"ScanContract", 'String'>
    readonly wallet: FieldRef<"ScanContract", 'String'>
    readonly contract: FieldRef<"ScanContract", 'String'>
    readonly balance: FieldRef<"ScanContract", 'Float'>
    readonly token: FieldRef<"ScanContract", 'String'>
    readonly isAirdrop: FieldRef<"ScanContract", 'Boolean'>
    readonly createdAt: FieldRef<"ScanContract", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ScanContract findUnique
   */
  export type ScanContractFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * Filter, which ScanContract to fetch.
     */
    where: ScanContractWhereUniqueInput
  }

  /**
   * ScanContract findUniqueOrThrow
   */
  export type ScanContractFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * Filter, which ScanContract to fetch.
     */
    where: ScanContractWhereUniqueInput
  }

  /**
   * ScanContract findFirst
   */
  export type ScanContractFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * Filter, which ScanContract to fetch.
     */
    where?: ScanContractWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanContracts to fetch.
     */
    orderBy?: ScanContractOrderByWithRelationInput | ScanContractOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScanContracts.
     */
    cursor?: ScanContractWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanContracts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanContracts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScanContracts.
     */
    distinct?: ScanContractScalarFieldEnum | ScanContractScalarFieldEnum[]
  }

  /**
   * ScanContract findFirstOrThrow
   */
  export type ScanContractFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * Filter, which ScanContract to fetch.
     */
    where?: ScanContractWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanContracts to fetch.
     */
    orderBy?: ScanContractOrderByWithRelationInput | ScanContractOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScanContracts.
     */
    cursor?: ScanContractWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanContracts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanContracts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScanContracts.
     */
    distinct?: ScanContractScalarFieldEnum | ScanContractScalarFieldEnum[]
  }

  /**
   * ScanContract findMany
   */
  export type ScanContractFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * Filter, which ScanContracts to fetch.
     */
    where?: ScanContractWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanContracts to fetch.
     */
    orderBy?: ScanContractOrderByWithRelationInput | ScanContractOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ScanContracts.
     */
    cursor?: ScanContractWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanContracts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanContracts.
     */
    skip?: number
    distinct?: ScanContractScalarFieldEnum | ScanContractScalarFieldEnum[]
  }

  /**
   * ScanContract create
   */
  export type ScanContractCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * The data needed to create a ScanContract.
     */
    data: XOR<ScanContractCreateInput, ScanContractUncheckedCreateInput>
  }

  /**
   * ScanContract createMany
   */
  export type ScanContractCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ScanContracts.
     */
    data: ScanContractCreateManyInput | ScanContractCreateManyInput[]
  }

  /**
   * ScanContract createManyAndReturn
   */
  export type ScanContractCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * The data used to create many ScanContracts.
     */
    data: ScanContractCreateManyInput | ScanContractCreateManyInput[]
  }

  /**
   * ScanContract update
   */
  export type ScanContractUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * The data needed to update a ScanContract.
     */
    data: XOR<ScanContractUpdateInput, ScanContractUncheckedUpdateInput>
    /**
     * Choose, which ScanContract to update.
     */
    where: ScanContractWhereUniqueInput
  }

  /**
   * ScanContract updateMany
   */
  export type ScanContractUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ScanContracts.
     */
    data: XOR<ScanContractUpdateManyMutationInput, ScanContractUncheckedUpdateManyInput>
    /**
     * Filter which ScanContracts to update
     */
    where?: ScanContractWhereInput
    /**
     * Limit how many ScanContracts to update.
     */
    limit?: number
  }

  /**
   * ScanContract updateManyAndReturn
   */
  export type ScanContractUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * The data used to update ScanContracts.
     */
    data: XOR<ScanContractUpdateManyMutationInput, ScanContractUncheckedUpdateManyInput>
    /**
     * Filter which ScanContracts to update
     */
    where?: ScanContractWhereInput
    /**
     * Limit how many ScanContracts to update.
     */
    limit?: number
  }

  /**
   * ScanContract upsert
   */
  export type ScanContractUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * The filter to search for the ScanContract to update in case it exists.
     */
    where: ScanContractWhereUniqueInput
    /**
     * In case the ScanContract found by the `where` argument doesn't exist, create a new ScanContract with this data.
     */
    create: XOR<ScanContractCreateInput, ScanContractUncheckedCreateInput>
    /**
     * In case the ScanContract was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ScanContractUpdateInput, ScanContractUncheckedUpdateInput>
  }

  /**
   * ScanContract delete
   */
  export type ScanContractDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
    /**
     * Filter which ScanContract to delete.
     */
    where: ScanContractWhereUniqueInput
  }

  /**
   * ScanContract deleteMany
   */
  export type ScanContractDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScanContracts to delete
     */
    where?: ScanContractWhereInput
    /**
     * Limit how many ScanContracts to delete.
     */
    limit?: number
  }

  /**
   * ScanContract without action
   */
  export type ScanContractDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanContract
     */
    select?: ScanContractSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanContract
     */
    omit?: ScanContractOmit<ExtArgs> | null
  }


  /**
   * Model ScanBalance
   */

  export type AggregateScanBalance = {
    _count: ScanBalanceCountAggregateOutputType | null
    _avg: ScanBalanceAvgAggregateOutputType | null
    _sum: ScanBalanceSumAggregateOutputType | null
    _min: ScanBalanceMinAggregateOutputType | null
    _max: ScanBalanceMaxAggregateOutputType | null
  }

  export type ScanBalanceAvgAggregateOutputType = {
    balance: number | null
  }

  export type ScanBalanceSumAggregateOutputType = {
    balance: number | null
  }

  export type ScanBalanceMinAggregateOutputType = {
    id: string | null
    wallet: string | null
    balance: number | null
    token: string | null
    createdAt: Date | null
  }

  export type ScanBalanceMaxAggregateOutputType = {
    id: string | null
    wallet: string | null
    balance: number | null
    token: string | null
    createdAt: Date | null
  }

  export type ScanBalanceCountAggregateOutputType = {
    id: number
    wallet: number
    balance: number
    token: number
    createdAt: number
    _all: number
  }


  export type ScanBalanceAvgAggregateInputType = {
    balance?: true
  }

  export type ScanBalanceSumAggregateInputType = {
    balance?: true
  }

  export type ScanBalanceMinAggregateInputType = {
    id?: true
    wallet?: true
    balance?: true
    token?: true
    createdAt?: true
  }

  export type ScanBalanceMaxAggregateInputType = {
    id?: true
    wallet?: true
    balance?: true
    token?: true
    createdAt?: true
  }

  export type ScanBalanceCountAggregateInputType = {
    id?: true
    wallet?: true
    balance?: true
    token?: true
    createdAt?: true
    _all?: true
  }

  export type ScanBalanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScanBalance to aggregate.
     */
    where?: ScanBalanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanBalances to fetch.
     */
    orderBy?: ScanBalanceOrderByWithRelationInput | ScanBalanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ScanBalanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanBalances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanBalances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ScanBalances
    **/
    _count?: true | ScanBalanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ScanBalanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ScanBalanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ScanBalanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ScanBalanceMaxAggregateInputType
  }

  export type GetScanBalanceAggregateType<T extends ScanBalanceAggregateArgs> = {
        [P in keyof T & keyof AggregateScanBalance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateScanBalance[P]>
      : GetScalarType<T[P], AggregateScanBalance[P]>
  }




  export type ScanBalanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScanBalanceWhereInput
    orderBy?: ScanBalanceOrderByWithAggregationInput | ScanBalanceOrderByWithAggregationInput[]
    by: ScanBalanceScalarFieldEnum[] | ScanBalanceScalarFieldEnum
    having?: ScanBalanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ScanBalanceCountAggregateInputType | true
    _avg?: ScanBalanceAvgAggregateInputType
    _sum?: ScanBalanceSumAggregateInputType
    _min?: ScanBalanceMinAggregateInputType
    _max?: ScanBalanceMaxAggregateInputType
  }

  export type ScanBalanceGroupByOutputType = {
    id: string
    wallet: string
    balance: number
    token: string | null
    createdAt: Date
    _count: ScanBalanceCountAggregateOutputType | null
    _avg: ScanBalanceAvgAggregateOutputType | null
    _sum: ScanBalanceSumAggregateOutputType | null
    _min: ScanBalanceMinAggregateOutputType | null
    _max: ScanBalanceMaxAggregateOutputType | null
  }

  type GetScanBalanceGroupByPayload<T extends ScanBalanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScanBalanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ScanBalanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ScanBalanceGroupByOutputType[P]>
            : GetScalarType<T[P], ScanBalanceGroupByOutputType[P]>
        }
      >
    >


  export type ScanBalanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet?: boolean
    balance?: boolean
    token?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scanBalance"]>

  export type ScanBalanceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet?: boolean
    balance?: boolean
    token?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scanBalance"]>

  export type ScanBalanceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet?: boolean
    balance?: boolean
    token?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scanBalance"]>

  export type ScanBalanceSelectScalar = {
    id?: boolean
    wallet?: boolean
    balance?: boolean
    token?: boolean
    createdAt?: boolean
  }

  export type ScanBalanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "wallet" | "balance" | "token" | "createdAt", ExtArgs["result"]["scanBalance"]>

  export type $ScanBalancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ScanBalance"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      wallet: string
      balance: number
      token: string | null
      createdAt: Date
    }, ExtArgs["result"]["scanBalance"]>
    composites: {}
  }

  type ScanBalanceGetPayload<S extends boolean | null | undefined | ScanBalanceDefaultArgs> = $Result.GetResult<Prisma.$ScanBalancePayload, S>

  type ScanBalanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ScanBalanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ScanBalanceCountAggregateInputType | true
    }

  export interface ScanBalanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ScanBalance'], meta: { name: 'ScanBalance' } }
    /**
     * Find zero or one ScanBalance that matches the filter.
     * @param {ScanBalanceFindUniqueArgs} args - Arguments to find a ScanBalance
     * @example
     * // Get one ScanBalance
     * const scanBalance = await prisma.scanBalance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScanBalanceFindUniqueArgs>(args: SelectSubset<T, ScanBalanceFindUniqueArgs<ExtArgs>>): Prisma__ScanBalanceClient<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ScanBalance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScanBalanceFindUniqueOrThrowArgs} args - Arguments to find a ScanBalance
     * @example
     * // Get one ScanBalance
     * const scanBalance = await prisma.scanBalance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScanBalanceFindUniqueOrThrowArgs>(args: SelectSubset<T, ScanBalanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ScanBalanceClient<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ScanBalance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanBalanceFindFirstArgs} args - Arguments to find a ScanBalance
     * @example
     * // Get one ScanBalance
     * const scanBalance = await prisma.scanBalance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScanBalanceFindFirstArgs>(args?: SelectSubset<T, ScanBalanceFindFirstArgs<ExtArgs>>): Prisma__ScanBalanceClient<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ScanBalance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanBalanceFindFirstOrThrowArgs} args - Arguments to find a ScanBalance
     * @example
     * // Get one ScanBalance
     * const scanBalance = await prisma.scanBalance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScanBalanceFindFirstOrThrowArgs>(args?: SelectSubset<T, ScanBalanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ScanBalanceClient<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ScanBalances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanBalanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ScanBalances
     * const scanBalances = await prisma.scanBalance.findMany()
     * 
     * // Get first 10 ScanBalances
     * const scanBalances = await prisma.scanBalance.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const scanBalanceWithIdOnly = await prisma.scanBalance.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ScanBalanceFindManyArgs>(args?: SelectSubset<T, ScanBalanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ScanBalance.
     * @param {ScanBalanceCreateArgs} args - Arguments to create a ScanBalance.
     * @example
     * // Create one ScanBalance
     * const ScanBalance = await prisma.scanBalance.create({
     *   data: {
     *     // ... data to create a ScanBalance
     *   }
     * })
     * 
     */
    create<T extends ScanBalanceCreateArgs>(args: SelectSubset<T, ScanBalanceCreateArgs<ExtArgs>>): Prisma__ScanBalanceClient<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ScanBalances.
     * @param {ScanBalanceCreateManyArgs} args - Arguments to create many ScanBalances.
     * @example
     * // Create many ScanBalances
     * const scanBalance = await prisma.scanBalance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ScanBalanceCreateManyArgs>(args?: SelectSubset<T, ScanBalanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ScanBalances and returns the data saved in the database.
     * @param {ScanBalanceCreateManyAndReturnArgs} args - Arguments to create many ScanBalances.
     * @example
     * // Create many ScanBalances
     * const scanBalance = await prisma.scanBalance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ScanBalances and only return the `id`
     * const scanBalanceWithIdOnly = await prisma.scanBalance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ScanBalanceCreateManyAndReturnArgs>(args?: SelectSubset<T, ScanBalanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ScanBalance.
     * @param {ScanBalanceDeleteArgs} args - Arguments to delete one ScanBalance.
     * @example
     * // Delete one ScanBalance
     * const ScanBalance = await prisma.scanBalance.delete({
     *   where: {
     *     // ... filter to delete one ScanBalance
     *   }
     * })
     * 
     */
    delete<T extends ScanBalanceDeleteArgs>(args: SelectSubset<T, ScanBalanceDeleteArgs<ExtArgs>>): Prisma__ScanBalanceClient<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ScanBalance.
     * @param {ScanBalanceUpdateArgs} args - Arguments to update one ScanBalance.
     * @example
     * // Update one ScanBalance
     * const scanBalance = await prisma.scanBalance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ScanBalanceUpdateArgs>(args: SelectSubset<T, ScanBalanceUpdateArgs<ExtArgs>>): Prisma__ScanBalanceClient<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ScanBalances.
     * @param {ScanBalanceDeleteManyArgs} args - Arguments to filter ScanBalances to delete.
     * @example
     * // Delete a few ScanBalances
     * const { count } = await prisma.scanBalance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ScanBalanceDeleteManyArgs>(args?: SelectSubset<T, ScanBalanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScanBalances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanBalanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ScanBalances
     * const scanBalance = await prisma.scanBalance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ScanBalanceUpdateManyArgs>(args: SelectSubset<T, ScanBalanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScanBalances and returns the data updated in the database.
     * @param {ScanBalanceUpdateManyAndReturnArgs} args - Arguments to update many ScanBalances.
     * @example
     * // Update many ScanBalances
     * const scanBalance = await prisma.scanBalance.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ScanBalances and only return the `id`
     * const scanBalanceWithIdOnly = await prisma.scanBalance.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ScanBalanceUpdateManyAndReturnArgs>(args: SelectSubset<T, ScanBalanceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ScanBalance.
     * @param {ScanBalanceUpsertArgs} args - Arguments to update or create a ScanBalance.
     * @example
     * // Update or create a ScanBalance
     * const scanBalance = await prisma.scanBalance.upsert({
     *   create: {
     *     // ... data to create a ScanBalance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ScanBalance we want to update
     *   }
     * })
     */
    upsert<T extends ScanBalanceUpsertArgs>(args: SelectSubset<T, ScanBalanceUpsertArgs<ExtArgs>>): Prisma__ScanBalanceClient<$Result.GetResult<Prisma.$ScanBalancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ScanBalances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanBalanceCountArgs} args - Arguments to filter ScanBalances to count.
     * @example
     * // Count the number of ScanBalances
     * const count = await prisma.scanBalance.count({
     *   where: {
     *     // ... the filter for the ScanBalances we want to count
     *   }
     * })
    **/
    count<T extends ScanBalanceCountArgs>(
      args?: Subset<T, ScanBalanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ScanBalanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ScanBalance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanBalanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ScanBalanceAggregateArgs>(args: Subset<T, ScanBalanceAggregateArgs>): Prisma.PrismaPromise<GetScanBalanceAggregateType<T>>

    /**
     * Group by ScanBalance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanBalanceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ScanBalanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScanBalanceGroupByArgs['orderBy'] }
        : { orderBy?: ScanBalanceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ScanBalanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScanBalanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ScanBalance model
   */
  readonly fields: ScanBalanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ScanBalance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScanBalanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ScanBalance model
   */
  interface ScanBalanceFieldRefs {
    readonly id: FieldRef<"ScanBalance", 'String'>
    readonly wallet: FieldRef<"ScanBalance", 'String'>
    readonly balance: FieldRef<"ScanBalance", 'Float'>
    readonly token: FieldRef<"ScanBalance", 'String'>
    readonly createdAt: FieldRef<"ScanBalance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ScanBalance findUnique
   */
  export type ScanBalanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * Filter, which ScanBalance to fetch.
     */
    where: ScanBalanceWhereUniqueInput
  }

  /**
   * ScanBalance findUniqueOrThrow
   */
  export type ScanBalanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * Filter, which ScanBalance to fetch.
     */
    where: ScanBalanceWhereUniqueInput
  }

  /**
   * ScanBalance findFirst
   */
  export type ScanBalanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * Filter, which ScanBalance to fetch.
     */
    where?: ScanBalanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanBalances to fetch.
     */
    orderBy?: ScanBalanceOrderByWithRelationInput | ScanBalanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScanBalances.
     */
    cursor?: ScanBalanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanBalances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanBalances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScanBalances.
     */
    distinct?: ScanBalanceScalarFieldEnum | ScanBalanceScalarFieldEnum[]
  }

  /**
   * ScanBalance findFirstOrThrow
   */
  export type ScanBalanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * Filter, which ScanBalance to fetch.
     */
    where?: ScanBalanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanBalances to fetch.
     */
    orderBy?: ScanBalanceOrderByWithRelationInput | ScanBalanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScanBalances.
     */
    cursor?: ScanBalanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanBalances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanBalances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScanBalances.
     */
    distinct?: ScanBalanceScalarFieldEnum | ScanBalanceScalarFieldEnum[]
  }

  /**
   * ScanBalance findMany
   */
  export type ScanBalanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * Filter, which ScanBalances to fetch.
     */
    where?: ScanBalanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanBalances to fetch.
     */
    orderBy?: ScanBalanceOrderByWithRelationInput | ScanBalanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ScanBalances.
     */
    cursor?: ScanBalanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanBalances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanBalances.
     */
    skip?: number
    distinct?: ScanBalanceScalarFieldEnum | ScanBalanceScalarFieldEnum[]
  }

  /**
   * ScanBalance create
   */
  export type ScanBalanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * The data needed to create a ScanBalance.
     */
    data: XOR<ScanBalanceCreateInput, ScanBalanceUncheckedCreateInput>
  }

  /**
   * ScanBalance createMany
   */
  export type ScanBalanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ScanBalances.
     */
    data: ScanBalanceCreateManyInput | ScanBalanceCreateManyInput[]
  }

  /**
   * ScanBalance createManyAndReturn
   */
  export type ScanBalanceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * The data used to create many ScanBalances.
     */
    data: ScanBalanceCreateManyInput | ScanBalanceCreateManyInput[]
  }

  /**
   * ScanBalance update
   */
  export type ScanBalanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * The data needed to update a ScanBalance.
     */
    data: XOR<ScanBalanceUpdateInput, ScanBalanceUncheckedUpdateInput>
    /**
     * Choose, which ScanBalance to update.
     */
    where: ScanBalanceWhereUniqueInput
  }

  /**
   * ScanBalance updateMany
   */
  export type ScanBalanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ScanBalances.
     */
    data: XOR<ScanBalanceUpdateManyMutationInput, ScanBalanceUncheckedUpdateManyInput>
    /**
     * Filter which ScanBalances to update
     */
    where?: ScanBalanceWhereInput
    /**
     * Limit how many ScanBalances to update.
     */
    limit?: number
  }

  /**
   * ScanBalance updateManyAndReturn
   */
  export type ScanBalanceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * The data used to update ScanBalances.
     */
    data: XOR<ScanBalanceUpdateManyMutationInput, ScanBalanceUncheckedUpdateManyInput>
    /**
     * Filter which ScanBalances to update
     */
    where?: ScanBalanceWhereInput
    /**
     * Limit how many ScanBalances to update.
     */
    limit?: number
  }

  /**
   * ScanBalance upsert
   */
  export type ScanBalanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * The filter to search for the ScanBalance to update in case it exists.
     */
    where: ScanBalanceWhereUniqueInput
    /**
     * In case the ScanBalance found by the `where` argument doesn't exist, create a new ScanBalance with this data.
     */
    create: XOR<ScanBalanceCreateInput, ScanBalanceUncheckedCreateInput>
    /**
     * In case the ScanBalance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ScanBalanceUpdateInput, ScanBalanceUncheckedUpdateInput>
  }

  /**
   * ScanBalance delete
   */
  export type ScanBalanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
    /**
     * Filter which ScanBalance to delete.
     */
    where: ScanBalanceWhereUniqueInput
  }

  /**
   * ScanBalance deleteMany
   */
  export type ScanBalanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScanBalances to delete
     */
    where?: ScanBalanceWhereInput
    /**
     * Limit how many ScanBalances to delete.
     */
    limit?: number
  }

  /**
   * ScanBalance without action
   */
  export type ScanBalanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanBalance
     */
    select?: ScanBalanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ScanBalance
     */
    omit?: ScanBalanceOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ScanContractScalarFieldEnum: {
    id: 'id',
    wallet: 'wallet',
    contract: 'contract',
    balance: 'balance',
    token: 'token',
    isAirdrop: 'isAirdrop',
    createdAt: 'createdAt'
  };

  export type ScanContractScalarFieldEnum = (typeof ScanContractScalarFieldEnum)[keyof typeof ScanContractScalarFieldEnum]


  export const ScanBalanceScalarFieldEnum: {
    id: 'id',
    wallet: 'wallet',
    balance: 'balance',
    token: 'token',
    createdAt: 'createdAt'
  };

  export type ScanBalanceScalarFieldEnum = (typeof ScanBalanceScalarFieldEnum)[keyof typeof ScanBalanceScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type ScanContractWhereInput = {
    AND?: ScanContractWhereInput | ScanContractWhereInput[]
    OR?: ScanContractWhereInput[]
    NOT?: ScanContractWhereInput | ScanContractWhereInput[]
    id?: StringFilter<"ScanContract"> | string
    wallet?: StringFilter<"ScanContract"> | string
    contract?: StringFilter<"ScanContract"> | string
    balance?: FloatFilter<"ScanContract"> | number
    token?: StringNullableFilter<"ScanContract"> | string | null
    isAirdrop?: BoolFilter<"ScanContract"> | boolean
    createdAt?: DateTimeFilter<"ScanContract"> | Date | string
  }

  export type ScanContractOrderByWithRelationInput = {
    id?: SortOrder
    wallet?: SortOrder
    contract?: SortOrder
    balance?: SortOrder
    token?: SortOrderInput | SortOrder
    isAirdrop?: SortOrder
    createdAt?: SortOrder
  }

  export type ScanContractWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ScanContractWhereInput | ScanContractWhereInput[]
    OR?: ScanContractWhereInput[]
    NOT?: ScanContractWhereInput | ScanContractWhereInput[]
    wallet?: StringFilter<"ScanContract"> | string
    contract?: StringFilter<"ScanContract"> | string
    balance?: FloatFilter<"ScanContract"> | number
    token?: StringNullableFilter<"ScanContract"> | string | null
    isAirdrop?: BoolFilter<"ScanContract"> | boolean
    createdAt?: DateTimeFilter<"ScanContract"> | Date | string
  }, "id">

  export type ScanContractOrderByWithAggregationInput = {
    id?: SortOrder
    wallet?: SortOrder
    contract?: SortOrder
    balance?: SortOrder
    token?: SortOrderInput | SortOrder
    isAirdrop?: SortOrder
    createdAt?: SortOrder
    _count?: ScanContractCountOrderByAggregateInput
    _avg?: ScanContractAvgOrderByAggregateInput
    _max?: ScanContractMaxOrderByAggregateInput
    _min?: ScanContractMinOrderByAggregateInput
    _sum?: ScanContractSumOrderByAggregateInput
  }

  export type ScanContractScalarWhereWithAggregatesInput = {
    AND?: ScanContractScalarWhereWithAggregatesInput | ScanContractScalarWhereWithAggregatesInput[]
    OR?: ScanContractScalarWhereWithAggregatesInput[]
    NOT?: ScanContractScalarWhereWithAggregatesInput | ScanContractScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ScanContract"> | string
    wallet?: StringWithAggregatesFilter<"ScanContract"> | string
    contract?: StringWithAggregatesFilter<"ScanContract"> | string
    balance?: FloatWithAggregatesFilter<"ScanContract"> | number
    token?: StringNullableWithAggregatesFilter<"ScanContract"> | string | null
    isAirdrop?: BoolWithAggregatesFilter<"ScanContract"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"ScanContract"> | Date | string
  }

  export type ScanBalanceWhereInput = {
    AND?: ScanBalanceWhereInput | ScanBalanceWhereInput[]
    OR?: ScanBalanceWhereInput[]
    NOT?: ScanBalanceWhereInput | ScanBalanceWhereInput[]
    id?: StringFilter<"ScanBalance"> | string
    wallet?: StringFilter<"ScanBalance"> | string
    balance?: FloatFilter<"ScanBalance"> | number
    token?: StringNullableFilter<"ScanBalance"> | string | null
    createdAt?: DateTimeFilter<"ScanBalance"> | Date | string
  }

  export type ScanBalanceOrderByWithRelationInput = {
    id?: SortOrder
    wallet?: SortOrder
    balance?: SortOrder
    token?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type ScanBalanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ScanBalanceWhereInput | ScanBalanceWhereInput[]
    OR?: ScanBalanceWhereInput[]
    NOT?: ScanBalanceWhereInput | ScanBalanceWhereInput[]
    wallet?: StringFilter<"ScanBalance"> | string
    balance?: FloatFilter<"ScanBalance"> | number
    token?: StringNullableFilter<"ScanBalance"> | string | null
    createdAt?: DateTimeFilter<"ScanBalance"> | Date | string
  }, "id">

  export type ScanBalanceOrderByWithAggregationInput = {
    id?: SortOrder
    wallet?: SortOrder
    balance?: SortOrder
    token?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ScanBalanceCountOrderByAggregateInput
    _avg?: ScanBalanceAvgOrderByAggregateInput
    _max?: ScanBalanceMaxOrderByAggregateInput
    _min?: ScanBalanceMinOrderByAggregateInput
    _sum?: ScanBalanceSumOrderByAggregateInput
  }

  export type ScanBalanceScalarWhereWithAggregatesInput = {
    AND?: ScanBalanceScalarWhereWithAggregatesInput | ScanBalanceScalarWhereWithAggregatesInput[]
    OR?: ScanBalanceScalarWhereWithAggregatesInput[]
    NOT?: ScanBalanceScalarWhereWithAggregatesInput | ScanBalanceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ScanBalance"> | string
    wallet?: StringWithAggregatesFilter<"ScanBalance"> | string
    balance?: FloatWithAggregatesFilter<"ScanBalance"> | number
    token?: StringNullableWithAggregatesFilter<"ScanBalance"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ScanBalance"> | Date | string
  }

  export type ScanContractCreateInput = {
    id?: string
    wallet: string
    contract: string
    balance?: number
    token?: string | null
    isAirdrop?: boolean
    createdAt?: Date | string
  }

  export type ScanContractUncheckedCreateInput = {
    id?: string
    wallet: string
    contract: string
    balance?: number
    token?: string | null
    isAirdrop?: boolean
    createdAt?: Date | string
  }

  export type ScanContractUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet?: StringFieldUpdateOperationsInput | string
    contract?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    token?: NullableStringFieldUpdateOperationsInput | string | null
    isAirdrop?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanContractUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet?: StringFieldUpdateOperationsInput | string
    contract?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    token?: NullableStringFieldUpdateOperationsInput | string | null
    isAirdrop?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanContractCreateManyInput = {
    id?: string
    wallet: string
    contract: string
    balance?: number
    token?: string | null
    isAirdrop?: boolean
    createdAt?: Date | string
  }

  export type ScanContractUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet?: StringFieldUpdateOperationsInput | string
    contract?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    token?: NullableStringFieldUpdateOperationsInput | string | null
    isAirdrop?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanContractUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet?: StringFieldUpdateOperationsInput | string
    contract?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    token?: NullableStringFieldUpdateOperationsInput | string | null
    isAirdrop?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanBalanceCreateInput = {
    id?: string
    wallet: string
    balance?: number
    token?: string | null
    createdAt?: Date | string
  }

  export type ScanBalanceUncheckedCreateInput = {
    id?: string
    wallet: string
    balance?: number
    token?: string | null
    createdAt?: Date | string
  }

  export type ScanBalanceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanBalanceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanBalanceCreateManyInput = {
    id?: string
    wallet: string
    balance?: number
    token?: string | null
    createdAt?: Date | string
  }

  export type ScanBalanceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanBalanceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    token?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ScanContractCountOrderByAggregateInput = {
    id?: SortOrder
    wallet?: SortOrder
    contract?: SortOrder
    balance?: SortOrder
    token?: SortOrder
    isAirdrop?: SortOrder
    createdAt?: SortOrder
  }

  export type ScanContractAvgOrderByAggregateInput = {
    balance?: SortOrder
  }

  export type ScanContractMaxOrderByAggregateInput = {
    id?: SortOrder
    wallet?: SortOrder
    contract?: SortOrder
    balance?: SortOrder
    token?: SortOrder
    isAirdrop?: SortOrder
    createdAt?: SortOrder
  }

  export type ScanContractMinOrderByAggregateInput = {
    id?: SortOrder
    wallet?: SortOrder
    contract?: SortOrder
    balance?: SortOrder
    token?: SortOrder
    isAirdrop?: SortOrder
    createdAt?: SortOrder
  }

  export type ScanContractSumOrderByAggregateInput = {
    balance?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type ScanBalanceCountOrderByAggregateInput = {
    id?: SortOrder
    wallet?: SortOrder
    balance?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
  }

  export type ScanBalanceAvgOrderByAggregateInput = {
    balance?: SortOrder
  }

  export type ScanBalanceMaxOrderByAggregateInput = {
    id?: SortOrder
    wallet?: SortOrder
    balance?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
  }

  export type ScanBalanceMinOrderByAggregateInput = {
    id?: SortOrder
    wallet?: SortOrder
    balance?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
  }

  export type ScanBalanceSumOrderByAggregateInput = {
    balance?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}