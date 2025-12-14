import Storage from "expo-sqlite/kv-store";
import { Product } from "./db";
import { emit } from "./pubsub";

/**
 * List entry stored in kv-store. Each list item has an independent id
 * so that identity is not tied to the Product.code.
 */
export interface ListProduct {
	id: string;
	// reference to product in DB by its primary key (code)
	productCode: string;
	createdAt?: string; // ISO string
	expiresAt?: string;
	amount: number;
	notes?: string;
}

function makeId(): string {
	return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

export function getAllListProducts(): ListProduct[] {
	try {
		const raw = Storage.getItemSync("listProducts");
		if (!raw) return [];
		const arr = JSON.parse(raw as string) as ListProduct[];
		return Array.isArray(arr) ? arr : [];
	} catch (_err) {
		return [];
	}
}

/**
 * Add a product to the list. This creates a new ListProduct entry with a
 * generated id every time it's called, so multiple list entries can reference
 * the same Product.code independently.
 */
export function addListProduct(
	productOrCode: Product | string
): ListProduct | null {
	try {
		const raw = Storage.getItemSync("listProducts");
		let arr: ListProduct[] = [];
		if (raw) {
			try {
				arr = JSON.parse(raw as string) as ListProduct[];
				if (!Array.isArray(arr)) arr = [];
			} catch {
				arr = [];
			}
		}
		// Normalize input to a product code string
		const code =
			typeof productOrCode === "string" ? productOrCode : productOrCode.code;

		// Always create a new list entry (allow duplicates by product.code)
		const newEntry: ListProduct = {
			id: makeId(),
			productCode: code,
			createdAt: new Date().toISOString(),
			// default amount for a newly added list entry
			amount: 1,
		};
		arr.push(newEntry);
		Storage.setItemSync("listProducts", JSON.stringify(arr));
		try {
			emit("listChanged");
		} catch (_e) {
			// ignore
		}
		return newEntry;
	} catch (_err) {
		return null;
	}
}

export function removeListProduct(id: string): void {
	try {
		const raw = Storage.getItemSync("listProducts");
		if (!raw) return;
		let arr: ListProduct[];
		try {
			arr = JSON.parse(raw as string) as ListProduct[];
			if (!Array.isArray(arr)) return;
		} catch {
			return;
		}

		const filtered = arr.filter((e) => e.id !== id);
		Storage.setItemSync("listProducts", JSON.stringify(filtered));
		try {
			emit("listChanged");
		} catch (_e) {
			// ignore
		}
	} catch (_err) {
		// ignore
	}
}

export function clearList(): void {
	try {
		// Overwrite with an empty array. Using setItemSync keeps compatibility
		// with environments that may not implement removeItemSync.
		Storage.setItemSync("listProducts", JSON.stringify([]));
		try {
			emit("listChanged");
		} catch (_e) {
			// ignore
		}
	} catch (_err) {
		// ignore storage errors
	}
}

/**
 * Update an existing ListProduct entry. The function expects a JSON string
 * representing a ListProduct. If the entry with the same `id` exists it is
 * replaced with the provided fields (preserving unspecified fields where
 * applicable). Returns the updated ListProduct or null on error.
 */
export function updateListProduct(listProductJson: string): ListProduct | null {
	try {
		const parsed = JSON.parse(listProductJson) as ListProduct;
		if (!parsed || !parsed.id) return null;

		const raw = Storage.getItemSync("listProducts");
		let arr: ListProduct[] = [];
		if (raw) {
			try {
				arr = JSON.parse(raw as string) as ListProduct[];
				if (!Array.isArray(arr)) arr = [];
			} catch {
				arr = [];
			}
		}

		const idx = arr.findIndex((e) => e.id === parsed.id);
		if (idx < 0) {
			// Not found - nothing to update
			return null;
		}

		// Merge existing entry with parsed fields, favoring parsed values
		const existing = arr[idx];
		const updated: ListProduct = {
			id: existing.id,
			productCode: parsed.productCode ?? existing.productCode,
			createdAt: parsed.createdAt ?? existing.createdAt,
			expiresAt: parsed.expiresAt ?? existing.expiresAt,
			amount: parsed.amount ?? existing.amount,
			notes: parsed.notes ?? existing.notes,
		};

		arr[idx] = updated;
		Storage.setItemSync("listProducts", JSON.stringify(arr));
		try {
			emit("listChanged");
		} catch (_e) {
			// ignore
		}
		return updated;
	} catch (_err) {
		return null;
	}
}

export default {
	getAllListProducts,
	addListProduct,
	removeListProduct,
	clearList,
	updateListProduct,
};
