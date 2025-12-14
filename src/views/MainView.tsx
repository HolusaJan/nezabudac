import { useState } from "react";
import { BottomNavigation, Text } from "react-native-paper";
import { ListRoute } from "./routes/ListRoute";
import { SettingsRoute } from "./routes/SettingsRoute";
import { DbRoute } from "./routes/DbRoute";
import { SafeAreaView } from "react-native-safe-area-context";

export const MainView = ({
	onScanViewChange,
}: {
	onScanViewChange?: () => void;
}) => {
	const [index, setIndex] = useState(0);
	const [routes] = useState([
		{
			key: "list",
			title: "List",
			focusedIcon: "list-box",
			unfocusedIcon: "list-box-outline",
		},
		{
			key: "db",
			title: "Database",
			focusedIcon: "database",
			unfocusedIcon: "database-outline",
		},
		//{ key: 'settings', title: 'Settings', focusedIcon: 'cog', unfocusedIcon: 'cog-outline' },
	]);
	const renderScene = ({
		route,
		jumpTo,
	}: {
		route: { key: string };
		jumpTo: (key: string) => void;
	}) => {
		switch (route.key) {
			case "list":
				return <ListRoute onScanViewChange={onScanViewChange} />;
			case "db":
				return <DbRoute onScanViewChange={onScanViewChange} />;
			//case 'settings':
			//return <SettingsRoute />;
			default:
				return null;
		}
	};

	return (
		<BottomNavigation
			navigationState={{ index, routes }}
			onIndexChange={setIndex}
			renderScene={renderScene}
			shifting={true}
		/>
	);
};
