import { derived, get, writable } from 'svelte/store';
import type { SidebarNode, SidebarSection } from '$lib/types/sidebar';

export type ProfileId = string;

type RawNode = [href: string | null, label: string, children?: RawNode[]];
type RegistryDoc = { menu: RawNode[] } | RawNode[];

export type Student = { id: string; name: string };

export const students = writable<Student[]>([]);

const labelOverrides: Record<string, string> = { 
  tanar: 'tanár', 
  diak: 'diák' 
};

export const currentProfileId = writable<ProfileId>('default');

const menuRegistryModules = import.meta.glob('$lib/menuRegistry/*.json', { eager: true });

function extractMenuArray(mod: any): RawNode[] {
  const data = (mod as any).default as RegistryDoc;
  
  if (Array.isArray(data)) {
    return data as RawNode[];
  }
  
  if (data && Array.isArray((data as any).menu)) {
    return (data as any).menu as RawNode[];
  }
  
  console.warn('[menus] Invalid registry JSON shape:', data);
  return [];
}

function loadAllMenus(): Record<ProfileId, RawNode[]> {
  const menuRegistry: Record<ProfileId, RawNode[]> = {};
  
  for (const [filePath, module] of Object.entries(menuRegistryModules)) {
    const fileName = filePath.split('/').pop() || '';
    const profileId = fileName.replace(/\.json$/i, '');
    
    menuRegistry[profileId] = extractMenuArray(module);
  }
  
  return menuRegistry;
}

const registry = writable<Record<ProfileId, RawNode[]>>(loadAllMenus());

export const profiles = derived(registry, ($reg) => Object.keys($reg));

export function switchProfile(id: ProfileId) {
  const allProfiles = get(registry);
  const targetProfile = id in allProfiles ? id : 'default';
  currentProfileId.set(targetProfile);
}

export function setStudents(list: Student[]) {
  students.set(list);
}

export function registerProfile(id: ProfileId, menu: RawNode[]) {
  registry.update((current) => {
    return { 
      ...current, 
      [id]: menu 
    };
  });
}

function makeSlug(label: string): string {
  const normalized = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  const slugified = normalized.replace(/\s+/g, '-');
  
  return slugified;
}
function convertToNode(raw: RawNode, parentId?: string): SidebarNode {
  const [href, label, children] = raw;
  
  let nodeId: string;
  if (parentId) {
    const labelSlug = makeSlug(label);
    nodeId = `${parentId}-${labelSlug}`;
  } else {
    nodeId = makeSlug(label);
  }
  
  const node: SidebarNode = {
    id: nodeId,
    label: label,
    href: href || undefined
  };
  
  if (children && children.length > 0) {
    node.children = children.map((childRaw) => convertToNode(childRaw, nodeId));
  }
  
  return node;
}

export const menuNodes = derived(
  [currentProfileId, registry, students],
  ([$profileId, $reg, $students]) => {
    const profileMenu = $reg[$profileId] ?? [];
    const baseNodes = profileMenu.map((raw) => convertToNode(raw));
    
    if ($profileId === 'tanar' && $students.length > 0) {
      const diakokSlug = makeSlug('Diákok');
      
      const nodesToSearch: SidebarNode[] = [...baseNodes];
      
      while (nodesToSearch.length > 0) {
        const currentNode = nodesToSearch.pop()!;
        
        if (currentNode.id === diakokSlug) {
          const existingChildren = currentNode.children ?? [];
          
          const studentNodes = $students.map((student) => {
            return {
              id: `student-${student.id}`,
              label: student.name,
              href: `/tanar/diakok/${student.id}`
            };
          });
          
          currentNode.children = [
            ...existingChildren,
            ...studentNodes
          ];
          
          break;
        }
        
        if (currentNode.children) {
          nodesToSearch.push(...currentNode.children);
        }
      }
    }
    
    return baseNodes;
  }
);
