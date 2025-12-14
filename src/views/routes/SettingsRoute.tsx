import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
	Text,
	Button,
	Portal,
	Dialog,
	Card,
	Avatar,
	Divider,
	useTheme,
	Appbar,
	Icon,
} from "react-native-paper";
import {
	CameraView,
	BarcodeScanningResult,
	useCameraPermissions,
} from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearList } from "../../utility/list";

export const SettingsRoute = () => {
	const theme = useTheme();
	const [clearListLoading, setClearListLoading] = useState(false);
	const styles = StyleSheet.create({
		container: {
			flexDirection: "row",
			marginTop: -32,
			marginRight: 16,
			marginLeft: 16,
		},
		button: {
			width: "auto",
		},
	});
	function onClearList() {
		setClearListLoading(true);
		clearList();
		setClearListLoading(false);
	}
	return (
		<SafeAreaView>
			<ScrollView style={styles.container}>
				<Appbar.Header>
					<Icon source="cog" size={24} />
					<Appbar.Content title="Settings" titleStyle={{ fontWeight: 700 }} />
				</Appbar.Header>
			</ScrollView>
		</SafeAreaView>
	);
};
