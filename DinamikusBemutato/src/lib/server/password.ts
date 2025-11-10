// src/lib/server/password.ts
import { Argon2id } from 'oslo/password';

const hasher = new Argon2id();

export async function hashPassword(password: string): Promise<string> {
	if (!password) throw new Error('Password is required');
	return await hasher.hash(password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	if (!password || !hash) return false;
	return await hasher.verify(hash, password);
}
