import { derived, get, writable } from 'svelte/store';
import type { SidebarNode, SidebarSection } from '$lib/types/sidebar';
export type ProfileId = string;
type RawNode = [href: string | null, label: string, children?: RawNode[]];
type RegistryDoc = { menu: RawNode[] } | RawNode[];
export type Student = { id: string; name: string };
export const students = writable<Student[]>([]);
const labelOverrides: Record<string, string> = { tanar: 'tanár', diak: 'diák' };
export const currentProfileId = writable<ProfileId>('default');
const modules = import.meta.glob('$lib/menuRegistry/*.json', { eager: true });
function normalize(mod: any): RawNode[] {
  const data = (mod as any).default as RegistryDoc;
  if (Array.isArray(data)) return data as RawNode[];
  if (data && Array.isArray((data as any).menu)) return (data as any).menu as RawNode[];
  console.warn('[menus] Invalid registry JSON shape:', data);
  return [];
}
function loadRegistry(): Record<ProfileId, RawNode[]> {
  const reg: Record<ProfileId, RawNode[]> = {};
  for (const [path, mod] of Object.entries(modules)) {
    const file = path.split('/').pop() || '';
    const id = file.replace(/\.json$/i, '');
    reg[id] = normalize(mod);
  }
  return reg;
}
const registry = writable<Record<ProfileId, RawNode[]>>(loadRegistry());
export const profiles = derived(registry, ($reg) => Object.keys($reg));
export function switchProfile(id: ProfileId) {
  const $reg = get(registry);
  currentProfileId.set(id in $reg ? id : 'default');
}
export function setStudents(list: Student[]) {
  students.set(list);
}
export function registerProfile(id: ProfileId, menu: RawNode[]) {
  registry.update((r) => ({ ...r, [id]: menu }));
}
function slug(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}
function toNode(raw: RawNode, parentId?: string): SidebarNode {
  const [href, label, children] = raw;
  const id = parentId ? `${parentId}-${slug(label)}` : slug(label);
  return {
    id,
    label,
    href: href || undefined,
    children: children?.map((c) => toNode(c, id))
  };
}
export const menuNodes = derived(
  [currentProfileId, registry, students],
  ([$profileId, $reg, $students]) => {
    const nodes = ($reg[$profileId] ?? []).map((raw) => toNode(raw));
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
