
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
 * Model Tab
 * 
 */
export type Tab = $Result.DefaultSelection<Prisma.$TabPayload>
/**
 * Model Stepper
 * 
 */
export type Stepper = $Result.DefaultSelection<Prisma.$StepperPayload>
/**
 * Model Transaction
 * 
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tabs
 * const tabs = await prisma.tab.findMany()
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
   * // Fetch zero or more Tabs
   * const tabs = await prisma.tab.findMany()
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
   * `prisma.tab`: Exposes CRUD operations for the **Tab** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tabs
    * const tabs = await prisma.tab.findMany()
    * ```
    */
  get tab(): Prisma.TabDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.stepper`: Exposes CRUD operations for the **Stepper** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Steppers
    * const steppers = await prisma.stepper.findMany()
    * ```
    */
  get stepper(): Prisma.StepperDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Transactions
    * const transactions = await prisma.transaction.findMany()
    * ```
    */
  get transaction(): Prisma.TransactionDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.16.3
   * Query Engine version: bb420e667c1820a8c05a38023385f6cc7ef8e83a
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
    Tab: 'Tab',
    Stepper: 'Stepper',
    Transaction: 'Transaction'
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
      modelProps: "tab" | "stepper" | "transaction"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tab: {
        payload: Prisma.$TabPayload<ExtArgs>
        fields: Prisma.TabFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TabFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TabFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload>
          }
          findFirst: {
            args: Prisma.TabFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TabFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload>
          }
          findMany: {
            args: Prisma.TabFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload>[]
          }
          create: {
            args: Prisma.TabCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload>
          }
          createMany: {
            args: Prisma.TabCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TabCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload>[]
          }
          delete: {
            args: Prisma.TabDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload>
          }
          update: {
            args: Prisma.TabUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload>
          }
          deleteMany: {
            args: Prisma.TabDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TabUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TabUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload>[]
          }
          upsert: {
            args: Prisma.TabUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TabPayload>
          }
          aggregate: {
            args: Prisma.TabAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTab>
          }
          groupBy: {
            args: Prisma.TabGroupByArgs<ExtArgs>
            result: $Utils.Optional<TabGroupByOutputType>[]
          }
          count: {
            args: Prisma.TabCountArgs<ExtArgs>
            result: $Utils.Optional<TabCountAggregateOutputType> | number
          }
        }
      }
      Stepper: {
        payload: Prisma.$StepperPayload<ExtArgs>
        fields: Prisma.StepperFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StepperFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StepperFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload>
          }
          findFirst: {
            args: Prisma.StepperFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StepperFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload>
          }
          findMany: {
            args: Prisma.StepperFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload>[]
          }
          create: {
            args: Prisma.StepperCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload>
          }
          createMany: {
            args: Prisma.StepperCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StepperCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload>[]
          }
          delete: {
            args: Prisma.StepperDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload>
          }
          update: {
            args: Prisma.StepperUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload>
          }
          deleteMany: {
            args: Prisma.StepperDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StepperUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StepperUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload>[]
          }
          upsert: {
            args: Prisma.StepperUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StepperPayload>
          }
          aggregate: {
            args: Prisma.StepperAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStepper>
          }
          groupBy: {
            args: Prisma.StepperGroupByArgs<ExtArgs>
            result: $Utils.Optional<StepperGroupByOutputType>[]
          }
          count: {
            args: Prisma.StepperCountArgs<ExtArgs>
            result: $Utils.Optional<StepperCountAggregateOutputType> | number
          }
        }
      }
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>
        fields: Prisma.TransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransaction>
          }
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionCountAggregateOutputType> | number
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
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
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
    tab?: TabOmit
    stepper?: StepperOmit
    transaction?: TransactionOmit
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
   * Count Type TabCountOutputType
   */

  export type TabCountOutputType = {
    Stepper: number
  }

  export type TabCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Stepper?: boolean | TabCountOutputTypeCountStepperArgs
  }

  // Custom InputTypes
  /**
   * TabCountOutputType without action
   */
  export type TabCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TabCountOutputType
     */
    select?: TabCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TabCountOutputType without action
   */
  export type TabCountOutputTypeCountStepperArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StepperWhereInput
  }


  /**
   * Count Type StepperCountOutputType
   */

  export type StepperCountOutputType = {
    Transaction: number
  }

  export type StepperCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Transaction?: boolean | StepperCountOutputTypeCountTransactionArgs
  }

  // Custom InputTypes
  /**
   * StepperCountOutputType without action
   */
  export type StepperCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StepperCountOutputType
     */
    select?: StepperCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * StepperCountOutputType without action
   */
  export type StepperCountOutputTypeCountTransactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tab
   */

  export type AggregateTab = {
    _count: TabCountAggregateOutputType | null
    _min: TabMinAggregateOutputType | null
    _max: TabMaxAggregateOutputType | null
  }

  export type TabMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    name: string | null
  }

  export type TabMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    name: string | null
  }

  export type TabCountAggregateOutputType = {
    id: number
    createdAt: number
    name: number
    _all: number
  }


  export type TabMinAggregateInputType = {
    id?: true
    createdAt?: true
    name?: true
  }

  export type TabMaxAggregateInputType = {
    id?: true
    createdAt?: true
    name?: true
  }

  export type TabCountAggregateInputType = {
    id?: true
    createdAt?: true
    name?: true
    _all?: true
  }

  export type TabAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tab to aggregate.
     */
    where?: TabWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tabs to fetch.
     */
    orderBy?: TabOrderByWithRelationInput | TabOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TabWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tabs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tabs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tabs
    **/
    _count?: true | TabCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TabMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TabMaxAggregateInputType
  }

  export type GetTabAggregateType<T extends TabAggregateArgs> = {
        [P in keyof T & keyof AggregateTab]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTab[P]>
      : GetScalarType<T[P], AggregateTab[P]>
  }




  export type TabGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TabWhereInput
    orderBy?: TabOrderByWithAggregationInput | TabOrderByWithAggregationInput[]
    by: TabScalarFieldEnum[] | TabScalarFieldEnum
    having?: TabScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TabCountAggregateInputType | true
    _min?: TabMinAggregateInputType
    _max?: TabMaxAggregateInputType
  }

  export type TabGroupByOutputType = {
    id: string
    createdAt: Date
    name: string
    _count: TabCountAggregateOutputType | null
    _min: TabMinAggregateOutputType | null
    _max: TabMaxAggregateOutputType | null
  }

  type GetTabGroupByPayload<T extends TabGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TabGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TabGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TabGroupByOutputType[P]>
            : GetScalarType<T[P], TabGroupByOutputType[P]>
        }
      >
    >


  export type TabSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    name?: boolean
    Stepper?: boolean | Tab$StepperArgs<ExtArgs>
    _count?: boolean | TabCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tab"]>

  export type TabSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    name?: boolean
  }, ExtArgs["result"]["tab"]>

  export type TabSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    name?: boolean
  }, ExtArgs["result"]["tab"]>

  export type TabSelectScalar = {
    id?: boolean
    createdAt?: boolean
    name?: boolean
  }

  export type TabOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "name", ExtArgs["result"]["tab"]>
  export type TabInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Stepper?: boolean | Tab$StepperArgs<ExtArgs>
    _count?: boolean | TabCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TabIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TabIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TabPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tab"
    objects: {
      Stepper: Prisma.$StepperPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      name: string
    }, ExtArgs["result"]["tab"]>
    composites: {}
  }

  type TabGetPayload<S extends boolean | null | undefined | TabDefaultArgs> = $Result.GetResult<Prisma.$TabPayload, S>

  type TabCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TabFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TabCountAggregateInputType | true
    }

  export interface TabDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tab'], meta: { name: 'Tab' } }
    /**
     * Find zero or one Tab that matches the filter.
     * @param {TabFindUniqueArgs} args - Arguments to find a Tab
     * @example
     * // Get one Tab
     * const tab = await prisma.tab.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TabFindUniqueArgs>(args: SelectSubset<T, TabFindUniqueArgs<ExtArgs>>): Prisma__TabClient<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tab that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TabFindUniqueOrThrowArgs} args - Arguments to find a Tab
     * @example
     * // Get one Tab
     * const tab = await prisma.tab.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TabFindUniqueOrThrowArgs>(args: SelectSubset<T, TabFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TabClient<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tab that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TabFindFirstArgs} args - Arguments to find a Tab
     * @example
     * // Get one Tab
     * const tab = await prisma.tab.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TabFindFirstArgs>(args?: SelectSubset<T, TabFindFirstArgs<ExtArgs>>): Prisma__TabClient<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tab that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TabFindFirstOrThrowArgs} args - Arguments to find a Tab
     * @example
     * // Get one Tab
     * const tab = await prisma.tab.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TabFindFirstOrThrowArgs>(args?: SelectSubset<T, TabFindFirstOrThrowArgs<ExtArgs>>): Prisma__TabClient<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tabs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TabFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tabs
     * const tabs = await prisma.tab.findMany()
     * 
     * // Get first 10 Tabs
     * const tabs = await prisma.tab.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tabWithIdOnly = await prisma.tab.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TabFindManyArgs>(args?: SelectSubset<T, TabFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tab.
     * @param {TabCreateArgs} args - Arguments to create a Tab.
     * @example
     * // Create one Tab
     * const Tab = await prisma.tab.create({
     *   data: {
     *     // ... data to create a Tab
     *   }
     * })
     * 
     */
    create<T extends TabCreateArgs>(args: SelectSubset<T, TabCreateArgs<ExtArgs>>): Prisma__TabClient<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tabs.
     * @param {TabCreateManyArgs} args - Arguments to create many Tabs.
     * @example
     * // Create many Tabs
     * const tab = await prisma.tab.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TabCreateManyArgs>(args?: SelectSubset<T, TabCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tabs and returns the data saved in the database.
     * @param {TabCreateManyAndReturnArgs} args - Arguments to create many Tabs.
     * @example
     * // Create many Tabs
     * const tab = await prisma.tab.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tabs and only return the `id`
     * const tabWithIdOnly = await prisma.tab.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TabCreateManyAndReturnArgs>(args?: SelectSubset<T, TabCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tab.
     * @param {TabDeleteArgs} args - Arguments to delete one Tab.
     * @example
     * // Delete one Tab
     * const Tab = await prisma.tab.delete({
     *   where: {
     *     // ... filter to delete one Tab
     *   }
     * })
     * 
     */
    delete<T extends TabDeleteArgs>(args: SelectSubset<T, TabDeleteArgs<ExtArgs>>): Prisma__TabClient<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tab.
     * @param {TabUpdateArgs} args - Arguments to update one Tab.
     * @example
     * // Update one Tab
     * const tab = await prisma.tab.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TabUpdateArgs>(args: SelectSubset<T, TabUpdateArgs<ExtArgs>>): Prisma__TabClient<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tabs.
     * @param {TabDeleteManyArgs} args - Arguments to filter Tabs to delete.
     * @example
     * // Delete a few Tabs
     * const { count } = await prisma.tab.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TabDeleteManyArgs>(args?: SelectSubset<T, TabDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tabs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TabUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tabs
     * const tab = await prisma.tab.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TabUpdateManyArgs>(args: SelectSubset<T, TabUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tabs and returns the data updated in the database.
     * @param {TabUpdateManyAndReturnArgs} args - Arguments to update many Tabs.
     * @example
     * // Update many Tabs
     * const tab = await prisma.tab.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tabs and only return the `id`
     * const tabWithIdOnly = await prisma.tab.updateManyAndReturn({
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
    updateManyAndReturn<T extends TabUpdateManyAndReturnArgs>(args: SelectSubset<T, TabUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tab.
     * @param {TabUpsertArgs} args - Arguments to update or create a Tab.
     * @example
     * // Update or create a Tab
     * const tab = await prisma.tab.upsert({
     *   create: {
     *     // ... data to create a Tab
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tab we want to update
     *   }
     * })
     */
    upsert<T extends TabUpsertArgs>(args: SelectSubset<T, TabUpsertArgs<ExtArgs>>): Prisma__TabClient<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tabs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TabCountArgs} args - Arguments to filter Tabs to count.
     * @example
     * // Count the number of Tabs
     * const count = await prisma.tab.count({
     *   where: {
     *     // ... the filter for the Tabs we want to count
     *   }
     * })
    **/
    count<T extends TabCountArgs>(
      args?: Subset<T, TabCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TabCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tab.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TabAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TabAggregateArgs>(args: Subset<T, TabAggregateArgs>): Prisma.PrismaPromise<GetTabAggregateType<T>>

    /**
     * Group by Tab.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TabGroupByArgs} args - Group by arguments.
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
      T extends TabGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TabGroupByArgs['orderBy'] }
        : { orderBy?: TabGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TabGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTabGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tab model
   */
  readonly fields: TabFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tab.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TabClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Stepper<T extends Tab$StepperArgs<ExtArgs> = {}>(args?: Subset<T, Tab$StepperArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Tab model
   */
  interface TabFieldRefs {
    readonly id: FieldRef<"Tab", 'String'>
    readonly createdAt: FieldRef<"Tab", 'DateTime'>
    readonly name: FieldRef<"Tab", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Tab findUnique
   */
  export type TabFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TabInclude<ExtArgs> | null
    /**
     * Filter, which Tab to fetch.
     */
    where: TabWhereUniqueInput
  }

  /**
   * Tab findUniqueOrThrow
   */
  export type TabFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TabInclude<ExtArgs> | null
    /**
     * Filter, which Tab to fetch.
     */
    where: TabWhereUniqueInput
  }

  /**
   * Tab findFirst
   */
  export type TabFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TabInclude<ExtArgs> | null
    /**
     * Filter, which Tab to fetch.
     */
    where?: TabWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tabs to fetch.
     */
    orderBy?: TabOrderByWithRelationInput | TabOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tabs.
     */
    cursor?: TabWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tabs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tabs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tabs.
     */
    distinct?: TabScalarFieldEnum | TabScalarFieldEnum[]
  }

  /**
   * Tab findFirstOrThrow
   */
  export type TabFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TabInclude<ExtArgs> | null
    /**
     * Filter, which Tab to fetch.
     */
    where?: TabWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tabs to fetch.
     */
    orderBy?: TabOrderByWithRelationInput | TabOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tabs.
     */
    cursor?: TabWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tabs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tabs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tabs.
     */
    distinct?: TabScalarFieldEnum | TabScalarFieldEnum[]
  }

  /**
   * Tab findMany
   */
  export type TabFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TabInclude<ExtArgs> | null
    /**
     * Filter, which Tabs to fetch.
     */
    where?: TabWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tabs to fetch.
     */
    orderBy?: TabOrderByWithRelationInput | TabOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tabs.
     */
    cursor?: TabWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tabs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tabs.
     */
    skip?: number
    distinct?: TabScalarFieldEnum | TabScalarFieldEnum[]
  }

  /**
   * Tab create
   */
  export type TabCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TabInclude<ExtArgs> | null
    /**
     * The data needed to create a Tab.
     */
    data: XOR<TabCreateInput, TabUncheckedCreateInput>
  }

  /**
   * Tab createMany
   */
  export type TabCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tabs.
     */
    data: TabCreateManyInput | TabCreateManyInput[]
  }

  /**
   * Tab createManyAndReturn
   */
  export type TabCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * The data used to create many Tabs.
     */
    data: TabCreateManyInput | TabCreateManyInput[]
  }

  /**
   * Tab update
   */
  export type TabUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TabInclude<ExtArgs> | null
    /**
     * The data needed to update a Tab.
     */
    data: XOR<TabUpdateInput, TabUncheckedUpdateInput>
    /**
     * Choose, which Tab to update.
     */
    where: TabWhereUniqueInput
  }

  /**
   * Tab updateMany
   */
  export type TabUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tabs.
     */
    data: XOR<TabUpdateManyMutationInput, TabUncheckedUpdateManyInput>
    /**
     * Filter which Tabs to update
     */
    where?: TabWhereInput
    /**
     * Limit how many Tabs to update.
     */
    limit?: number
  }

  /**
   * Tab updateManyAndReturn
   */
  export type TabUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * The data used to update Tabs.
     */
    data: XOR<TabUpdateManyMutationInput, TabUncheckedUpdateManyInput>
    /**
     * Filter which Tabs to update
     */
    where?: TabWhereInput
    /**
     * Limit how many Tabs to update.
     */
    limit?: number
  }

  /**
   * Tab upsert
   */
  export type TabUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TabInclude<ExtArgs> | null
    /**
     * The filter to search for the Tab to update in case it exists.
     */
    where: TabWhereUniqueInput
    /**
     * In case the Tab found by the `where` argument doesn't exist, create a new Tab with this data.
     */
    create: XOR<TabCreateInput, TabUncheckedCreateInput>
    /**
     * In case the Tab was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TabUpdateInput, TabUncheckedUpdateInput>
  }

  /**
   * Tab delete
   */
  export type TabDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TabInclude<ExtArgs> | null
    /**
     * Filter which Tab to delete.
     */
    where: TabWhereUniqueInput
  }

  /**
   * Tab deleteMany
   */
  export type TabDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tabs to delete
     */
    where?: TabWhereInput
    /**
     * Limit how many Tabs to delete.
     */
    limit?: number
  }

  /**
   * Tab.Stepper
   */
  export type Tab$StepperArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
    where?: StepperWhereInput
    orderBy?: StepperOrderByWithRelationInput | StepperOrderByWithRelationInput[]
    cursor?: StepperWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StepperScalarFieldEnum | StepperScalarFieldEnum[]
  }

  /**
   * Tab without action
   */
  export type TabDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tab
     */
    select?: TabSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tab
     */
    omit?: TabOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TabInclude<ExtArgs> | null
  }


  /**
   * Model Stepper
   */

  export type AggregateStepper = {
    _count: StepperCountAggregateOutputType | null
    _avg: StepperAvgAggregateOutputType | null
    _sum: StepperSumAggregateOutputType | null
    _min: StepperMinAggregateOutputType | null
    _max: StepperMaxAggregateOutputType | null
  }

  export type StepperAvgAggregateOutputType = {
    value: number | null
    gasLimit: number | null
    gasPrice: number | null
  }

  export type StepperSumAggregateOutputType = {
    value: number | null
    gasLimit: number | null
    gasPrice: number | null
  }

  export type StepperMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    tabId: string | null
    from: string | null
    to: string | null
    value: number | null
    data: string | null
    gasLimit: number | null
    gasPrice: number | null
  }

  export type StepperMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    tabId: string | null
    from: string | null
    to: string | null
    value: number | null
    data: string | null
    gasLimit: number | null
    gasPrice: number | null
  }

  export type StepperCountAggregateOutputType = {
    id: number
    createdAt: number
    tabId: number
    from: number
    to: number
    value: number
    data: number
    gasLimit: number
    gasPrice: number
    _all: number
  }


  export type StepperAvgAggregateInputType = {
    value?: true
    gasLimit?: true
    gasPrice?: true
  }

  export type StepperSumAggregateInputType = {
    value?: true
    gasLimit?: true
    gasPrice?: true
  }

  export type StepperMinAggregateInputType = {
    id?: true
    createdAt?: true
    tabId?: true
    from?: true
    to?: true
    value?: true
    data?: true
    gasLimit?: true
    gasPrice?: true
  }

  export type StepperMaxAggregateInputType = {
    id?: true
    createdAt?: true
    tabId?: true
    from?: true
    to?: true
    value?: true
    data?: true
    gasLimit?: true
    gasPrice?: true
  }

  export type StepperCountAggregateInputType = {
    id?: true
    createdAt?: true
    tabId?: true
    from?: true
    to?: true
    value?: true
    data?: true
    gasLimit?: true
    gasPrice?: true
    _all?: true
  }

  export type StepperAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stepper to aggregate.
     */
    where?: StepperWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Steppers to fetch.
     */
    orderBy?: StepperOrderByWithRelationInput | StepperOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StepperWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Steppers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Steppers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Steppers
    **/
    _count?: true | StepperCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StepperAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StepperSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StepperMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StepperMaxAggregateInputType
  }

  export type GetStepperAggregateType<T extends StepperAggregateArgs> = {
        [P in keyof T & keyof AggregateStepper]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStepper[P]>
      : GetScalarType<T[P], AggregateStepper[P]>
  }




  export type StepperGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StepperWhereInput
    orderBy?: StepperOrderByWithAggregationInput | StepperOrderByWithAggregationInput[]
    by: StepperScalarFieldEnum[] | StepperScalarFieldEnum
    having?: StepperScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StepperCountAggregateInputType | true
    _avg?: StepperAvgAggregateInputType
    _sum?: StepperSumAggregateInputType
    _min?: StepperMinAggregateInputType
    _max?: StepperMaxAggregateInputType
  }

  export type StepperGroupByOutputType = {
    id: string
    createdAt: Date
    tabId: string
    from: string
    to: string
    value: number
    data: string
    gasLimit: number
    gasPrice: number
    _count: StepperCountAggregateOutputType | null
    _avg: StepperAvgAggregateOutputType | null
    _sum: StepperSumAggregateOutputType | null
    _min: StepperMinAggregateOutputType | null
    _max: StepperMaxAggregateOutputType | null
  }

  type GetStepperGroupByPayload<T extends StepperGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StepperGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StepperGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StepperGroupByOutputType[P]>
            : GetScalarType<T[P], StepperGroupByOutputType[P]>
        }
      >
    >


  export type StepperSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    tabId?: boolean
    from?: boolean
    to?: boolean
    value?: boolean
    data?: boolean
    gasLimit?: boolean
    gasPrice?: boolean
    tab?: boolean | TabDefaultArgs<ExtArgs>
    Transaction?: boolean | Stepper$TransactionArgs<ExtArgs>
    _count?: boolean | StepperCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["stepper"]>

  export type StepperSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    tabId?: boolean
    from?: boolean
    to?: boolean
    value?: boolean
    data?: boolean
    gasLimit?: boolean
    gasPrice?: boolean
    tab?: boolean | TabDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["stepper"]>

  export type StepperSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    tabId?: boolean
    from?: boolean
    to?: boolean
    value?: boolean
    data?: boolean
    gasLimit?: boolean
    gasPrice?: boolean
    tab?: boolean | TabDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["stepper"]>

  export type StepperSelectScalar = {
    id?: boolean
    createdAt?: boolean
    tabId?: boolean
    from?: boolean
    to?: boolean
    value?: boolean
    data?: boolean
    gasLimit?: boolean
    gasPrice?: boolean
  }

  export type StepperOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "tabId" | "from" | "to" | "value" | "data" | "gasLimit" | "gasPrice", ExtArgs["result"]["stepper"]>
  export type StepperInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tab?: boolean | TabDefaultArgs<ExtArgs>
    Transaction?: boolean | Stepper$TransactionArgs<ExtArgs>
    _count?: boolean | StepperCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type StepperIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tab?: boolean | TabDefaultArgs<ExtArgs>
  }
  export type StepperIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tab?: boolean | TabDefaultArgs<ExtArgs>
  }

  export type $StepperPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Stepper"
    objects: {
      tab: Prisma.$TabPayload<ExtArgs>
      Transaction: Prisma.$TransactionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      tabId: string
      from: string
      to: string
      value: number
      data: string
      gasLimit: number
      gasPrice: number
    }, ExtArgs["result"]["stepper"]>
    composites: {}
  }

  type StepperGetPayload<S extends boolean | null | undefined | StepperDefaultArgs> = $Result.GetResult<Prisma.$StepperPayload, S>

  type StepperCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StepperFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StepperCountAggregateInputType | true
    }

  export interface StepperDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Stepper'], meta: { name: 'Stepper' } }
    /**
     * Find zero or one Stepper that matches the filter.
     * @param {StepperFindUniqueArgs} args - Arguments to find a Stepper
     * @example
     * // Get one Stepper
     * const stepper = await prisma.stepper.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StepperFindUniqueArgs>(args: SelectSubset<T, StepperFindUniqueArgs<ExtArgs>>): Prisma__StepperClient<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Stepper that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StepperFindUniqueOrThrowArgs} args - Arguments to find a Stepper
     * @example
     * // Get one Stepper
     * const stepper = await prisma.stepper.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StepperFindUniqueOrThrowArgs>(args: SelectSubset<T, StepperFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StepperClient<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Stepper that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StepperFindFirstArgs} args - Arguments to find a Stepper
     * @example
     * // Get one Stepper
     * const stepper = await prisma.stepper.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StepperFindFirstArgs>(args?: SelectSubset<T, StepperFindFirstArgs<ExtArgs>>): Prisma__StepperClient<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Stepper that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StepperFindFirstOrThrowArgs} args - Arguments to find a Stepper
     * @example
     * // Get one Stepper
     * const stepper = await prisma.stepper.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StepperFindFirstOrThrowArgs>(args?: SelectSubset<T, StepperFindFirstOrThrowArgs<ExtArgs>>): Prisma__StepperClient<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Steppers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StepperFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Steppers
     * const steppers = await prisma.stepper.findMany()
     * 
     * // Get first 10 Steppers
     * const steppers = await prisma.stepper.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stepperWithIdOnly = await prisma.stepper.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StepperFindManyArgs>(args?: SelectSubset<T, StepperFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Stepper.
     * @param {StepperCreateArgs} args - Arguments to create a Stepper.
     * @example
     * // Create one Stepper
     * const Stepper = await prisma.stepper.create({
     *   data: {
     *     // ... data to create a Stepper
     *   }
     * })
     * 
     */
    create<T extends StepperCreateArgs>(args: SelectSubset<T, StepperCreateArgs<ExtArgs>>): Prisma__StepperClient<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Steppers.
     * @param {StepperCreateManyArgs} args - Arguments to create many Steppers.
     * @example
     * // Create many Steppers
     * const stepper = await prisma.stepper.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StepperCreateManyArgs>(args?: SelectSubset<T, StepperCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Steppers and returns the data saved in the database.
     * @param {StepperCreateManyAndReturnArgs} args - Arguments to create many Steppers.
     * @example
     * // Create many Steppers
     * const stepper = await prisma.stepper.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Steppers and only return the `id`
     * const stepperWithIdOnly = await prisma.stepper.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StepperCreateManyAndReturnArgs>(args?: SelectSubset<T, StepperCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Stepper.
     * @param {StepperDeleteArgs} args - Arguments to delete one Stepper.
     * @example
     * // Delete one Stepper
     * const Stepper = await prisma.stepper.delete({
     *   where: {
     *     // ... filter to delete one Stepper
     *   }
     * })
     * 
     */
    delete<T extends StepperDeleteArgs>(args: SelectSubset<T, StepperDeleteArgs<ExtArgs>>): Prisma__StepperClient<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Stepper.
     * @param {StepperUpdateArgs} args - Arguments to update one Stepper.
     * @example
     * // Update one Stepper
     * const stepper = await prisma.stepper.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StepperUpdateArgs>(args: SelectSubset<T, StepperUpdateArgs<ExtArgs>>): Prisma__StepperClient<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Steppers.
     * @param {StepperDeleteManyArgs} args - Arguments to filter Steppers to delete.
     * @example
     * // Delete a few Steppers
     * const { count } = await prisma.stepper.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StepperDeleteManyArgs>(args?: SelectSubset<T, StepperDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Steppers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StepperUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Steppers
     * const stepper = await prisma.stepper.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StepperUpdateManyArgs>(args: SelectSubset<T, StepperUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Steppers and returns the data updated in the database.
     * @param {StepperUpdateManyAndReturnArgs} args - Arguments to update many Steppers.
     * @example
     * // Update many Steppers
     * const stepper = await prisma.stepper.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Steppers and only return the `id`
     * const stepperWithIdOnly = await prisma.stepper.updateManyAndReturn({
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
    updateManyAndReturn<T extends StepperUpdateManyAndReturnArgs>(args: SelectSubset<T, StepperUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Stepper.
     * @param {StepperUpsertArgs} args - Arguments to update or create a Stepper.
     * @example
     * // Update or create a Stepper
     * const stepper = await prisma.stepper.upsert({
     *   create: {
     *     // ... data to create a Stepper
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Stepper we want to update
     *   }
     * })
     */
    upsert<T extends StepperUpsertArgs>(args: SelectSubset<T, StepperUpsertArgs<ExtArgs>>): Prisma__StepperClient<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Steppers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StepperCountArgs} args - Arguments to filter Steppers to count.
     * @example
     * // Count the number of Steppers
     * const count = await prisma.stepper.count({
     *   where: {
     *     // ... the filter for the Steppers we want to count
     *   }
     * })
    **/
    count<T extends StepperCountArgs>(
      args?: Subset<T, StepperCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StepperCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Stepper.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StepperAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StepperAggregateArgs>(args: Subset<T, StepperAggregateArgs>): Prisma.PrismaPromise<GetStepperAggregateType<T>>

    /**
     * Group by Stepper.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StepperGroupByArgs} args - Group by arguments.
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
      T extends StepperGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StepperGroupByArgs['orderBy'] }
        : { orderBy?: StepperGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, StepperGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStepperGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Stepper model
   */
  readonly fields: StepperFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Stepper.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StepperClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tab<T extends TabDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TabDefaultArgs<ExtArgs>>): Prisma__TabClient<$Result.GetResult<Prisma.$TabPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    Transaction<T extends Stepper$TransactionArgs<ExtArgs> = {}>(args?: Subset<T, Stepper$TransactionArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Stepper model
   */
  interface StepperFieldRefs {
    readonly id: FieldRef<"Stepper", 'String'>
    readonly createdAt: FieldRef<"Stepper", 'DateTime'>
    readonly tabId: FieldRef<"Stepper", 'String'>
    readonly from: FieldRef<"Stepper", 'String'>
    readonly to: FieldRef<"Stepper", 'String'>
    readonly value: FieldRef<"Stepper", 'Float'>
    readonly data: FieldRef<"Stepper", 'String'>
    readonly gasLimit: FieldRef<"Stepper", 'Int'>
    readonly gasPrice: FieldRef<"Stepper", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Stepper findUnique
   */
  export type StepperFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
    /**
     * Filter, which Stepper to fetch.
     */
    where: StepperWhereUniqueInput
  }

  /**
   * Stepper findUniqueOrThrow
   */
  export type StepperFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
    /**
     * Filter, which Stepper to fetch.
     */
    where: StepperWhereUniqueInput
  }

  /**
   * Stepper findFirst
   */
  export type StepperFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
    /**
     * Filter, which Stepper to fetch.
     */
    where?: StepperWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Steppers to fetch.
     */
    orderBy?: StepperOrderByWithRelationInput | StepperOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Steppers.
     */
    cursor?: StepperWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Steppers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Steppers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Steppers.
     */
    distinct?: StepperScalarFieldEnum | StepperScalarFieldEnum[]
  }

  /**
   * Stepper findFirstOrThrow
   */
  export type StepperFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
    /**
     * Filter, which Stepper to fetch.
     */
    where?: StepperWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Steppers to fetch.
     */
    orderBy?: StepperOrderByWithRelationInput | StepperOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Steppers.
     */
    cursor?: StepperWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Steppers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Steppers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Steppers.
     */
    distinct?: StepperScalarFieldEnum | StepperScalarFieldEnum[]
  }

  /**
   * Stepper findMany
   */
  export type StepperFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
    /**
     * Filter, which Steppers to fetch.
     */
    where?: StepperWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Steppers to fetch.
     */
    orderBy?: StepperOrderByWithRelationInput | StepperOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Steppers.
     */
    cursor?: StepperWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Steppers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Steppers.
     */
    skip?: number
    distinct?: StepperScalarFieldEnum | StepperScalarFieldEnum[]
  }

  /**
   * Stepper create
   */
  export type StepperCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
    /**
     * The data needed to create a Stepper.
     */
    data: XOR<StepperCreateInput, StepperUncheckedCreateInput>
  }

  /**
   * Stepper createMany
   */
  export type StepperCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Steppers.
     */
    data: StepperCreateManyInput | StepperCreateManyInput[]
  }

  /**
   * Stepper createManyAndReturn
   */
  export type StepperCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * The data used to create many Steppers.
     */
    data: StepperCreateManyInput | StepperCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Stepper update
   */
  export type StepperUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
    /**
     * The data needed to update a Stepper.
     */
    data: XOR<StepperUpdateInput, StepperUncheckedUpdateInput>
    /**
     * Choose, which Stepper to update.
     */
    where: StepperWhereUniqueInput
  }

  /**
   * Stepper updateMany
   */
  export type StepperUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Steppers.
     */
    data: XOR<StepperUpdateManyMutationInput, StepperUncheckedUpdateManyInput>
    /**
     * Filter which Steppers to update
     */
    where?: StepperWhereInput
    /**
     * Limit how many Steppers to update.
     */
    limit?: number
  }

  /**
   * Stepper updateManyAndReturn
   */
  export type StepperUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * The data used to update Steppers.
     */
    data: XOR<StepperUpdateManyMutationInput, StepperUncheckedUpdateManyInput>
    /**
     * Filter which Steppers to update
     */
    where?: StepperWhereInput
    /**
     * Limit how many Steppers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Stepper upsert
   */
  export type StepperUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
    /**
     * The filter to search for the Stepper to update in case it exists.
     */
    where: StepperWhereUniqueInput
    /**
     * In case the Stepper found by the `where` argument doesn't exist, create a new Stepper with this data.
     */
    create: XOR<StepperCreateInput, StepperUncheckedCreateInput>
    /**
     * In case the Stepper was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StepperUpdateInput, StepperUncheckedUpdateInput>
  }

  /**
   * Stepper delete
   */
  export type StepperDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
    /**
     * Filter which Stepper to delete.
     */
    where: StepperWhereUniqueInput
  }

  /**
   * Stepper deleteMany
   */
  export type StepperDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Steppers to delete
     */
    where?: StepperWhereInput
    /**
     * Limit how many Steppers to delete.
     */
    limit?: number
  }

  /**
   * Stepper.Transaction
   */
  export type Stepper$TransactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    cursor?: TransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Stepper without action
   */
  export type StepperDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stepper
     */
    select?: StepperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stepper
     */
    omit?: StepperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StepperInclude<ExtArgs> | null
  }


  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  export type TransactionAvgAggregateOutputType = {
    gasUsed: number | null
  }

  export type TransactionSumAggregateOutputType = {
    gasUsed: number | null
  }

  export type TransactionMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    stepperId: string | null
    hash: string | null
    gasUsed: number | null
  }

  export type TransactionMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    stepperId: string | null
    hash: string | null
    gasUsed: number | null
  }

  export type TransactionCountAggregateOutputType = {
    id: number
    createdAt: number
    stepperId: number
    hash: number
    gasUsed: number
    _all: number
  }


  export type TransactionAvgAggregateInputType = {
    gasUsed?: true
  }

  export type TransactionSumAggregateInputType = {
    gasUsed?: true
  }

  export type TransactionMinAggregateInputType = {
    id?: true
    createdAt?: true
    stepperId?: true
    hash?: true
    gasUsed?: true
  }

  export type TransactionMaxAggregateInputType = {
    id?: true
    createdAt?: true
    stepperId?: true
    hash?: true
    gasUsed?: true
  }

  export type TransactionCountAggregateInputType = {
    id?: true
    createdAt?: true
    stepperId?: true
    hash?: true
    gasUsed?: true
    _all?: true
  }

  export type TransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Transactions
    **/
    _count?: true | TransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionMaxAggregateInputType
  }

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransaction[P]>
      : GetScalarType<T[P], AggregateTransaction[P]>
  }




  export type TransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithAggregationInput | TransactionOrderByWithAggregationInput[]
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum
    having?: TransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionCountAggregateInputType | true
    _avg?: TransactionAvgAggregateInputType
    _sum?: TransactionSumAggregateInputType
    _min?: TransactionMinAggregateInputType
    _max?: TransactionMaxAggregateInputType
  }

  export type TransactionGroupByOutputType = {
    id: string
    createdAt: Date
    stepperId: string
    hash: string
    gasUsed: number
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>
        }
      >
    >


  export type TransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    stepperId?: boolean
    hash?: boolean
    gasUsed?: boolean
    stepper?: boolean | StepperDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    stepperId?: boolean
    hash?: boolean
    gasUsed?: boolean
    stepper?: boolean | StepperDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    stepperId?: boolean
    hash?: boolean
    gasUsed?: boolean
    stepper?: boolean | StepperDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectScalar = {
    id?: boolean
    createdAt?: boolean
    stepperId?: boolean
    hash?: boolean
    gasUsed?: boolean
  }

  export type TransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "stepperId" | "hash" | "gasUsed", ExtArgs["result"]["transaction"]>
  export type TransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stepper?: boolean | StepperDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stepper?: boolean | StepperDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stepper?: boolean | StepperDefaultArgs<ExtArgs>
  }

  export type $TransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Transaction"
    objects: {
      stepper: Prisma.$StepperPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      stepperId: string
      hash: string
      gasUsed: number
    }, ExtArgs["result"]["transaction"]>
    composites: {}
  }

  type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> = $Result.GetResult<Prisma.$TransactionPayload, S>

  type TransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransactionCountAggregateInputType | true
    }

  export interface TransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Transaction'], meta: { name: 'Transaction' } }
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     * 
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransactionFindManyArgs>(args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     * 
     */
    create<T extends TransactionCreateArgs>(args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionCreateManyArgs>(args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     * 
     */
    delete<T extends TransactionDeleteArgs>(args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionUpdateArgs>(args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionDeleteManyArgs>(args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionUpdateManyArgs>(args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions and returns the data updated in the database.
     * @param {TransactionUpdateManyAndReturnArgs} args - Arguments to update many Transactions.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
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
    updateManyAndReturn<T extends TransactionUpdateManyAndReturnArgs>(args: SelectSubset<T, TransactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
    **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TransactionAggregateArgs>(args: Subset<T, TransactionAggregateArgs>): Prisma.PrismaPromise<GetTransactionAggregateType<T>>

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
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
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs['orderBy'] }
        : { orderBy?: TransactionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Transaction model
   */
  readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    stepper<T extends StepperDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StepperDefaultArgs<ExtArgs>>): Prisma__StepperClient<$Result.GetResult<Prisma.$StepperPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Transaction model
   */
  interface TransactionFieldRefs {
    readonly id: FieldRef<"Transaction", 'String'>
    readonly createdAt: FieldRef<"Transaction", 'DateTime'>
    readonly stepperId: FieldRef<"Transaction", 'String'>
    readonly hash: FieldRef<"Transaction", 'String'>
    readonly gasUsed: FieldRef<"Transaction", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
  }

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
  }

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
  }

  /**
   * Transaction updateManyAndReturn
   */
  export type TransactionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
  }

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to delete.
     */
    limit?: number
  }

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TabScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    name: 'name'
  };

  export type TabScalarFieldEnum = (typeof TabScalarFieldEnum)[keyof typeof TabScalarFieldEnum]


  export const StepperScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    tabId: 'tabId',
    from: 'from',
    to: 'to',
    value: 'value',
    data: 'data',
    gasLimit: 'gasLimit',
    gasPrice: 'gasPrice'
  };

  export type StepperScalarFieldEnum = (typeof StepperScalarFieldEnum)[keyof typeof StepperScalarFieldEnum]


  export const TransactionScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    stepperId: 'stepperId',
    hash: 'hash',
    gasUsed: 'gasUsed'
  };

  export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type TabWhereInput = {
    AND?: TabWhereInput | TabWhereInput[]
    OR?: TabWhereInput[]
    NOT?: TabWhereInput | TabWhereInput[]
    id?: StringFilter<"Tab"> | string
    createdAt?: DateTimeFilter<"Tab"> | Date | string
    name?: StringFilter<"Tab"> | string
    Stepper?: StepperListRelationFilter
  }

  export type TabOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    name?: SortOrder
    Stepper?: StepperOrderByRelationAggregateInput
  }

  export type TabWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TabWhereInput | TabWhereInput[]
    OR?: TabWhereInput[]
    NOT?: TabWhereInput | TabWhereInput[]
    createdAt?: DateTimeFilter<"Tab"> | Date | string
    name?: StringFilter<"Tab"> | string
    Stepper?: StepperListRelationFilter
  }, "id">

  export type TabOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    name?: SortOrder
    _count?: TabCountOrderByAggregateInput
    _max?: TabMaxOrderByAggregateInput
    _min?: TabMinOrderByAggregateInput
  }

  export type TabScalarWhereWithAggregatesInput = {
    AND?: TabScalarWhereWithAggregatesInput | TabScalarWhereWithAggregatesInput[]
    OR?: TabScalarWhereWithAggregatesInput[]
    NOT?: TabScalarWhereWithAggregatesInput | TabScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tab"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Tab"> | Date | string
    name?: StringWithAggregatesFilter<"Tab"> | string
  }

  export type StepperWhereInput = {
    AND?: StepperWhereInput | StepperWhereInput[]
    OR?: StepperWhereInput[]
    NOT?: StepperWhereInput | StepperWhereInput[]
    id?: StringFilter<"Stepper"> | string
    createdAt?: DateTimeFilter<"Stepper"> | Date | string
    tabId?: StringFilter<"Stepper"> | string
    from?: StringFilter<"Stepper"> | string
    to?: StringFilter<"Stepper"> | string
    value?: FloatFilter<"Stepper"> | number
    data?: StringFilter<"Stepper"> | string
    gasLimit?: IntFilter<"Stepper"> | number
    gasPrice?: IntFilter<"Stepper"> | number
    tab?: XOR<TabScalarRelationFilter, TabWhereInput>
    Transaction?: TransactionListRelationFilter
  }

  export type StepperOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    tabId?: SortOrder
    from?: SortOrder
    to?: SortOrder
    value?: SortOrder
    data?: SortOrder
    gasLimit?: SortOrder
    gasPrice?: SortOrder
    tab?: TabOrderByWithRelationInput
    Transaction?: TransactionOrderByRelationAggregateInput
  }

  export type StepperWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StepperWhereInput | StepperWhereInput[]
    OR?: StepperWhereInput[]
    NOT?: StepperWhereInput | StepperWhereInput[]
    createdAt?: DateTimeFilter<"Stepper"> | Date | string
    tabId?: StringFilter<"Stepper"> | string
    from?: StringFilter<"Stepper"> | string
    to?: StringFilter<"Stepper"> | string
    value?: FloatFilter<"Stepper"> | number
    data?: StringFilter<"Stepper"> | string
    gasLimit?: IntFilter<"Stepper"> | number
    gasPrice?: IntFilter<"Stepper"> | number
    tab?: XOR<TabScalarRelationFilter, TabWhereInput>
    Transaction?: TransactionListRelationFilter
  }, "id">

  export type StepperOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    tabId?: SortOrder
    from?: SortOrder
    to?: SortOrder
    value?: SortOrder
    data?: SortOrder
    gasLimit?: SortOrder
    gasPrice?: SortOrder
    _count?: StepperCountOrderByAggregateInput
    _avg?: StepperAvgOrderByAggregateInput
    _max?: StepperMaxOrderByAggregateInput
    _min?: StepperMinOrderByAggregateInput
    _sum?: StepperSumOrderByAggregateInput
  }

  export type StepperScalarWhereWithAggregatesInput = {
    AND?: StepperScalarWhereWithAggregatesInput | StepperScalarWhereWithAggregatesInput[]
    OR?: StepperScalarWhereWithAggregatesInput[]
    NOT?: StepperScalarWhereWithAggregatesInput | StepperScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Stepper"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Stepper"> | Date | string
    tabId?: StringWithAggregatesFilter<"Stepper"> | string
    from?: StringWithAggregatesFilter<"Stepper"> | string
    to?: StringWithAggregatesFilter<"Stepper"> | string
    value?: FloatWithAggregatesFilter<"Stepper"> | number
    data?: StringWithAggregatesFilter<"Stepper"> | string
    gasLimit?: IntWithAggregatesFilter<"Stepper"> | number
    gasPrice?: IntWithAggregatesFilter<"Stepper"> | number
  }

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    id?: StringFilter<"Transaction"> | string
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    stepperId?: StringFilter<"Transaction"> | string
    hash?: StringFilter<"Transaction"> | string
    gasUsed?: IntFilter<"Transaction"> | number
    stepper?: XOR<StepperScalarRelationFilter, StepperWhereInput>
  }

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    stepperId?: SortOrder
    hash?: SortOrder
    gasUsed?: SortOrder
    stepper?: StepperOrderByWithRelationInput
  }

  export type TransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    hash?: string
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    stepperId?: StringFilter<"Transaction"> | string
    gasUsed?: IntFilter<"Transaction"> | number
    stepper?: XOR<StepperScalarRelationFilter, StepperWhereInput>
  }, "id" | "hash">

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    stepperId?: SortOrder
    hash?: SortOrder
    gasUsed?: SortOrder
    _count?: TransactionCountOrderByAggregateInput
    _avg?: TransactionAvgOrderByAggregateInput
    _max?: TransactionMaxOrderByAggregateInput
    _min?: TransactionMinOrderByAggregateInput
    _sum?: TransactionSumOrderByAggregateInput
  }

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    OR?: TransactionScalarWhereWithAggregatesInput[]
    NOT?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Transaction"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    stepperId?: StringWithAggregatesFilter<"Transaction"> | string
    hash?: StringWithAggregatesFilter<"Transaction"> | string
    gasUsed?: IntWithAggregatesFilter<"Transaction"> | number
  }

  export type TabCreateInput = {
    id?: string
    createdAt?: Date | string
    name: string
    Stepper?: StepperCreateNestedManyWithoutTabInput
  }

  export type TabUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    name: string
    Stepper?: StepperUncheckedCreateNestedManyWithoutTabInput
  }

  export type TabUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    Stepper?: StepperUpdateManyWithoutTabNestedInput
  }

  export type TabUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    Stepper?: StepperUncheckedUpdateManyWithoutTabNestedInput
  }

  export type TabCreateManyInput = {
    id?: string
    createdAt?: Date | string
    name: string
  }

  export type TabUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type TabUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type StepperCreateInput = {
    id?: string
    createdAt?: Date | string
    from: string
    to: string
    value: number
    data: string
    gasLimit: number
    gasPrice: number
    tab: TabCreateNestedOneWithoutStepperInput
    Transaction?: TransactionCreateNestedManyWithoutStepperInput
  }

  export type StepperUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    tabId: string
    from: string
    to: string
    value: number
    data: string
    gasLimit: number
    gasPrice: number
    Transaction?: TransactionUncheckedCreateNestedManyWithoutStepperInput
  }

  export type StepperUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    from?: StringFieldUpdateOperationsInput | string
    to?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    data?: StringFieldUpdateOperationsInput | string
    gasLimit?: IntFieldUpdateOperationsInput | number
    gasPrice?: IntFieldUpdateOperationsInput | number
    tab?: TabUpdateOneRequiredWithoutStepperNestedInput
    Transaction?: TransactionUpdateManyWithoutStepperNestedInput
  }

  export type StepperUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tabId?: StringFieldUpdateOperationsInput | string
    from?: StringFieldUpdateOperationsInput | string
    to?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    data?: StringFieldUpdateOperationsInput | string
    gasLimit?: IntFieldUpdateOperationsInput | number
    gasPrice?: IntFieldUpdateOperationsInput | number
    Transaction?: TransactionUncheckedUpdateManyWithoutStepperNestedInput
  }

  export type StepperCreateManyInput = {
    id?: string
    createdAt?: Date | string
    tabId: string
    from: string
    to: string
    value: number
    data: string
    gasLimit: number
    gasPrice: number
  }

  export type StepperUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    from?: StringFieldUpdateOperationsInput | string
    to?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    data?: StringFieldUpdateOperationsInput | string
    gasLimit?: IntFieldUpdateOperationsInput | number
    gasPrice?: IntFieldUpdateOperationsInput | number
  }

  export type StepperUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tabId?: StringFieldUpdateOperationsInput | string
    from?: StringFieldUpdateOperationsInput | string
    to?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    data?: StringFieldUpdateOperationsInput | string
    gasLimit?: IntFieldUpdateOperationsInput | number
    gasPrice?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionCreateInput = {
    id?: string
    createdAt?: Date | string
    hash: string
    gasUsed: number
    stepper: StepperCreateNestedOneWithoutTransactionInput
  }

  export type TransactionUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    stepperId: string
    hash: string
    gasUsed: number
  }

  export type TransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hash?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
    stepper?: StepperUpdateOneRequiredWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stepperId?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionCreateManyInput = {
    id?: string
    createdAt?: Date | string
    stepperId: string
    hash: string
    gasUsed: number
  }

  export type TransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hash?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stepperId?: StringFieldUpdateOperationsInput | string
    hash?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
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

  export type StepperListRelationFilter = {
    every?: StepperWhereInput
    some?: StepperWhereInput
    none?: StepperWhereInput
  }

  export type StepperOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TabCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    name?: SortOrder
  }

  export type TabMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    name?: SortOrder
  }

  export type TabMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    name?: SortOrder
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

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type TabScalarRelationFilter = {
    is?: TabWhereInput
    isNot?: TabWhereInput
  }

  export type TransactionListRelationFilter = {
    every?: TransactionWhereInput
    some?: TransactionWhereInput
    none?: TransactionWhereInput
  }

  export type TransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StepperCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    tabId?: SortOrder
    from?: SortOrder
    to?: SortOrder
    value?: SortOrder
    data?: SortOrder
    gasLimit?: SortOrder
    gasPrice?: SortOrder
  }

  export type StepperAvgOrderByAggregateInput = {
    value?: SortOrder
    gasLimit?: SortOrder
    gasPrice?: SortOrder
  }

  export type StepperMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    tabId?: SortOrder
    from?: SortOrder
    to?: SortOrder
    value?: SortOrder
    data?: SortOrder
    gasLimit?: SortOrder
    gasPrice?: SortOrder
  }

  export type StepperMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    tabId?: SortOrder
    from?: SortOrder
    to?: SortOrder
    value?: SortOrder
    data?: SortOrder
    gasLimit?: SortOrder
    gasPrice?: SortOrder
  }

  export type StepperSumOrderByAggregateInput = {
    value?: SortOrder
    gasLimit?: SortOrder
    gasPrice?: SortOrder
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

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StepperScalarRelationFilter = {
    is?: StepperWhereInput
    isNot?: StepperWhereInput
  }

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    stepperId?: SortOrder
    hash?: SortOrder
    gasUsed?: SortOrder
  }

  export type TransactionAvgOrderByAggregateInput = {
    gasUsed?: SortOrder
  }

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    stepperId?: SortOrder
    hash?: SortOrder
    gasUsed?: SortOrder
  }

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    stepperId?: SortOrder
    hash?: SortOrder
    gasUsed?: SortOrder
  }

  export type TransactionSumOrderByAggregateInput = {
    gasUsed?: SortOrder
  }

  export type StepperCreateNestedManyWithoutTabInput = {
    create?: XOR<StepperCreateWithoutTabInput, StepperUncheckedCreateWithoutTabInput> | StepperCreateWithoutTabInput[] | StepperUncheckedCreateWithoutTabInput[]
    connectOrCreate?: StepperCreateOrConnectWithoutTabInput | StepperCreateOrConnectWithoutTabInput[]
    createMany?: StepperCreateManyTabInputEnvelope
    connect?: StepperWhereUniqueInput | StepperWhereUniqueInput[]
  }

  export type StepperUncheckedCreateNestedManyWithoutTabInput = {
    create?: XOR<StepperCreateWithoutTabInput, StepperUncheckedCreateWithoutTabInput> | StepperCreateWithoutTabInput[] | StepperUncheckedCreateWithoutTabInput[]
    connectOrCreate?: StepperCreateOrConnectWithoutTabInput | StepperCreateOrConnectWithoutTabInput[]
    createMany?: StepperCreateManyTabInputEnvelope
    connect?: StepperWhereUniqueInput | StepperWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type StepperUpdateManyWithoutTabNestedInput = {
    create?: XOR<StepperCreateWithoutTabInput, StepperUncheckedCreateWithoutTabInput> | StepperCreateWithoutTabInput[] | StepperUncheckedCreateWithoutTabInput[]
    connectOrCreate?: StepperCreateOrConnectWithoutTabInput | StepperCreateOrConnectWithoutTabInput[]
    upsert?: StepperUpsertWithWhereUniqueWithoutTabInput | StepperUpsertWithWhereUniqueWithoutTabInput[]
    createMany?: StepperCreateManyTabInputEnvelope
    set?: StepperWhereUniqueInput | StepperWhereUniqueInput[]
    disconnect?: StepperWhereUniqueInput | StepperWhereUniqueInput[]
    delete?: StepperWhereUniqueInput | StepperWhereUniqueInput[]
    connect?: StepperWhereUniqueInput | StepperWhereUniqueInput[]
    update?: StepperUpdateWithWhereUniqueWithoutTabInput | StepperUpdateWithWhereUniqueWithoutTabInput[]
    updateMany?: StepperUpdateManyWithWhereWithoutTabInput | StepperUpdateManyWithWhereWithoutTabInput[]
    deleteMany?: StepperScalarWhereInput | StepperScalarWhereInput[]
  }

  export type StepperUncheckedUpdateManyWithoutTabNestedInput = {
    create?: XOR<StepperCreateWithoutTabInput, StepperUncheckedCreateWithoutTabInput> | StepperCreateWithoutTabInput[] | StepperUncheckedCreateWithoutTabInput[]
    connectOrCreate?: StepperCreateOrConnectWithoutTabInput | StepperCreateOrConnectWithoutTabInput[]
    upsert?: StepperUpsertWithWhereUniqueWithoutTabInput | StepperUpsertWithWhereUniqueWithoutTabInput[]
    createMany?: StepperCreateManyTabInputEnvelope
    set?: StepperWhereUniqueInput | StepperWhereUniqueInput[]
    disconnect?: StepperWhereUniqueInput | StepperWhereUniqueInput[]
    delete?: StepperWhereUniqueInput | StepperWhereUniqueInput[]
    connect?: StepperWhereUniqueInput | StepperWhereUniqueInput[]
    update?: StepperUpdateWithWhereUniqueWithoutTabInput | StepperUpdateWithWhereUniqueWithoutTabInput[]
    updateMany?: StepperUpdateManyWithWhereWithoutTabInput | StepperUpdateManyWithWhereWithoutTabInput[]
    deleteMany?: StepperScalarWhereInput | StepperScalarWhereInput[]
  }

  export type TabCreateNestedOneWithoutStepperInput = {
    create?: XOR<TabCreateWithoutStepperInput, TabUncheckedCreateWithoutStepperInput>
    connectOrCreate?: TabCreateOrConnectWithoutStepperInput
    connect?: TabWhereUniqueInput
  }

  export type TransactionCreateNestedManyWithoutStepperInput = {
    create?: XOR<TransactionCreateWithoutStepperInput, TransactionUncheckedCreateWithoutStepperInput> | TransactionCreateWithoutStepperInput[] | TransactionUncheckedCreateWithoutStepperInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutStepperInput | TransactionCreateOrConnectWithoutStepperInput[]
    createMany?: TransactionCreateManyStepperInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type TransactionUncheckedCreateNestedManyWithoutStepperInput = {
    create?: XOR<TransactionCreateWithoutStepperInput, TransactionUncheckedCreateWithoutStepperInput> | TransactionCreateWithoutStepperInput[] | TransactionUncheckedCreateWithoutStepperInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutStepperInput | TransactionCreateOrConnectWithoutStepperInput[]
    createMany?: TransactionCreateManyStepperInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TabUpdateOneRequiredWithoutStepperNestedInput = {
    create?: XOR<TabCreateWithoutStepperInput, TabUncheckedCreateWithoutStepperInput>
    connectOrCreate?: TabCreateOrConnectWithoutStepperInput
    upsert?: TabUpsertWithoutStepperInput
    connect?: TabWhereUniqueInput
    update?: XOR<XOR<TabUpdateToOneWithWhereWithoutStepperInput, TabUpdateWithoutStepperInput>, TabUncheckedUpdateWithoutStepperInput>
  }

  export type TransactionUpdateManyWithoutStepperNestedInput = {
    create?: XOR<TransactionCreateWithoutStepperInput, TransactionUncheckedCreateWithoutStepperInput> | TransactionCreateWithoutStepperInput[] | TransactionUncheckedCreateWithoutStepperInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutStepperInput | TransactionCreateOrConnectWithoutStepperInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutStepperInput | TransactionUpsertWithWhereUniqueWithoutStepperInput[]
    createMany?: TransactionCreateManyStepperInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutStepperInput | TransactionUpdateWithWhereUniqueWithoutStepperInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutStepperInput | TransactionUpdateManyWithWhereWithoutStepperInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type TransactionUncheckedUpdateManyWithoutStepperNestedInput = {
    create?: XOR<TransactionCreateWithoutStepperInput, TransactionUncheckedCreateWithoutStepperInput> | TransactionCreateWithoutStepperInput[] | TransactionUncheckedCreateWithoutStepperInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutStepperInput | TransactionCreateOrConnectWithoutStepperInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutStepperInput | TransactionUpsertWithWhereUniqueWithoutStepperInput[]
    createMany?: TransactionCreateManyStepperInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutStepperInput | TransactionUpdateWithWhereUniqueWithoutStepperInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutStepperInput | TransactionUpdateManyWithWhereWithoutStepperInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type StepperCreateNestedOneWithoutTransactionInput = {
    create?: XOR<StepperCreateWithoutTransactionInput, StepperUncheckedCreateWithoutTransactionInput>
    connectOrCreate?: StepperCreateOrConnectWithoutTransactionInput
    connect?: StepperWhereUniqueInput
  }

  export type StepperUpdateOneRequiredWithoutTransactionNestedInput = {
    create?: XOR<StepperCreateWithoutTransactionInput, StepperUncheckedCreateWithoutTransactionInput>
    connectOrCreate?: StepperCreateOrConnectWithoutTransactionInput
    upsert?: StepperUpsertWithoutTransactionInput
    connect?: StepperWhereUniqueInput
    update?: XOR<XOR<StepperUpdateToOneWithWhereWithoutTransactionInput, StepperUpdateWithoutTransactionInput>, StepperUncheckedUpdateWithoutTransactionInput>
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

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StepperCreateWithoutTabInput = {
    id?: string
    createdAt?: Date | string
    from: string
    to: string
    value: number
    data: string
    gasLimit: number
    gasPrice: number
    Transaction?: TransactionCreateNestedManyWithoutStepperInput
  }

  export type StepperUncheckedCreateWithoutTabInput = {
    id?: string
    createdAt?: Date | string
    from: string
    to: string
    value: number
    data: string
    gasLimit: number
    gasPrice: number
    Transaction?: TransactionUncheckedCreateNestedManyWithoutStepperInput
  }

  export type StepperCreateOrConnectWithoutTabInput = {
    where: StepperWhereUniqueInput
    create: XOR<StepperCreateWithoutTabInput, StepperUncheckedCreateWithoutTabInput>
  }

  export type StepperCreateManyTabInputEnvelope = {
    data: StepperCreateManyTabInput | StepperCreateManyTabInput[]
  }

  export type StepperUpsertWithWhereUniqueWithoutTabInput = {
    where: StepperWhereUniqueInput
    update: XOR<StepperUpdateWithoutTabInput, StepperUncheckedUpdateWithoutTabInput>
    create: XOR<StepperCreateWithoutTabInput, StepperUncheckedCreateWithoutTabInput>
  }

  export type StepperUpdateWithWhereUniqueWithoutTabInput = {
    where: StepperWhereUniqueInput
    data: XOR<StepperUpdateWithoutTabInput, StepperUncheckedUpdateWithoutTabInput>
  }

  export type StepperUpdateManyWithWhereWithoutTabInput = {
    where: StepperScalarWhereInput
    data: XOR<StepperUpdateManyMutationInput, StepperUncheckedUpdateManyWithoutTabInput>
  }

  export type StepperScalarWhereInput = {
    AND?: StepperScalarWhereInput | StepperScalarWhereInput[]
    OR?: StepperScalarWhereInput[]
    NOT?: StepperScalarWhereInput | StepperScalarWhereInput[]
    id?: StringFilter<"Stepper"> | string
    createdAt?: DateTimeFilter<"Stepper"> | Date | string
    tabId?: StringFilter<"Stepper"> | string
    from?: StringFilter<"Stepper"> | string
    to?: StringFilter<"Stepper"> | string
    value?: FloatFilter<"Stepper"> | number
    data?: StringFilter<"Stepper"> | string
    gasLimit?: IntFilter<"Stepper"> | number
    gasPrice?: IntFilter<"Stepper"> | number
  }

  export type TabCreateWithoutStepperInput = {
    id?: string
    createdAt?: Date | string
    name: string
  }

  export type TabUncheckedCreateWithoutStepperInput = {
    id?: string
    createdAt?: Date | string
    name: string
  }

  export type TabCreateOrConnectWithoutStepperInput = {
    where: TabWhereUniqueInput
    create: XOR<TabCreateWithoutStepperInput, TabUncheckedCreateWithoutStepperInput>
  }

  export type TransactionCreateWithoutStepperInput = {
    id?: string
    createdAt?: Date | string
    hash: string
    gasUsed: number
  }

  export type TransactionUncheckedCreateWithoutStepperInput = {
    id?: string
    createdAt?: Date | string
    hash: string
    gasUsed: number
  }

  export type TransactionCreateOrConnectWithoutStepperInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutStepperInput, TransactionUncheckedCreateWithoutStepperInput>
  }

  export type TransactionCreateManyStepperInputEnvelope = {
    data: TransactionCreateManyStepperInput | TransactionCreateManyStepperInput[]
  }

  export type TabUpsertWithoutStepperInput = {
    update: XOR<TabUpdateWithoutStepperInput, TabUncheckedUpdateWithoutStepperInput>
    create: XOR<TabCreateWithoutStepperInput, TabUncheckedCreateWithoutStepperInput>
    where?: TabWhereInput
  }

  export type TabUpdateToOneWithWhereWithoutStepperInput = {
    where?: TabWhereInput
    data: XOR<TabUpdateWithoutStepperInput, TabUncheckedUpdateWithoutStepperInput>
  }

  export type TabUpdateWithoutStepperInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type TabUncheckedUpdateWithoutStepperInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type TransactionUpsertWithWhereUniqueWithoutStepperInput = {
    where: TransactionWhereUniqueInput
    update: XOR<TransactionUpdateWithoutStepperInput, TransactionUncheckedUpdateWithoutStepperInput>
    create: XOR<TransactionCreateWithoutStepperInput, TransactionUncheckedCreateWithoutStepperInput>
  }

  export type TransactionUpdateWithWhereUniqueWithoutStepperInput = {
    where: TransactionWhereUniqueInput
    data: XOR<TransactionUpdateWithoutStepperInput, TransactionUncheckedUpdateWithoutStepperInput>
  }

  export type TransactionUpdateManyWithWhereWithoutStepperInput = {
    where: TransactionScalarWhereInput
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyWithoutStepperInput>
  }

  export type TransactionScalarWhereInput = {
    AND?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    OR?: TransactionScalarWhereInput[]
    NOT?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    id?: StringFilter<"Transaction"> | string
    createdAt?: DateTimeFilter<"Transaction"> | Date | string
    stepperId?: StringFilter<"Transaction"> | string
    hash?: StringFilter<"Transaction"> | string
    gasUsed?: IntFilter<"Transaction"> | number
  }

  export type StepperCreateWithoutTransactionInput = {
    id?: string
    createdAt?: Date | string
    from: string
    to: string
    value: number
    data: string
    gasLimit: number
    gasPrice: number
    tab: TabCreateNestedOneWithoutStepperInput
  }

  export type StepperUncheckedCreateWithoutTransactionInput = {
    id?: string
    createdAt?: Date | string
    tabId: string
    from: string
    to: string
    value: number
    data: string
    gasLimit: number
    gasPrice: number
  }

  export type StepperCreateOrConnectWithoutTransactionInput = {
    where: StepperWhereUniqueInput
    create: XOR<StepperCreateWithoutTransactionInput, StepperUncheckedCreateWithoutTransactionInput>
  }

  export type StepperUpsertWithoutTransactionInput = {
    update: XOR<StepperUpdateWithoutTransactionInput, StepperUncheckedUpdateWithoutTransactionInput>
    create: XOR<StepperCreateWithoutTransactionInput, StepperUncheckedCreateWithoutTransactionInput>
    where?: StepperWhereInput
  }

  export type StepperUpdateToOneWithWhereWithoutTransactionInput = {
    where?: StepperWhereInput
    data: XOR<StepperUpdateWithoutTransactionInput, StepperUncheckedUpdateWithoutTransactionInput>
  }

  export type StepperUpdateWithoutTransactionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    from?: StringFieldUpdateOperationsInput | string
    to?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    data?: StringFieldUpdateOperationsInput | string
    gasLimit?: IntFieldUpdateOperationsInput | number
    gasPrice?: IntFieldUpdateOperationsInput | number
    tab?: TabUpdateOneRequiredWithoutStepperNestedInput
  }

  export type StepperUncheckedUpdateWithoutTransactionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tabId?: StringFieldUpdateOperationsInput | string
    from?: StringFieldUpdateOperationsInput | string
    to?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    data?: StringFieldUpdateOperationsInput | string
    gasLimit?: IntFieldUpdateOperationsInput | number
    gasPrice?: IntFieldUpdateOperationsInput | number
  }

  export type StepperCreateManyTabInput = {
    id?: string
    createdAt?: Date | string
    from: string
    to: string
    value: number
    data: string
    gasLimit: number
    gasPrice: number
  }

  export type StepperUpdateWithoutTabInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    from?: StringFieldUpdateOperationsInput | string
    to?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    data?: StringFieldUpdateOperationsInput | string
    gasLimit?: IntFieldUpdateOperationsInput | number
    gasPrice?: IntFieldUpdateOperationsInput | number
    Transaction?: TransactionUpdateManyWithoutStepperNestedInput
  }

  export type StepperUncheckedUpdateWithoutTabInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    from?: StringFieldUpdateOperationsInput | string
    to?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    data?: StringFieldUpdateOperationsInput | string
    gasLimit?: IntFieldUpdateOperationsInput | number
    gasPrice?: IntFieldUpdateOperationsInput | number
    Transaction?: TransactionUncheckedUpdateManyWithoutStepperNestedInput
  }

  export type StepperUncheckedUpdateManyWithoutTabInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    from?: StringFieldUpdateOperationsInput | string
    to?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    data?: StringFieldUpdateOperationsInput | string
    gasLimit?: IntFieldUpdateOperationsInput | number
    gasPrice?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionCreateManyStepperInput = {
    id?: string
    createdAt?: Date | string
    hash: string
    gasUsed: number
  }

  export type TransactionUpdateWithoutStepperInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hash?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionUncheckedUpdateWithoutStepperInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hash?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionUncheckedUpdateManyWithoutStepperInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hash?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
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