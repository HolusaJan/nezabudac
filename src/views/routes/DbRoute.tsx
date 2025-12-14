import { useCallback, useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Appbar, FAB, Icon } from "react-native-paper";
import DbComponent from "../components/Db";
import {
	getAllProducts,
	Product,
	editProduct as editDbProduct,
} from "../../utility/db";
import { on as onEvent } from "../../utility/pubsub";
import DbEditComponent from "../components/DbEdit";

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		marginBottom: 32,
		right: 32,
		bottom: 0,
	},
	container: {
		flex: 1,
		marginTop: -32,
		marginRight: 16,
		marginLeft: 16,
	},
});

export const DbRoute = ({
	onScanViewChange,
}: {
	onScanViewChange?: () => void;
}) => {
	const [products, setProducts] = useState<Product[]>(getAllProducts);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		const handler = () => setProducts(getAllProducts());
		const unsub = onEvent("productsChanged", handler);
		return () => unsub();
	}, []);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setProducts(getAllProducts());
		setRefreshing(false);
	}, []);

	const [selectedProductEdit, selectProductEdit] = useState<Product | null>(
		null
	);

	const editProduct = (oldCode: string, p: Product): void => {
		try {
			editDbProduct(oldCode, p);
		} catch (_e) {
			// ignore
		}
		// refresh local state and close editor
		//setProducts(getAllProducts());
		selectProductEdit(null);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Appbar.Header>
				<Icon source="database" size={24} />
				<Appbar.Content title="Database" titleStyle={{ fontWeight: 700 }} />
			</Appbar.Header>
			<ScrollView>
				{selectedProductEdit == null ? (
					<DbComponent
						products={products}
						onProductChange={selectProductEdit}
					/>
				) : (
					<DbEditComponent
						product={selectedProductEdit}
						onProductChange={selectProductEdit}
						onProductEdit={editProduct}
					/>
				)}
			</ScrollView>
			<FAB
				icon="barcode-scan"
				label="Scan a barcode"
				style={styles.fab}
				onPress={onScanViewChange}
			/>
		</SafeAreaView>
	);
};
