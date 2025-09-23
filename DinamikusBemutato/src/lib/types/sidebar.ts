/** 
 * @param href hivatkozás, nem kattintható ha false, 
 * @param collapsible becsukható-e alapból igen
 * @param initiallyExpanded alapból kinyitott-e alapból igen
 */
export type SidebarNode = {
  id: string;
  label: string;
  href?: string;
  clickable?: boolean;
  children?: SidebarNode[];
  collapsible?: boolean;       
  initiallyExpanded?: boolean; 
};

/** 
 * @param href hivatkozás, nem kattintható ha false, 
 * @param collapsible becsukható-e alapból igen
 * @param initiallyExpanded alapból kinyitott-e alapból igen
 */
export type SidebarSection = {
  id: string;
  header?: string;
  href?: string;
  clickable?: boolean;
  children?: SidebarNode[];
  collapsible?: boolean;       
  initiallyExpanded?: boolean; 
};
