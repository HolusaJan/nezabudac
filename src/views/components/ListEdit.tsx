import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
	Card,
	Text,
	TextInput,
	Button,
	Avatar,
	useTheme,
	IconButton,
} from "react-native-paper";
import { ListProduct } from "../../utility/list";
import { getProductByCode } from "../../utility/db";
import moment from "moment";
import { DatePickerModal } from "react-native-paper-dates";
import { SafeAreaView } from "react-native-safe-area-context";

const ListEditComponent = ({
	entry,
	onEntryChange,
	onEntryEdit,
}: {
	entry: ListProduct;
	onEntryChange: (e: ListProduct | null) => void;
	onEntryEdit: (id: string, e: ListProduct) => void;
}) => {
	const [localEntry, setLocalEntry] = useState<ListProduct | null>(
		entry ?? null
	);

	useEffect(() => {
		setLocalEntry(entry ?? null);
	}, [entry]);

	const theme = useTheme();
	const styles = StyleSheet.create({
		cardCode: {
			fontFamily: "Cascadia Mono",
		},
		input: {
			marginTop: 12,
		},
	});

	const LeftContent = (props: any) => <Avatar.Icon {...props} icon="pencil" />;

	const onCancel = () => onEntryChange(null);
	const onConfirm = () => onEntryEdit(entry.id, localEntry ?? entry);

	const product = getProductByCode(entry.productCode);
	const title = product?.product_name ?? entry.productCode;
	const subtitle = entry.createdAt
		? moment.utc(entry.createdAt).local().format("LLL")
		: "";

	const [open, setOpen] = React.useState(false);

	const onDismissSingle = React.useCallback(() => {
		setOpen(false);
	}, [setOpen]);

	const onConfirmSingle = React.useCallback(
		(params: { date?: Date | undefined }) => {
			setOpen(false);
			if (params.date) {
				setLocalEntry((prev) =>
					prev ? { ...prev, expiresAt: params.date?.toISOString() } : prev
				);
			}
		},
		[setOpen, setLocalEntry]
	);

	return (
		<SafeAreaView>
			<Card>
				<Card.Title
					title={title}
					subtitle={subtitle}
					titleStyle={styles.cardCode}
					left={LeftContent}
				/>
				<Card.Content>
					<Text variant="titleLarge">Edit List Entry</Text>
					<TextInput
						mode="outlined"
						label="Amount"
						value={String(localEntry?.amount ?? entry.amount ?? "1")}
						keyboardType="numeric"
						onChangeText={(text) =>
							setLocalEntry((prev) =>
								prev
									? { ...prev, amount: Number(text) || 0 }
									: { ...entry, amount: Number(text) || 0 }
							)
						}
						style={styles.input}
					/>
					<View
						style={{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							gap: 16,
							marginTop: 10,
						}}
					>
						<Text style={{ color: theme.colors.onSurfaceVariant }}>
							Expiry Date{" "}
						</Text>
						<Text style={{ color: theme.colors.primary }}>
							{localEntry?.expiresAt
								? moment.utc(localEntry.expiresAt).local().format("LL")
								: ""}
						</Text>
						<View style={{ display: "flex", flexDirection: "row" }}>
							<IconButton
								icon="calendar-today"
								onPress={() => setOpen(true)}
								mode="outlined"
								iconColor={theme.colors.secondary}
								style={{ borderColor: theme.colors.secondary }}
							/>
						</View>
					</View>
					<TextInput
						mode="outlined"
						label="Notes"
						value={localEntry?.notes ?? entry.notes ?? ""}
						onChangeText={(text) =>
							setLocalEntry((prev) =>
								prev ? { ...prev, notes: text } : { ...entry, notes: text }
							)
						}
						style={styles.input}
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
							if (entry === localEntry) onCancel();
							else onConfirm();
						}}
					>
						Save changes
					</Button>
				</Card.Actions>
			</Card>
			<DatePickerModal
				locale="dynamic"
				mode="single"
				visible={open}
				onDismiss={onDismissSingle}
				date={
					localEntry?.expiresAt ? new Date(localEntry.expiresAt) : undefined
				}
				onConfirm={onConfirmSingle}
			/>
		</SafeAreaView>
	);
};

export default ListEditComponent;
