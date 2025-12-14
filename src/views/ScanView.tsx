import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
	Text,
	Button,
	Portal,
	Dialog,
	Card,
	Avatar,
	ActivityIndicator,
	Surface,
	FAB,
	useTheme,
	TextInput,
	Icon,
	Divider,
	IconButton,
} from "react-native-paper";
import {
	CameraView,
	BarcodeScanningResult,
	useCameraPermissions,
} from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	addProduct,
	createProduct,
	getProductByCode,
	Product,
} from "../utility/db";
import { addListProduct, updateListProduct } from "../utility/list";
import { getProductAPI } from "../utility/api";
import moment from "moment";
import { DatePickerModal } from "react-native-paper-dates";
import React from "react";
import { formatCode } from "../utility/format";

export const ScanView = ({
	onMainViewChange,
}: {
	onMainViewChange?: () => void;
}) => {
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
	const [data, setData] = useState<string>("");
	const [type, setType] = useState<string>("");
	const [permission, requestPermission] = useCameraPermissions();
	const [scan, setScan] = useState(true);
	const [loading, setLoading] = useState(true);

	const [product, setProduct] = useState<Product | null>(null);
	const [isNewProduct, setNewProduct] = useState(true);

	const [amount, setAmount] = useState<number>(1);
	const [expiresDate, setExpiresDate] = useState<Date | undefined>(new Date());
	const [notes, setNotes] = useState<string>("");
	const [open, setOpen] = useState(false);

	if (!permission) {
		// Camera permissions are still loading.
		return <View style={styles.resultContainer} />;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet.
		return (
			<View style={styles.resultContainer}>
				<Text variant="bodyLarge">
					We need your permission to use{" "}
					<Text style={{ color: theme.colors.secondary }}>your camera</Text> in
					order to{" "}
					<Text style={{ color: theme.colors.secondary }}>scan a barcode</Text>.
				</Text>
				<Button mode="contained" icon="camera" onPress={requestPermission}>
					Grant Camera Permission
				</Button>
			</View>
		);
	}

	async function decodeBarcode(barcodeResult: BarcodeScanningResult) {
		setScan(false);
		setBarcodeText(barcodeResult);
		let p = await getProductByCode(barcodeResult.data);
		// if not found locally, try fetching from the API
		if (p == null) p = await getProductAPI(barcodeResult);
		if (p != null) {
			setProduct(p);
			setNewProduct(false);
		} else {
			// create a new product with required fields; use the scanned barcode type if available
			const newProduct = createProduct({
				code: barcodeResult.data,
				code_type: barcodeResult.type,
				product_name: "",
				product_manufacturer: "",
				image_ref: null,
			});
			setProduct(newProduct);
		}
		setLoading(false);
	}

	function setBarcodeText(result: BarcodeScanningResult) {
		setData(result.data);
		setType(result.type);
	}
	function resetText() {
		setData((current) => (current = ""));
		setType((current) => (current = ""));
		setLoading(true);
		setScan(true);
		setNewProduct(true);
		setAmount(1);
		setExpiresDate(new Date());
		setNotes("");
	}
	function onConfirmExistingProduct() {
		if (product != null) {
			// Ensure product is persisted locally (covers API-fetched products)
			addProduct(product);
			const entry = addListProduct(product);
			if (entry) {
				const updated = {
					...entry,
					amount: amount ?? entry.amount,
					expiresAt: expiresDate ? expiresDate.toISOString() : entry.expiresAt,
					notes: notes ?? entry.notes,
				};
				try {
					updateListProduct(JSON.stringify(updated));
				} catch (_e) {
					// ignore
				}
			}
		}
		onMainViewChange?.();
	}
	function onConfirmNewProduct() {
		if (product != null) {
			// Ensure the product is stored in the DB before adding a list entry
			addProduct(product);
			const entry = addListProduct(product);
			if (entry) {
				const updated = {
					...entry,
					amount: amount ?? entry.amount,
					expiresAt: expiresDate ? expiresDate.toISOString() : entry.expiresAt,
					notes: notes ?? entry.notes,
				};
				try {
					updateListProduct(JSON.stringify(updated));
				} catch (_e) {
					// ignore
				}
			}
		}
		onMainViewChange?.();
	}

	if (scan) {
		return (
			<View style={styles.container}>
				<CameraView
					style={styles.camera}
					facing="back"
					barcodeScannerSettings={{
						barcodeTypes: ["ean13", "ean8", "upc_e", "upc_a", "codabar"],
					}}
					onBarcodeScanned={decodeBarcode}
				></CameraView>
				<SafeAreaView style={styles.onTopOfCamera}>
					<FAB
						icon="close"
						style={styles.fab}
						variant="secondary"
						onPress={onMainViewChange}
					/>
				</SafeAreaView>
			</View>
		);
	} else {
		if (loading) {
			return (
				<SafeAreaView style={styles.resultContainer}>
					<ActivityIndicator animating={true} size="large" />
				</SafeAreaView>
			);
		} else {
			if (isNewProduct) {
				const LeftContent = (props: any) => (
					<Avatar.Icon
						{...props}
						icon="barcode"
						style={{ backgroundColor: theme.colors.error }}
						color={theme.colors.onError}
					/>
				);
				return (
					<SafeAreaView style={styles.resultContainer}>
						<Card>
							<Card.Title
								title={formatCode(data, type)}
								subtitle={type}
								titleStyle={styles.cardCode}
								left={LeftContent}
							/>
							<Card.Content>
								<Text variant="titleLarge">New DB Entry</Text>
								<TextInput
									mode="outlined"
									label="Product Name"
									value={product?.product_name ?? ""}
									onChangeText={(text) =>
										setProduct((prev) =>
											prev
												? { ...prev, product_name: text }
												: ({ product_name: text } as Product)
										)
									}
								/>
								<TextInput
									mode="outlined"
									label="Product Manufacturer"
									value={product?.product_manufacturer ?? ""}
									onChangeText={(text) =>
										setProduct((prev) =>
											prev
												? { ...prev, product_manufacturer: text }
												: ({ product_manufacturer: text } as Product)
										)
									}
								/>
								<TextInput
									mode="outlined"
									label="Amount"
									value={String(amount)}
									keyboardType="numeric"
									onChangeText={(text) => setAmount(Number(text) || 0)}
									style={{ marginTop: 12 }}
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
										{expiresDate
											? moment.utc(expiresDate).local().format("LL")
											: "undefined"}
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
									value={notes}
									onChangeText={(t) => setNotes(t)}
									style={{ marginTop: 12 }}
								/>
							</Card.Content>
							<Card.Actions>
								<Button icon="camera" onPress={resetText} mode="outlined">
									Scan again
								</Button>
								<Button
									icon="cancel"
									mode="contained"
									buttonColor={theme.colors.error}
									textColor={theme.colors.onError}
									onPress={onMainViewChange}
								>
									Cancel
								</Button>
								<Button icon="plus" onPress={onConfirmNewProduct}>
									Add to DB & List
								</Button>
							</Card.Actions>
						</Card>
						<DatePickerModal
							locale="dynamic"
							mode="single"
							visible={open}
							onDismiss={() => setOpen(false)}
							date={expiresDate}
							onConfirm={(date) => {
								setExpiresDate(date.date);
								setOpen(false);
							}}
						/>
					</SafeAreaView>
				);
			} else {
				// not a new product
				const LeftContent = (props: any) => (
					<Avatar.Icon {...props} icon="barcode" />
				);
				return (
					<SafeAreaView style={styles.resultContainer}>
						<Card>
							<Card.Title
								title={formatCode(data, type)}
								subtitle={type}
								titleStyle={styles.cardCode}
								subtitleStyle={styles.cardCode}
								left={LeftContent}
							/>
							<Card.Content>
								<Text variant="titleLarge">{product?.product_name ?? ""}</Text>
								<Text variant="titleMedium">
									{product?.product_manufacturer ?? ""}
								</Text>
								<TextInput
									mode="outlined"
									label="Amount"
									value={String(amount)}
									keyboardType="numeric"
									onChangeText={(text) => setAmount(Number(text) || 0)}
									style={{ marginTop: 12 }}
								/>
								<View
									style={{
										display: "flex",
										flexDirection: "row",
										alignItems: "center",
										gap: 16,
										marginTop: 16,
									}}
								>
									<Text style={{ color: theme.colors.onSurfaceVariant }}>
										Expiry Date:
									</Text>
									<Button
										icon="calendar-today"
										onPress={() => setOpen(true)}
										mode="outlined"
										textColor={theme.colors.secondary}
										style={{ borderColor: theme.colors.secondary }}
									>
										{expiresDate
											? moment.utc(expiresDate).local().format("LL")
											: "undefined"}
									</Button>
									<View
										style={{ display: "flex", flexDirection: "row" }}
									></View>
								</View>
								<TextInput
									mode="outlined"
									label="Notes"
									value={notes}
									onChangeText={(t) => setNotes(t)}
									style={{ marginTop: 12 }}
								/>
							</Card.Content>
							<Card.Actions>
								<Button icon="camera" onPress={resetText} mode="outlined">
									Scan again
								</Button>
								<Button
									icon="cancel"
									mode="contained"
									buttonColor={theme.colors.error}
									textColor={theme.colors.onError}
									onPress={onMainViewChange}
								>
									Cancel
								</Button>
								<Button icon="plus" onPress={onConfirmExistingProduct}>
									Add to List
								</Button>
							</Card.Actions>
						</Card>
						<DatePickerModal
							locale="dynamic"
							mode="single"
							visible={open}
							onDismiss={() => setOpen(false)}
							date={expiresDate}
							onConfirm={(date) => {
								setExpiresDate(date.date);
								setOpen(false);
							}}
						/>
					</SafeAreaView>
				);
			}
		}
	}
};
