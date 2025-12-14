import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import {
	Text,
	useTheme,
	Card,
	TextInput,
	Button,
	Avatar,
} from "react-native-paper";
import { Product } from "../../utility/db";

const DbEditComponent = ({
	product,
	onProductChange,
	onProductEdit,
}: {
	product: Product;
	onProductChange: (p: Product | null) => void;
	onProductEdit: (oldCode: string, p: Product) => void;
}) => {
	const [localProduct, setLocalProduct] = useState<Product | null>(
		product ?? null
	);

	useEffect(() => {
		setLocalProduct(product ?? null);
	}, [product]);
	const theme = useTheme();
	const styles = StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
		},
		resultContainer: {
			flex: 1,
			justifyContent: "center",
			backgroundColor: theme.colors.background,
			padding: 16,
		},
		camera: {
			flex: 1,
		},
		onTopOfCamera: {
			position: "absolute",
			bottom: 0,
			right: 0,
		},
		surface: {
			padding: 8,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 16,
		},
		fab: {
			margin: 16,
			bottom: 64,
			right: 32,
		},
		cardCode: {
			fontFamily: "Cascadia Mono",
		},
	});

	const LeftContent = (props: any) => <Avatar.Icon {...props} icon="pencil" />;

	const onCancel = () => onProductChange(null);
	const onConfirm = () => onProductEdit(product.code, localProduct ?? product);

	return (
		<Card>
			<Card.Title
				title={localProduct?.code ?? product.code}
				subtitle={localProduct?.code_type ?? product.code_type}
				titleStyle={styles.cardCode}
				left={LeftContent}
			/>
			<Card.Content>
				<Text variant="titleLarge">Edit DB Entry</Text>
				<TextInput
					mode="outlined"
					label="Product Name"
					value={localProduct?.product_name ?? ""}
					onChangeText={(text) =>
						setLocalProduct((prev) =>
							prev
								? { ...prev, product_name: text }
								: { ...product, product_name: text }
						)
					}
				/>
				<TextInput
					mode="outlined"
					label="Product Manufacturer"
					value={localProduct?.product_manufacturer ?? ""}
					onChangeText={(text) =>
						setLocalProduct((prev) =>
							prev
								? { ...prev, product_manufacturer: text }
								: { ...product, product_manufacturer: text }
						)
					}
				/>
			</Card.Content>
			<Card.Actions>
				<Button
					icon="cancel"
					mode="contained"
					buttonColor={theme.colors.error}
					textColor={theme.colors.onError}
					onPress={onCancel}
				>
					Cancel
				</Button>
				<Button
					icon="content-save"
					onPress={() => {
						if (product == localProduct) onCancel();
						else onConfirm();
					}}
				>
					Save changes
				</Button>
			</Card.Actions>
		</Card>
	);
};

export default DbEditComponent;
