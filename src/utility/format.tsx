export function formatCode(code: string, codeType: string): string {
	// regex from https://stackoverflow.com/a/16637170
	switch (codeType) {
		case "ean13":
			return code.replace(/\B(?=(\d{6})+(?!\d))/g, " ");
		case "ean8":
			return code.replace(/\B(?=(\d{4})+(?!\d))/g, " ");
		default:
			return code;
	}
}
