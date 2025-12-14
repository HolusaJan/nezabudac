type Handler = (...args: any[]) => void;

const map = new Map<string, Set<Handler>>();

export function on(event: string, handler: Handler) {
	let set = map.get(event);
	if (!set) {
		set = new Set();
		map.set(event, set);
	}
	set.add(handler);
	return () => off(event, handler);
}

export function off(event: string, handler: Handler) {
	const set = map.get(event);
	if (!set) return;
	set.delete(handler);
	if (set.size === 0) map.delete(event);
}

export function emit(event: string, ...args: any[]) {
	const set = map.get(event);
	if (!set) return;
	// copy to array to avoid mutation during iteration
	const handlers = Array.from(set);
	for (const h of handlers) {
		try {
			h(...args);
		} catch (_e) {
			// swallow handler errors
		}
	}
}

export default { on, off, emit };
