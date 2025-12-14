import Storage from "expo-sqlite/kv-store";
import { emit } from "./pubsub";

export interface Product {
	code: string;
	code_type: string;
	product_name: string;
	product_manufacturer: string;
	image_ref?: string | null;
}

export function createProduct(p: {
	code: string;
	code_type: string;
	product_name: string;
	product_manufacturer: string;
	image_ref?: string | null;
}): Product {
	return {
		code: p.code,
		code_type: p.code_type,
		product_name: p.product_name,
		product_manufacturer: p.product_manufacturer,
		image_ref: p.image_ref ?? null,
	};
}

export function initDb() {
	const sample = createProduct({
		code: "4058172694974",
		code_type: "ean13",
		product_name: "Melatonin Plus Schlaf-Komplex",
		product_manufacturer: "Mivolis (drogerie-markt)",
		image_ref: null,
	});

	// store products as a JSON array in the kv-store
	try {
		const existing = Storage.getItemSync("products");
		if (!existing) {
			Storage.setItemSync("products", JSON.stringify([sample]));
		} else {
			// if already present, ensure sample exists (no-op otherwise)
			try {
				const arr = JSON.parse(existing as string) as Product[];
				const found = arr.find((r) => r.code === sample.code);
				if (!found) {
					arr.push(sample);
					Storage.setItemSync("products", JSON.stringify(arr));
				}
			} catch {
				// if parsing failed, overwrite with sample
				Storage.setItemSync("products", JSON.stringify([sample]));
			}
		}
	} catch (err) {
		// kv-store might not be available in some environments; log and continue
		// fallback: no-op
		// console.error('initDb storage error', err);
	}
}

export function getProductByCode(code: string): Product | null {
	try {
		const raw = Storage.getItemSync("products");
		if (!raw) return null;
		const arr = JSON.parse(raw as string) as Product[];
		const found = arr.find((p) => p.code === code);
		return found ?? null;
	} catch (err) {
		// parsing error or storage unavailable
		return null;
	}
}

export function getAllProducts(): Product[] {
	try {
		const raw = Storage.getItemSync("products");
		if (!raw) return [];
		const arr = JSON.parse(raw as string) as Product[];
		return Array.isArray(arr) ? arr : [];
	} catch (err) {
		return [];
	}
}

export function addProduct(product: Product): void {
	try {
		const raw = Storage.getItemSync("products");
		let arr: Product[] = [];
		if (raw) {
			try {
				arr = JSON.parse(raw as string) as Product[];
			} catch {
				arr = [];
			}
		}
		const idx = arr.findIndex((p) => p.code === product.code);
		if (idx >= 0) {
			// replace existing
			arr[idx] = product;
		} else {
			arr.push(product);
		}
		Storage.setItemSync("products", JSON.stringify(arr));
		try {
			emit("productsChanged");
		} catch (_e) {
			// ignore
		}
	} catch (err) {
		// ignore or log depending on environment
	}
}

export function editProduct(code: string, product: Product): void {
	try {
		const raw = Storage.getItemSync("products");
		let arr: Product[] = [];
		if (raw) {
			try {
				arr = JSON.parse(raw as string) as Product[];
			} catch {
				arr = [];
			}
		}

		// remove any existing entry with the oldCode (if different)
		arr = arr.filter((p) => p.code !== code);

		// if there's an entry with the new product.code, replace it, otherwise add
		const idx = arr.findIndex((p) => p.code === product.code);
		if (idx >= 0) {
			arr[idx] = product;
		} else {
			arr.push(product);
		}

		Storage.setItemSync("products", JSON.stringify(arr));
		try {
			emit("productsChanged");
		} catch (_e) {
			// ignore
		}
	} catch (err) {
		// ignore
	}
}

export default { createProduct, initDb, getProductByCode, addProduct };
