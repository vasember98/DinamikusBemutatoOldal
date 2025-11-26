declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
		}
	}
}
export {};
declare global {
  namespace App {
    interface PageData {
      user: App.Locals['user'];
    }
  }
   type DropDetail = { sourceId: string; targetId: string; pointer: { x: number; y: number } };
  namespace svelteHTML {
    interface HTMLAttributes<T> {
      'on:drop'?: (e: CustomEvent<DropDetail>) => void;
      'on:dragenter'?: (e: CustomEvent<any>) => void;
      'on:dragleave'?: (e: CustomEvent<any>) => void;
    }
  }
}
export {};
