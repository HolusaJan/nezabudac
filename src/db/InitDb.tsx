import * as SQLite from "expo-sqlite";

export interface Product {
	code: string; // primary key
	code_type: string;
	product_name: string;
	product_manufacturer: string;
	image_ref?: string | null;
}

const sql = `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS products (
	code TEXT PRIMARY KEY NOT NULL,
	code_type TEXT NOT NULL,
	product_name TEXT NOT NULL,
	product_manufacturer TEXT NOT NULL,
	image_ref TEXT
);
`;

// choose available open function at runtime
const _open: any =
	(SQLite as any).openDatabase ??
	(SQLite as any).openDatabaseAsync ??
	(SQLite as any).openDatabaseSync;
export const db: any = _open("nezabudac.db");

export async function InitDb(): Promise<void> {
	// prefer execAsync when available (some wrappers provide it), otherwise use transaction
	if (typeof db.execAsync === "function") {
		try {
			await db.execAsync(sql);
		} catch (err) {
			console.error("InitDb failed (execAsync)", err);
			throw err;
		}
		return;
	}

	return new Promise((resolve, reject) => {
		if (typeof db.transaction === "function") {
			db.transaction(
				(tx: any) => {
					tx.executeSql(
						sql,
						[],
						(_: any, _result: any) => {},
						(_: any, err: any) => {
							reject(err);
							return false;
						}
					);
				},
				(err: any) => reject(err),
				() => resolve()
			);
		} else {
			// unsupported db runtime
			reject(new Error("No supported exec or transaction on db"));
		}
	});
}

export default db;
