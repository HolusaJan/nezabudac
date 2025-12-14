import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { List, Divider, useTheme, IconButton } from "react-native-paper";
import {
	ListProduct,
	updateListProduct,
	removeListProduct,
} from "../../utility/list";
import { getProductByCode } from "../../utility/db";
import ListEditComponent from "./ListEdit";
import moment from "moment";

const ListProductComponent = ({
	entry,
	onEdit,
	onDelete,
}: {
	entry: ListProduct;
	onEdit: (e: ListProduct) => void;
	onDelete: (id: string) => void;
}) => {
	const theme = useTheme();
	const product = getProductByCode(entry.productCode) ?? {
		code: entry.productCode,
		code_type: "unknown",
		product_name: "Unknown product",
		product_manufacturer: "",
		image_ref: null,
	};
	const styles = StyleSheet.create({
		listItemRight: {
			flex: 0,
			flexDirection: "row",
			alignItems: "flex-end",
			justifyContent: "center",
		},
		descriptionStyle: {
			color: theme.colors.onSurfaceVariant,
		},
		rightTopStyle: {
			color: theme.colors.secondary,
		},
		rightBottomStyle: {
			color: theme.colors.tertiary,
		},
	});
	const right = (props: { color: string; style?: any }) => (
		<View style={[props?.style, styles.listItemRight]}>
			<IconButton
				icon="pencil"
				mode="contained-tonal"
				onPress={() => onEdit(entry)}
			/>
			<IconButton
				icon="delete"
				iconColor={theme.colors.onError}
				containerColor={theme.colors.error}
				mode="contained"
				onPress={() => onDelete(entry.id)}
			/>
		</View>
	);
	return (
		<View>
			<List.Item
				title={(entry.amount? (entry.amount + "x "): '') + product.product_name}
				description={entry.expiresAt? moment
					.utc(entry.expiresAt)
					.local()
					.startOf("days")
					.fromNow() : 'undefined'}
				right={right}
				descriptionStyle={styles.descriptionStyle}
			/>
			<Divider />
		</View>
	);
};

export const ListComponent = ({ list }: { list: ListProduct[] }) => {
	const [selectedEntry, setSelectedEntry] = useState<ListProduct | null>(null);

	const handleEdit = (entry: ListProduct) => setSelectedEntry(entry);

	const handleDelete = (id: string) => {
		try {
			removeListProduct(id);
		} catch (_e) {
			// ignore
		}
	};

	const handleEntryEdit = (id: string, e: ListProduct) => {
		try {
			// updateListProduct expects a JSON string
			updateListProduct(JSON.stringify(e));
		} catch (_e) {
			// ignore
		}
		setSelectedEntry(null);
	};

	return (
		<List.Section style={{marginBottom: 108}}>
			{selectedEntry == null ? (
				list.map((entry) => (
					<ListProductComponent
						key={entry.id}
						entry={entry}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				))
			) : (
				<ListEditComponent
					entry={selectedEntry}
					onEntryChange={setSelectedEntry}
					onEntryEdit={handleEntryEdit}
				/>
			)}
		</List.Section>
	);
};
