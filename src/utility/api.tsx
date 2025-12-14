import { BarcodeScanningResult } from "expo-camera";
import { createProduct, Product } from "./db";

export async function getProductAPI(
	barcodeResult: BarcodeScanningResult
): Promise<Product | null> {
	const url =
		"https://world.openfoodfacts.org/api/v2/product/" +
		barcodeResult.data +
		".json?fields=product_name,brands";
	try {
		const response = await fetch(url);
		const json = await response.json();
		return createProduct({
			code: barcodeResult.data,
			code_type: barcodeResult.type,
			product_name: json.product.product_name,
			product_manufacturer: json.product.brands,
			image_ref: null,
		});
	} catch (err) {
		// parsing error or storage unavailable
		return null;
	}
}
