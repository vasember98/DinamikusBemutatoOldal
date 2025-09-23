import { derived, get, writable } from 'svelte/store';
import type { SidebarNode, SidebarSection } from '$lib/types/sidebar';

// ──────────────────────────────────────────────────────────────────────────────
// Types for the JSON and profiles
// ──────────────────────────────────────────────────────────────────────────────

export type ProfileId = string;

// Single recursive tuple: [href|null, label, children?]
type RawNode = [href: string | null, label: string, children?: RawNode[]];

// A registry file has object root with a "menu" array
type RegistryDoc = { menu: RawNode[] } | RawNode[];

// Optional diák list for the teacher profile
export type Student = { id: string; name: string };
export const students = writable<Student[]>([]);

// Human-friendly labels for some profile ids
const labelOverrides: Record<string, string> = { tanar: 'tanár', diak: 'diák' };

// Current profile (default on boot)
export const currentProfileId = writable<ProfileId>('default');

// ──────────────────────────────────────────────────────────────────────────────
// Load all JSON registries (SSR-safe). Accepts Option B (object root),
// but also tolerates array-root files if any slip in.
// ──────────────────────────────────────────────────────────────────────────────

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

// Discovered profiles (from filenames)
export const profiles = derived(registry, ($reg) =>
  Object.keys($reg)
    .sort()
    .map((id) => ({ id, label: labelOverrides[id] ?? id }))
);

// Programmatic profile switch (falls back to 'default' if missing)
export function setProfile(id: ProfileId) {
  const ids = Object.keys(get(registry));
  currentProfileId.set(ids.includes(id) ? id : 'default');
}

// Convenience setter for dynamic students
export const setStudents = (list: Student[]) => students.set(list);

// Runtime registration/override (useful in tests or special builds)
export function registerProfile(id: ProfileId, nodes: RawNode[]) {
  registry.update((reg) => ({ ...reg, [id]: nodes }));
}

// ──────────────────────────────────────────────────────────────────────────────
// Transform RawNode[] → SidebarNode[]
// ──────────────────────────────────────────────────────────────────────────────

const slug = (s: string) =>
  s
    .normalize('NFD')
    // @ts-ignore – Unicode property escapes need ES2020+ target
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toNode = ([href, label, children]: RawNode): SidebarNode => ({
  id: slug(label),
  label,
  href: href ?? undefined,
  // clickable is derived by your SidebarItem (href presence), so we don't set it here
  children: children?.map(toNode)
});

// ──────────────────────────────────────────────────────────────────────────────
/** menuNodes: top-level SidebarNode[] for the current profile */
// ──────────────────────────────────────────────────────────────────────────────
export const menuNodes = derived(
  [currentProfileId, registry, students],
  ([$profileId, $reg, $students]) => {
    // 1) Base nodes from registry
    const nodes = ($reg[$profileId] ?? []).map(toNode);

    // 2) Teacher injection into the "Diákok" group (if present)
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
