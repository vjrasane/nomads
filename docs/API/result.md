# Result

- [Signatures](#signatures)
	- [Ok](#Ok)
	- [Err](#Err)
- [Members](#members)
    - [map](#map)
    - [chain](#chain)
    - [fold](#fold)
    - [or](#or)
    - [default](#default)
    - [get](#get)
    - [getValue](#getValue)
    - [getError](#getError)
    - [getOrElse](#getOrElse)
    - [toEither](#toEither)
    - [toMaybe](#toMaybe)
    - [toString](#toString)
- [Utilities](#utilities)
	- [applyTo](#applyTo)
	- [fromOptional](#fromOptional)
	- [fromNullable](#fromNullable)
	- [fromNumber](#fromNumber)
	- [join](#join)

## Signatures

```typescript
type Result<E, T> = Ok<T> | Err<E>
```

<div id="Ok"></div>

### `Ok: <A>(value: A) => Result<any, A>`
Creates a successful result from given value

<div id="Err"></div>

### `Err: <E>(error: E) => Result<E, any>`
Creates a unsuccessful result from given error

* * * 

## Members



<div id="map"></div>

### `map: <B>(fab: (a: A) => B) => Result<E, B>`
Transform the `Result` value with a given function

**Returns**: `Result<E, B>` - result value of B  

| Param | Type | Description |
| --- | --- | --- |
| fab | `(a: A) => B` | mapper function from A to B |

**Examples**:

```typescript
Ok(42).map(n => n * 2) // -> Ok(84)

Err("error").map(n => n * 2) // -> Err("error")
```

<div id="chain"></div>

### `chain: <B>(fab: (a: A) => Result<E, B>) => Result<E, B>`
Transform the `Result` value with a given function and flatten.

**Returns**: `Result<E, B>` - result value of B  

| Param | Type | Description |
| --- | --- | --- |
| fab | `(a: A) => Result<E, B>` | mapper function from A to result of B |

**Examples:**

```typescript
Ok(42).chain(n => Ok(n * 2)) // -> Ok(84)

Ok(42).chain(n => Err("error")) // -> Err("error")

Err("error").chain(n => Ok(n * 2)) // -> Err("error")
```

<div id="fold"></div>

### `fold: <C>(fec: (e: E) => C, fac: (a: A) => C) => C`
Unwraps the `Result` value, applying the first function if the value is `Err<E>` and applying the second function if the value is `Ok<A>`

**Returns**: `C` - value of C

| Param | Type | Description |
| --- | --- | --- |
| fec | `(e: E) => C` | mapper function from E to C |
| fac | `(a: A) => C` | mapper function from A to C |

**Examples:**

```typescript
Ok(42).fold(e => 0, n => n * 2) // -> 84

Err("error").fold(e => 0, n => n * 2) // -> 0
```
<div id="or"></div>

### `or: (a: Result<E, A>) => Result<E, A>`
Returns the first value that is successful

**Returns**: `Result<E, A>` - result value of A

| Param | Type | Description |
| --- | --- | --- |
| a | `Result<E, A>` | result value of A |

```typescript
Ok(42).or(Ok(0)) // -> Ok(42)

Ok(42).or(Err("error")) // -> Ok(42)

Err("error").or(Ok(0)) // -> Ok(0)

Error("first").or(Error("second")) // -> Err("first")
```
<div id="default"></div>

### `default: (value: A) => Result<E, A>`
Returns the `Result` itself if it is `Ok<A>` and returns a new `Ok<A>` value containing the given default otherwise.

**Returns**: `Result<E, A>` - maybe value of A

| Param | Type | Description |
| --- | --- | --- |
| value | `A` | default value |

**Examples:**

```typescript
Ok(42).default(0) // -> Ok(42)

Err("error").default(0) // -> Ok(0)

Err("error").default(0).default(-1) // -> Ok(0)
```
<div id="get"></div>

### `get: () => A | undefined`
Unwraps the `Result` and returns either the success value if it is a `Ok<A>` or `undefined` otherwise.

**Returns**: `A | undefined` - value of A or undefined

**Examples:**

```typescript
Ok(42).get() // -> 42

Err("error").get() // -> undefined
```

<div id="getValue"></div>

### `getValue: () => Maybe<A>`
Transforms the `Result` to a `Maybe` value, returning `Just<A>` if it is a `Ok<A>` or `Nothing` otherwise.

**Returns**: `Maybe<A>` - maybe value of A

**Examples:**

```typescript
Ok(42).getValue() // -> Just(42)

Err("error").getValue() // -> Nothing
```

<div id="getError"></div>

### `getError: () => Maybe<E>`
Transforms the `Result` to a `Maybe` value, returning `Just<E>` if it is a `Err<E>` or `Nothing` otherwise.

**Returns**: `Maybe<E>` - maybe value of E

**Examples:**

```typescript
Ok(42).getError() // -> Nothing

Err("error").getValue() // -> Just("error")
```

<div id="getOrElse"></div>

### `getOrElse: (def: A) => A`
Unwraps the `Result` and returns either the successful value if it is a `Ok<A>` or the given default value otherwise.

**Returns**: `A` - value of A

| Param | Type | Description |
| --- | --- | --- |
| def | `A` | default value |

**Examples:**

```typescript
Ok(42).getOrElse(0) // -> 42

Err("error").getOrElse(0) // -> 0
```

<div id="toEither"></div>

### `toEither: () => Either<E, A>`
Transforms the `Result` to an `Either` value, returning `Right<A>` if it is a `Ok<A>` or `Left<E>` otherwise.

**Returns**: `Either<E, A>` - either value of E and A

**Examples:**

```typescript
Ok(42).toEither() // -> Right(42)

Err("error").toEither() // -> Left("error")
```

<div id="toMaybe"></div>

### `toMaybe: () => Maybe<A>`
Alias for [getValue](#getValue).

**Returns**: `Maybe<A>` - maybe value of A

**Examples:**

```typescript
Ok(42).toMaybe() // -> Just(42)

Err("error").toMaybe() // -> Nothing
```

<div id="toString"></div>

### `toString: () => string`
Returns a string representation of the `Result`

**Returns**: `string` - string representation

**Examples:**

```typescript
Ok(42).toString() // -> "Ok(42)"

Ok(Ok(42)).toString() // -> "Ok(Ok(42))"

Err("error").toString() // -> "Err("error")"
```

* * *

## Utilities


<div id="applyTo"></div>

### `applyTo: <A, B, E>(a: Result<E, A>) => (f: (a: B) => B) => Result<E, B>`
Helper function to simulate applicative functor `apply`, which cannot be a direct member of this `Result` implementation since it might not contain a function. Returns a function that can be directly passed to `chain` of a `Result` containing a transform function from `A` to `B`. 

The applicative nature allows chaining the initial function lifted to the context of a `Result` with multiple consecutive `Result` values.

**Returns**: `(f: (a: B) => B) => Result<B>` - function passed to `chain`

| Param | Type | Description |
| --- | --- | --- |
| a | `Result<E, A>` | result to be applied to |

**Examples:**

```typescript
Ok(a => b => a + b)
	.chain(applyTo(Ok(2)))
	.chain(applyTo(Ok(3))) // -> Ok(5)

Ok(a => b => a + b)
	.chain(applyTo(Err("error")))
	.chain(applyTo(Ok(3))) // -> Err("error")

Err("error")
	.chain(applyTo(Ok(2))) // -> Err("error")
```


<div id="fromOptional"></div>

### `fromOptional`
To wrap an optional value to a `Result`, first wrap it to a maybe using [fromOptional](maybe.md#fromOptional) and transform to a result using [toResult](maybe.md#toResult).

**Examples:**
```typescript
fromOptional(42).toResult("error") // -> Ok(42)

fromOptional(null).toResult("error") // -> Ok(null)

fromOptional(undefined).toResult("error") // -> Err("error")
```

<div id="fromNullable"></div>

### `fromNullable`
To wrap a nullable value to a `Result`, first wrap it to a maybe using [fromNullable](maybe.md#fromNullable) and transform to a result using [toResult](maybe.md#toResult).

**Examples:**
```typescript
fromNullable(42).toResult("error") // -> Ok(42)

fromNullable(null).toResult("error") // -> Err("error")

fromNullable(undefined).toResult("error") // -> Err("error")
```

<div id="fromNumber"></div>

### `fromNumber`
To wrap a number value to a `Result`, first wrap it to a maybe using [fromNumber](maybe.md#fromNumber) and transform to a result using [toResult](maybe.md#toResult).

**Examples:**
```typescript
fromNumber(42).toResult("error") // -> Ok(42)

fromNumber(NaN).toResult("error") // -> Err("error")
```


<div id="join"></div>

### `join: <E, A>(a: Result<E, Result<E, A>>) => Result<E, A>`
Flattens two nested `Result` values into one.

Note that it is also possible to use `chain` with an identity function to do the same. 

**Returns**: `Result<E, A>` - result value of A

| Param | Type | Description |
| --- | --- | --- |
| a | `Result<E, Result<E, A>>` | nested result value of A |

**Examples:**

```typescript
join(Ok(Ok(42))) // -> Ok(42)

join(Ok(Err("error")))) // -> Err("error")

join(Err("error")) // -> Err("error")

Ok(Ok(42)).chain(a => a) // -> Ok(42)
```
