declare module 'oslo/password' {
	export class Argon2id {
		constructor(options?: {
			memorySize?: number;
			iterations?: number;
			tagLength?: number;
			parallelism?: number;
			secret?: ArrayBuffer | Uint8Array;
		});
		hash(password: string): Promise<string>;
		verify(hash: string, password: string): Promise<boolean>;
	}
}
