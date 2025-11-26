export type SidebarNode = {
  id: string;
  label: string;
  href?: string;
  clickable?: boolean;
  children?: SidebarNode[];
  collapsible?: boolean;       
  initiallyExpanded?: boolean; 
};
export type SidebarSection = {
  id: string;
  header?: string;
  href?: string;
  clickable?: boolean;
  children?: SidebarNode[];
  collapsible?: boolean;       
  initiallyExpanded?: boolean; 
};
