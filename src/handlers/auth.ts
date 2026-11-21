import * as store from "@/lib/store";
import type { Role, User } from "@/types/user";

async function hashPassword(password: string): Promise<string> {
    const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(password)
    );
    return Array.from(new Uint8Array(digest), (b) =>
        b.toString(16).padStart(2, "0")
    ).join("");
}

export function getCurrUser(): User | null {
    const userId = store.getSessionUserId();
    return userId ? store.get<User>("users", userId) : null;
}

export function onAuthChange(callback: (user: User | null) => void) {
    callback(getCurrUser());
    return store.subscribe(() => callback(getCurrUser()));
}

export async function getCurrUserId(): Promise<string> {
    return getCurrUser()?.id ?? "";
}

export async function getCurrUserRole(): Promise<Role | "guest"> {
    return getCurrUser()?.role ?? "guest";
}

export const registerAccount = async (
    email: string,
    password: string,
    displayName: string,
    dateOfBirth: Date,
    isExpert: boolean
): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (store.list<User>("users").some((u) => u.email === normalizedEmail)) {
        throw new Error("Email already in use.");
    }

    store.insert<User>("users", {
        email: normalizedEmail,
        password_hash: await hashPassword(password),
        full_name: displayName,
        date_of_birth: dateOfBirth.toISOString(),
        role: isExpert ? "expert" : "user",
    });
};

export const signIn = async (
    email: string,
    password: string
): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);
    const user = store
        .list<User>("users")
        .find(
            (u) =>
                u.email === normalizedEmail && u.password_hash === passwordHash
        );
    if (!user) throw new Error("Invalid credentials. Please try again.");
    store.setSessionUserId(user.id);
};

export const signOut = async (): Promise<void> => {
    store.setSessionUserId("");
};

export async function updateCurrUserProfile(
    patch: Pick<User, "full_name" | "date_of_birth">
) {
    const user = getCurrUser();
    if (!user) throw new Error("No authenticated user found");
    store.update<User>("users", user.id, patch);
}

export async function changePassword(
    currentPassword: string,
    newPassword: string
) {
    const user = getCurrUser();
    if (!user) throw new Error("No authenticated user found");
    if (user.password_hash !== (await hashPassword(currentPassword))) {
        throw new Error("Current password is incorrect");
    }
    store.update<User>("users", user.id, {
        password_hash: await hashPassword(newPassword),
    });
}
