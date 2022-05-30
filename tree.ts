import { boolean } from "fp-ts";
import { Just, Maybe, Nothing } from "./maybe";
import { curry, FunctionInputType, FunctionOutputType } from "./src/common";

namespace I {
	export interface Node<A> {
		readonly tag: "node",
		readonly value: A,
		readonly children: Array<Tree<A>>
	}

	export interface Empty {
		readonly tag: "empty"
	}

	export type Tree<A> = Empty | Node<A>

	export const Node = <A>(value: A, children: Array<Tree<A>>): Tree<A> => ({ tag: 'node', value, children });
	export const Empty: Tree<any> = ({ tag: "empty" });
  
	export const map =
    <A, B>(fab: (a: A) => B) =>
      (t: Tree<A>): Tree<B> => {
        switch (t.tag) {
        case 'node':
			return Node(fab(t.value), t.children.map(map(fab)));
        default:
          	return t;
        }
      };

	const filterChildren = <A>(f: (a: A) => boolean) => 
	  (children: Array<Tree<A>>): Array<Tree<A>> => {
		  return children.reduce(
			  (acc: Array<Tree<A>>, curr: Tree<A>): Array<Tree<A>> => {
				  const filtered = filter(f)(curr);
				  return filtered.tag !== "empty" ? [...acc, filtered] : acc
			  }, []
		  )
	  }

	export const filter =
	  <A>(f: (a: A) => boolean) => 
	  	(t: Tree<A>): Tree<A> => {
			  switch(t.tag) {
				case "node":
					return f(t.value) 
						? Node(t.value, filterChildren(f)(t.children))
						: Empty;
				default:
					return t;
			  }
		  }

    const findChild = <A>(f: (a: A) => boolean) =>
		 (children: Array<Tree<A>>): Maybe<A> => {
			return children.reduce(
				(acc: Maybe<A>, curr: Tree<A>): Maybe<A> => acc.tag !== "just" ? find(f)(curr) : acc, 
				Nothing)
		  }

	export const find = 
		  <A>(f: (a: A) => boolean) => 
		  	(t: Tree<A>): Maybe<A> => {
				  switch(t.tag) {
					  case "node":
						  return f(t.value) 
						  	? Just(t.value)
							: findChild(f)(t.children)
					  default:
						  return Nothing;
				  }
			  }
	
	export const flatten =
		<A>(t: Tree<A>): Array<A> => {
			switch(t.tag) {
				case "node":
					return [t.value, ...t.children.flatMap(child => flatten(child))]
				default:
					return [];
			}
		}


	export const getValue = <A>(t: Tree<A>): Maybe<A> => {
		switch(t.tag) {
			case "node": 
				return Just(t.value);
			default:
				return Nothing;
			}
		}

		export const getOrElse =
    <A>(def: A) =>
      (m: Tree<A>): A => {
        switch (m.tag) {
        case 'node':
          return m.value;
        default:
          return def;
        }
      };


	export const join = <A>(t: Tree<Tree<A>>): Tree<A> => {
		switch(t.tag) {
			case "node": {
				const { value, children } = t;
				switch(value.tag) {
					case "node":
						return I.Node(
								value.value, 
								[...value.children, 
								...children.map(join) ])
					default:
						return value;
				}
			}
			default:
				return t;
		}
	}

	export const defaultTo =
    <A>(def: A) =>
      (m: Tree<A>): Tree<A> => {
        switch (m.tag) {
        case 'node':
          return m;
        default:
          return Node(def, []);
        }
      };

	  export const toString = <A>(t: Tree<A>) => {
		  switch(t.tag) {
			  case "node":
				  return `Node(${t.value}, ${t.children})`;
			  default:
				  return "Empty";
		  }
	  }
}

export interface Tree<A> {
	readonly value: A | undefined;
	readonly tag: I.Tree<A>["tag"];
	readonly tree: I.Tree<A>;
	get: () => A | undefined;
	map: <B>(fab: (a: A) => B) => Tree<B>;
	chain: <B>(fab: (a: A) => Tree<B>) => Tree<B>;
	apply: (v: Tree<FunctionInputType<A>>) => Tree<FunctionOutputType<A>>;
	filter: (f: (a: A) => boolean) => Tree<A>;
	find: (f: (a: A) => boolean) => Maybe<A>;
	default: (def: A) => Tree<A>;
	getOrElse: (def: A) => A;
	flatten: () => Array<A>;
	toString: () => string;
}

type TreeType<T> = T extends Tree<infer Y> ? T : never;

type TreeTypeConstruct<
  A extends readonly Tree<any>[] | Record<string | symbol | number, Tree<any>>
> = { -readonly [P in keyof A]: TreeType<A[P]> };


const TreeConstructor = <A>(tree: I.Tree<A>): Tree<A> => ({
	tree,
	tag: tree.tag,
	value: I.getValue(tree).value,
	map: (fab) => map(fab, tree),
	chain: (fab) => chain(fab, tree),
	apply: (v) => chain(apply(v), tree),
	filter: (f) => TreeConstructor(I.filter(f)(tree)),
	find: (f) => I.find(f)(tree),
	flatten: () => I.flatten(tree),
	default: (def) => TreeConstructor(I.defaultTo(def)(tree)),
	toString: () => I.toString(tree),
	get: () => I.getValue(tree).value,
	getOrElse: (def) => I.getOrElse(def)(tree)
  });

  export const Node = <A>(v: A, children: Array<Tree<A>>): Tree<A> => TreeConstructor(
	  I.Node(v, children.map(c => c.tree))
  );

export const Empty: Tree<any> = TreeConstructor(I.Empty);
  
  const map = <A, B>(fab: (a: A) => B, m: I.Tree<A>): Tree<B> =>
  TreeConstructor(I.map(fab)(m));

  const chain = <A, B>(fab: (a: A) => Tree<B>, t: I.Tree<A>): Tree<B> => {
	switch(t.tag) {
		case "node": {	
			return TreeConstructor(
				I.join(
					I.Node(
						fab(t.value).tree, 
						t.children.map(I.map((a: A) => fab(a).tree))
					)
				)
			)
		}
		default:
			return TreeConstructor(t);
	}
  };

  const apply =
  <A>(a: Tree<FunctionInputType<A>>) =>
    (f: A): Tree<FunctionOutputType<A>> =>
      a.map((v) =>
        typeof f === 'function'
          ? curry(f as unknown as (...args: any[]) => any)(v)
          : v
      );

export const join = <A>(t: Tree<Tree<A>>): Tree<A> => t.chain(tt => tt);

export const Tree = {
	Node,
	Empty,
	join,
} as const;
	  