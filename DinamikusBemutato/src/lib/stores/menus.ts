import { derived, get, writable } from 'svelte/store';
import type { SidebarNode, SidebarSection } from '$lib/types/sidebar';
export type ProfileId = string;
type RawNode = [href: string | null, label: string, children?: RawNode[]];
type RegistryDoc = { menu: RawNode[] } | RawNode[];
export type Student = { id: string; name: string };
export const students = writable<Student[]>([]);
const labelOverrides: Record<string, string> = { tanar: 'tanár', diak: 'diák' };
export const currentProfileId = writable<ProfileId>('default');
const modules = import.meta.glob('$lib/menuRegistry
export const menuNodes = derived(
  [currentProfileId, registry, students],
  ([$profileId, $reg, $students]) => {
    const nodes = ($reg[$profileId] ?? []).map(toNode);
    if ($profileId === 'tanar' && $students.length) {
      const targetId = slug('Diákok');
      const stack: SidebarNode[] = [...nodes];
      while (stack.length) {
        const n = stack.pop()!;
        if (n.id === targetId) {
          n.children = [
            ...(n.children ?? []),
            ...$students.map((st) => ({
              id: `student-${st.id}`,
              label: st.name,
              href: `/tanar/diakok/${st.id}`
            }))
          ];
          break;
        }
        if (n.children) stack.push(...n.children);
      }
    }
    return nodes;
  }
);
