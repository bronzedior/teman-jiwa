// Browser-local data store that replaced Firebase. Every collection is a JSON
// array in localStorage, so the app runs with no backend.
// shortcut: data lives only in this browser, swap these functions for API calls when a backend exists.

const PREFIX = "temanjiwa:";
const listeners = new Set<() => void>();

type Row = { id: string };

function read<T extends Row>(collection: string): T[] {
    try {
        return JSON.parse(localStorage.getItem(PREFIX + collection) ?? "[]");
    } catch {
        return [];
    }
}

function write<T extends Row>(collection: string, rows: T[]) {
    localStorage.setItem(PREFIX + collection, JSON.stringify(rows));
    listeners.forEach((listener) => listener());
}

export function list<T extends Row>(collection: string): T[] {
    return read<T>(collection);
}

export function get<T extends Row>(collection: string, id: string): T | null {
    return read<T>(collection).find((row) => row.id === id) ?? null;
}

export function insert<T extends Row>(
    collection: string,
    data: Omit<T, "id"> & { id?: string }
): string {
    const row = { ...data, id: data.id ?? crypto.randomUUID() } as T;
    write(collection, [...read<T>(collection), row]);
    return row.id;
}

export function update<T extends Row>(
    collection: string,
    id: string,
    patch: Partial<T>
) {
    const rows = read<T>(collection);
    if (!rows.some((row) => row.id === id)) {
        throw new Error(`${collection}/${id} not found`);
    }
    write(
        collection,
        rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
}

export function remove(collection: string, id: string) {
    write(
        collection,
        read(collection).filter((row) => row.id !== id)
    );
}

// Fires on every write in this tab and on writes from other tabs.
export function subscribe(listener: () => void): () => void {
    const onStorage = (e: StorageEvent) => {
        if (e.key?.startsWith(PREFIX)) listener();
    };
    listeners.add(listener);
    window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
    };
}

const SESSION_KEY = PREFIX + "session";

export function getSessionUserId(): string {
    return localStorage.getItem(SESSION_KEY) ?? "";
}

export function setSessionUserId(userId: string) {
    if (userId) localStorage.setItem(SESSION_KEY, userId);
    else localStorage.removeItem(SESSION_KEY);
    listeners.forEach((listener) => listener());
}
