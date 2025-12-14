import { useCallback, useState, useEffect } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Text, Button, FAB, Appbar, useTheme, Icon } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListComponent } from "../components/List";
import { clearList, getAllListProducts, ListProduct } from "../../utility/list";
import { on as onEvent } from "../../utility/pubsub";

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

export const ListRoute = ({
	onScanViewChange,
}: {
	onScanViewChange?: () => void;
}) => {
	const theme = useTheme();
	const [viewIndex, setViewIndex] = useState<number>(0);
	const [list, setList] = useState<ListProduct[]>(getAllListProducts);
	const [refreshing, setRefreshing] = useState(false);
	const [visibleMenu, setVisibleMenu] = useState(false);
	const openMenu = () => setVisibleMenu(true);
	const closeMenu = () => setVisibleMenu(false);

	// subscribe to list change events so we refresh immediately
	useEffect(() => {
		const handler = () => setList(getAllListProducts());
		const unsub = onEvent("listChanged", handler);
		return () => unsub();
	}, []);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setList(getAllListProducts);
		setRefreshing(false);
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			<Appbar.Header>
				<Icon source="list-box" size={24} />
				<Appbar.Content title="List" titleStyle={{ fontWeight: 700 }} />
				{list.length > 0 && (
					<Button
						icon="delete"
						mode="contained"
						buttonColor={theme.colors.error}
						textColor={theme.colors.onError}
						onPress={clearList}
					>
						Clear list
					</Button>
				)}
			</Appbar.Header>

			{list.length > 0 ? (
				<ScrollView>
					<ListComponent list={list} />
				</ScrollView>
			) : (
				<Text>It's very empty here...</Text>
			)}
			<FAB
				icon="barcode-scan"
				label="Scan a barcode"
				style={styles.fab}
				onPress={onScanViewChange}
			/>
		</SafeAreaView>
	);
};
