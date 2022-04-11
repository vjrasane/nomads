
## Members

<dl>
<dt><a href="#nothing">`nothing`</a></dt>
<dd><p>Maybe value representing no present value</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#just">`just(value)`</a> ⇒ <code>Maybe.&lt;T&gt;</code></dt>
<dd><p>Wraps given value to a Maybe value</p>
</dd>
<dt><a href="#isJust">`isJust(value)`</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if given maybe value is Just</p>
</dd>
<dt><a href="#isNothing">`isNothing(value)`</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if given maybe value is Nothing</p>
</dd>
<dt><a href="#map">`map(fab, ma)`</a> ⇒ <code>Maybe.&lt;B&gt;</code></dt>
<dd><p>Transform a Maybe value with a given function</p>
</dd>
</dl>

<a name="nothing"></a>

## `nothing`
Maybe value representing no present value

**Kind**: global variable  

* * *

<a name="just"></a>

## `just(value)` ⇒ <code>Maybe.&lt;T&gt;</code>
Wraps given value to a Maybe value

**Kind**: global function  
**Returns**: <code>Maybe.&lt;T&gt;</code> - maybe value of T  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>T</code> | value to be wrapped |


* * *

<a name="isJust"></a>

## `isJust(value)` ⇒ <code>boolean</code>
Check if given maybe value is Just

**Kind**: global function  
**Returns**: <code>boolean</code> - whether maybe is Just  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Maybe.&lt;T&gt;</code> | value to be checked |


* * *

<a name="isNothing"></a>

## `isNothing(value)` ⇒ <code>boolean</code>
Check if given maybe value is Nothing

**Kind**: global function  
**Returns**: <code>boolean</code> - whether maybe is Nothing  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Maybe.&lt;T&gt;</code> | value to be checked |


* * *

<a name="map"></a>

## `map(fab, ma)` ⇒ <code>Maybe.&lt;B&gt;</code>
Transform a Maybe value with a given function

**Kind**: global function  
**Returns**: <code>Maybe.&lt;B&gt;</code> - maybe value of B  

| Param | Type | Description |
| --- | --- | --- |
| fab | <code>function</code> | mapper function from A to B |
| ma | <code>Maybe.&lt;A&gt;</code> | maybe value of A |


* * *
