export type PropDataType =
	| "boolean"
	| "string"
	| "number"
	| "array"
	| "map"
	| "set"
	| "object"
	| "null"
	| "undefined"
	| "function"
	| "bigint"
	| "vnode"
	| "blob"
	| "symbol";

export interface PropData {
	id: string;
	name: string;
	type: PropDataType;
	value: any;
	editable: boolean;
	depth: number;
	meta: any;
	children: string[];
}

export function parseProps(
	data: any,
	path: string,
	limit: number,
	depth = 0,
	name = path,
	out = new Map<string, PropData>(),
): Map<string, PropData> {
	if (depth >= limit) {
		out.set(path, {
			depth,
			name,
			id: path,
			type: "string",
			editable: false,
			value: "…",
			children: [],
			meta: null,
		});
		return out;
	}

	if (Array.isArray(data)) {
		const children: string[] = [];
		out.set(path, {
			depth,
			name,
			id: path,
			type: "array",
			editable: false,
			value: data,
			children,
			meta: null,
		});
		data.forEach((item, i) => {
			const childPath = `${path}.${i}`;
			children.push(childPath);
			parseProps(item, childPath, limit, depth + 1, "" + i, out);
		});
	} else if (data instanceof Set) {
		// TODO: We're dealing with serialized data here, not a Set object
		out.set(path, {
			depth,
			name,
			id: path,
			type: "set",
			editable: false,
			value: "Set",
			children: [],
			meta: null,
		});
	} else if (typeof data === "object") {
		if (data === null) {
			out.set(path, {
				depth,
				name,
				id: path,
				type: "null",
				editable: false,
				value: data,
				children: [],
				meta: null,
			});
		} else {
			const maybeCustom = Object.keys(data).length === 2;
			// Functions are encoded as objects
			if (
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "function"
			) {
				out.set(path, {
					depth,
					name,
					id: path,
					type: "function",
					editable: false,
					value: data,
					children: [],
					meta: null,
				});
			} else if (
				// Same for vnodes
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "vnode"
			) {
				out.set(path, {
					depth,
					name,
					id: path,
					type: "vnode",
					editable: false,
					value: data,
					children: [],
					meta: null,
				});
			} else if (
				// Same for Set
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "set"
			) {
				out.set(path, {
					depth,
					name,
					id: path,
					type: "set",
					editable: false,
					value: data,
					children: [],
					meta: null,
				});
			} else if (
				// Same for Map
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "map"
			) {
				out.set(path, {
					depth,
					name,
					id: path,
					type: "map",
					editable: false,
					value: data,
					children: [],
					meta: null,
				});
			} else if (
				// Same for Blobs
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "blob"
			) {
				out.set(path, {
					depth,
					name,
					id: path,
					type: "blob",
					editable: false,
					value: data,
					children: [],
					meta: null,
				});
			} else if (
				// Same for Symbols
				maybeCustom &&
				typeof data.name === "string" &&
				data.type === "symbol"
			) {
				out.set(path, {
					depth,
					name,
					id: path,
					type: "symbol",
					editable: false,
					value: data,
					children: [],
					meta: null,
				});
			} else {
				const node: PropData = {
					depth,
					name,
					id: path,
					type: "object",
					editable: false,
					value: data,
					children: [],
					meta: null,
				};
				out.set(path, node);

				Object.keys(data).forEach(key => {
					const nextPath = `${path}.${key}`;
					node.children.push(nextPath);
					parseProps(data[key], nextPath, limit, depth + 1, key, out);
				});

				out.set(path, node);
			}
		}
	} else {
		const type = typeof data;
		out.set(path, {
			depth,
			name,
			id: path,
			type: type as any,
			editable: type !== "undefined" && data !== "[[Circular]]",
			value: data,
			children: [],
			meta: null,
		});
	}

	return out;
}
