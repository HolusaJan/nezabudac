import React from "react";
import { StyleSheet, View } from "react-native";
import { List, Divider, useTheme, IconButton } from "react-native-paper";
import { Product } from "../../utility/db";

export const DbProductRow = ({
	product,
	onPress,
}: {
	product: Product;
	onPress?: () => void;
}) => {
	const theme = useTheme();
	const styles = StyleSheet.create({
		right: { alignItems: "flex-end", justifyContent: "center" },
		codeStyle: { fontFamily: "Cascadia Mono", color: theme.colors.secondary },
	});

	return (
		<View>
			<List.Item
				title={product.product_name}
				description={product.product_manufacturer}
				right={() => (
					<View style={styles.right}>
						<IconButton
							icon="pencil"
							mode="contained-tonal"
							onPress={onPress}
						/>
					</View>
				)}
				descriptionStyle={styles.codeStyle}
			/>
			<Divider />
		</View>
	);
};

export const DbComponent = ({
	products,
	onProductChange,
}: {
	products: Product[];
	onProductChange: (p: Product | null) => void;
}) => {
	return (
		<List.Section style={{marginBottom: 108}}>
			{products.map((p) => (
				<DbProductRow
					key={p.code}
					product={p}
					onPress={() => onProductChange(p)}
				/>
			))}
		</List.Section>
	);
};

export default DbComponent;
