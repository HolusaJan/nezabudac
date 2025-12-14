import { StyleSheet, View } from "react-native";
import { Material3Scheme } from "@pchmn/expo-material3-theme";
import { MD3Theme, Text, useTheme } from "react-native-paper";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, Provider as PaperProvider } from "react-native-paper";
import { MainView } from "./views/MainView";
import React, { useState } from "react";
import { ScanView } from "./views/ScanView";
import { initDb } from "./utility/db";
import { useFonts } from "expo-font";

export const useAppTheme = useTheme<MD3Theme & { colors: Material3Scheme }>;

export default function App() {
	const colorScheme = useColorScheme();
	const { theme } = useMaterial3Theme({ fallbackSourceColor: "#1e66f5" });
	const paperTheme = { ...MD3DarkTheme, colors: theme.dark };
	const cascadiaMonoLoaded = useFonts({
		"Cascadia Mono": require("./assets/fonts/CascadiaMono-VariableFont_wght.ttf"),
	});

	if (!cascadiaMonoLoaded) {
		return (
			<View>
				<Text>Loading fonts...</Text>
			</View>
		);
	}
	/*
  const paperTheme = useMemo(
    () =>
    colorScheme === 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light },
    [colorScheme, theme]
    );
    */

	const [viewIndex, setViewIndex] = useState(0);

	initDb();

	if (viewIndex == 0) {
		return (
			<PaperProvider theme={paperTheme}>
				<MainView onScanViewChange={() => setViewIndex(1)} />
			</PaperProvider>
		);
	} else if (viewIndex == 1) {
		return (
			<PaperProvider theme={paperTheme}>
				<ScanView onMainViewChange={() => setViewIndex(0)} />
			</PaperProvider>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});
