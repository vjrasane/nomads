
# Maybe

- [Signatures](#signatures)
	- [Just](#Just)
	- [Nothing](#Nothing)
- [Members](#members)
    - [map](#map)
    - [chain](#chain)
    - [fold](#fold)
    - [filter](#filter)
    - [or](#or)
    - [default](#default)
    - [toResult](#toResult)
    - [get](#get)
    - [getOrElse](#getOrElse)
    - [toString](#toString)
- [Utilities](#utilities)
	- [applyTo](#applyTo)
	- [fromOptional](#fromOptional)
	- [fromNullable](#fromNullable)
	- [fromNumber](#fromNumber)
	- [nth](#nth)
	- [first](#first)
	- [last](#last)
	- [join](#join)

## Signatures

```typescript
type Maybe<A> = Just<A> | Nothing
```

<div id="Just"></div>

### `Just: <A>(value: A) => Maybe<A>`

Creates a present `Maybe<A>` value from given value of A 

<div id="Nothing"></div>

### `Nothing: Maybe<any>`

Absent `Maybe<any>` value

* * *

## Members

<div id="map"></div>

### `map: <B>(fab: (a: A) => B) => Maybe<B>`
Transform the Maybe value with a given function

**Returns**: `Maybe<B>` - maybe value of B  

| Param | Type | Description |
| --- | --- | --- |
| fab | `(a: A) => B` | mapper function from A to B |

**Examples**:

```typescript
Just(42).map(n => n * 2) // -> Just(84)

Nothing.map(n => n * 2) // -> Nothing
```

<div id="chain"></div>

### `chain: <B>(fab: (a: A) => Maybe<B>) => Maybe<B>`
Transform the Maybe value with a given function and flatten.

**Returns**: `Maybe<B>` - maybe value of B  

| Param | Type | Description |
| --- | --- | --- |
| fab | `(a: A) => Maybe<B>` | mapper function from A to Maybe<B> |

**Examples:**

```typescript
Just([42]).chain(arr => first(arr)) // -> Just(42)

Just([]).chain(arr => first(arr)) // -> Nothing

Nothing.chain(arr => first(arr)) // -> Nothing
```

<div id="filter"></div>

### `filter: <B>(f: (a: A) => boolean) => Maybe<A>`
Apply given condition to the Maybe, return the Maybe itself if the condition returns true and otherwise return `Nothing`.

**Returns**: `Maybe<A>` - maybe value of A  

| Param | Type | Description |
| --- | --- | --- |
| f | `(a: A) => boolean` | condition for the value of A |

**Examples:**

```typescript
Just(42).filter(n => n > 0) // -> Just(42)

Just(0).filter(n => n > 0) // -> Nothing

Nothing.filter(n => n > 0) // -> Nothing
```

<div id="fold"></div>

### `fold: <B>(fab: (a: A) => B, fb: () => B) => B`
Unwraps the Maybe value, applying the first function if the value is `Just<A>` and returning the result of the second function if the value is `Nothing`

**Returns**: `B` - value of B

| Param | Type | Description |
| --- | --- | --- |
| fab | `(a: A) => B` | mapper function from A to B |
| fb | `() => B` | constant function returning B |

**Examples:**

```typescript
Just(42).fold(n => n * 2, () => 0) // -> 84

Nothing.fold(n => n * 2, () => 0) // -> 0
```
<div id="or"></div>

### `or: (a: Maybe<A>) => Maybe<A>`
Returns the first value that is present

**Returns**: `Maybe<A>` - maybe value of A

| Param | Type | Description |
| --- | --- | --- |
| a | `Maybe<A>` | maybe value of A |

```typescript
Just(42).or(Just(0)) // -> Just(42)

Just(42).or(Nothing) // -> Just(42)

Nothing.or(Just(0)) // -> Just(0)

Nothing.or(Nothing) // -> Nothing
```
<div id="default"></div>

### `default: (value: A) => Maybe<A>`
Returns the `Maybe` itself if it is `Just<A>` and returns a new `Just<A>` value containing the given default otherwise.

**Returns**: `Maybe<A>` - maybe value of A

| Param | Type | Description |
| --- | --- | --- |
| value | `A` | default value |

**Examples:**

```typescript
Just(42).default(0) // -> Just(42)

Nothing.default(0) // -> Just(0)

Nothing.default(0).default(-1) // -> Just(0)
```
<div id="get"></div>

### `get: () => A | undefined`
Unwraps the `Maybe` and returns either the present value if it is a `Just<A>` or `undefined` otherwise.

**Returns**: `A | undefined` - value of A or undefined

**Examples:**

```typescript
Just(42).get() // -> 42

Nothing.get() // -> undefined
```

<div id="getOrElse"></div>

### `getOrElse: (def: A) => A`
Unwraps the `Maybe` and returns either the present value if it is a `Just<A>` or the given default value otherwise.

**Returns**: `A` - value of A

| Param | Type | Description |
| --- | --- | --- |
| def | `A` | default value |

**Examples:**

```typescript
Just(42).getOrElse(0) // -> 42

Nothing.getOrElse(0) // -> 0
```

<div id="toResult"></div>

### `toResult: <E>(err: E) => Result<E, A>`
Transforms the `Maybe` to a `Result` value, returning `Ok<A>` if it is a `Just<A>` or `Err<E>` with the given error value otherwise.

**Returns**: `A` - value of A

| Param | Type | Description |
| --- | --- | --- |
| def | `A` | default value |

**Examples:**

```typescript
Just(42).toResult("error") // -> Ok(42)

Nothing.toResult("error") // -> Err("error")
```

<div id="toString"></div>

### `toString: () => string`
Returns a string representation of the `Maybe`

**Returns**: `string` - string representation

**Examples:**

```typescript
Just(42).toString() // -> "Just(42)"

Just(Just(42)).toString() // -> "Just(Just(42))"

Nothing.toString() // -> "Nothing"
```

* * *

## Utilities

<div id="applyTo"></div>

### `applyTo: <A, B>(a: Maybe<A>) => (f: (a: B) => B) => Maybe<B>`
Helper function to simulate applicative functor `apply`, which cannot be a direct member of this `Maybe` implementation since it might not contain a function. Returns a function that can be directly passed to `chain` of a `Maybe` containing a transform function from `A` to `B`. 

The applicative nature allows chaining the initial function lifted to the context of a `Maybe` with multiple consecutive `Maybe` values.

**Returns**: `(f: (a: B) => B) => Maybe<B>` - function passed to `chain`

| Param | Type | Description |
| --- | --- | --- |
| a | `Maybe<A>` | maybe to be applied to |

**Examples:**

```typescript
Just(a => b => a + b)
	.chain(applyTo(Just(2)))
	.chain(applyTo(Just(3))) // -> Just(5)

Just(a => b => a + b)
	.chain(Nothing)
	.chain(applyTo(Just(3))) // -> Nothing

Nothing
	.chain(applyTo(Just(2)))
	.chain(applyTo(Just(3))) // -> Nothing
```

<div id="fromOptional"></div>

### `fromOptional: <A>(a: A | undefined) => Maybe<A> `
Wraps given optional value to a `Maybe`, returning `Just<A>` if the value is present or `Nothing` otherwise.

**Returns**: `Maybe<A>` - maybe value of A

| Param | Type | Description |
| --- | --- | --- |
| a | `A | undefined` | optional A value |

**Examples:**
```typescript
fromOptional(42) // -> Just(42)

fromOptional(null) // -> Just(null)

fromOptional(undefined) // -> Nothing
```

<div id="fromNullable"></div>

### `fromNullable: <A>(a: A | null | undefined) => Maybe<A>`
Wraps given nullable value to a `Maybe`, returning `Just<A>` if the value is present or `Nothing` otherwise.

**Returns**: `Maybe<A>` - maybe value of A

| Param | Type | Description |
| --- | --- | --- |
| a | `A | null | undefined` | nullable A value |

**Examples:**
```typescript
fromNullable(42) // -> Just(42)

fromNullable(null) // -> Nothing

fromNullable(undefined) // -> Nothing
```

<div id="fromNumber"></div>

### `fromNumber: (a: number) => Maybe<A>`
Wraps given number value to a `Maybe`, returning `Just<A>` if the value is a number or `Nothing` otherwise.

**Returns**: `Maybe<A>` - maybe value of A

| Param | Type | Description |
| --- | --- | --- |
| a | `number` | number value |

**Examples:**
```typescript
fromNumber(42) // -> Just(42)

fromNumber(NaN) // -> Nothing
```

<div id="nth"></div>

### `nth: <A>(index: number, arr: Array<A>) => Maybe<A>`
Gets the value at the given index of the array, returning `Just<A>` if the value is present or `Nothing` otherwise.

**Returns**: `Maybe<A>` - maybe value of A

| Param | Type | Description |
| --- | --- | --- |
| index | `number` | array index |
| arr | `Array<A>` | array |

**Examples:**
```typescript
nth(1, [1,2,3]) // -> Just(2)

nth(1, [undefined, undefined]) // -> Nothing

nth(1, [null, null]) // -> Just(null)

nth(1, []) // -> Nothing
```

<div id="first"></div>

### `first: <A>(arr: Array<A>) => Maybe<A>`
Gets the first value of the array, returning `Just<A>` if the value is present or `Nothing` otherwise.

**Returns**: `Maybe<A>` - maybe value of A

| Param | Type | Description |
| --- | --- | --- |
| arr | `Array<A>` | array |

**Examples:**
```typescript
first([1,2,3]) // -> Just(1)

first([undefined]) // -> Nothing

first([null]) // -> Just(null)

first([]) // -> Nothing
```

<div id="last"></div>

### `last: <A>(arr: Array<A>) => Maybe<A>`
Gets the last value of the array, returning `Just<A>` if the value is present or `Nothing` otherwise.

**Returns**: `Maybe<A>` - maybe value of A

| Param | Type | Description |
| --- | --- | --- |
| arr | `Array<A>` | array |

**Examples:**
```typescript
last([1,2,3]) // -> Just(3)

last([undefined]) // -> Nothing

last([null]) // -> Just(null)

last([]) // -> Nothing
```

<div id="join"></div>

### `join: <A>(a: Maybe<Maybe<A>>) => Maybe<A>`
Flattens two nested `Maybe` values into one.

Note that it is also possible to use `chain` with an identity function to do the same. 

**Returns**: `Maybe<A>` - maybe value of A

| Param | Type | Description |
| --- | --- | --- |
| a | `Maybe<Maybe<A>>` | nested maybe value of A |

**Examples:**

```typescript
join(Just(Just(42))) // -> Just(42)

join(Just(Nothing))) // -> Nothing

join(Nothing) // -> Nothing

Just(Just(42))
	.chain(a => a) // -> Just(42)
```

<!-- ### Result

```typescript
type Result<E, T> = Ok<T> | Err<E>
```

### Either

```typescript
type Either<A, B> = Left<A> | Right<B>
```

### Tuple

```typescript
interface Tuple<A, B>
```

### RemoteData

```typescript
type RemoteData<E, T> = StandBy | Loading | Success<T> | Failure<E>
```

### Task

```typescript
interface Task<A> -->
<!-- ``` -->
