
## Functions

<dl>
<dt><a href="#ok">`ok(value)`</a> ⇒ <code>Result.&lt;never, T&gt;</code></dt>
<dd><p>Wrap given value to a Result value</p>
</dd>
<dt><a href="#err">`err(error)`</a> ⇒ <code>Result.&lt;Either, never&gt;</code></dt>
<dd><p>Create an error Result from given error</p>
</dd>
<dt><a href="#map">`map(fab, a)`</a> ⇒ <code>Result.&lt;E, B&gt;</code></dt>
<dd><p>Transform a Result value with a given function</p>
</dd>
</dl>

<a name="ok"></a>

## `ok(value)` ⇒ <code>Result.&lt;never, T&gt;</code>
Wrap given value to a Result value

**Kind**: global function  
**Returns**: <code>Result.&lt;never, T&gt;</code> - result value of T  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>T</code> | value to be wrapped |


* * *

<a name="err"></a>

## `err(error)` ⇒ <code>Result.&lt;Either, never&gt;</code>
Create an error Result from given error

**Kind**: global function  
**Returns**: <code>Result.&lt;Either, never&gt;</code> - error result of E  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>E</code> | error to be wrapped |


* * *

<a name="map"></a>

## `map(fab, a)` ⇒ <code>Result.&lt;E, B&gt;</code>
Transform a Result value with a given function

**Kind**: global function  
**Returns**: <code>Result.&lt;E, B&gt;</code> - result value of B  

| Param | Type | Description |
| --- | --- | --- |
| fab | <code>function</code> | mapper function from A to B |
| a | <code>Result.&lt;E, A&gt;</code> | result value of A |


* * *
