const iconColor = "#76838f";
const iconSize = 18;

export function HomeNavIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 7.5L9 2L16 7.5V16H11.5V11H6.5V16H2V7.5Z" stroke={iconColor} strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
    </svg>
  );
}

export function InboxNavIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="14" height="12" rx="1.5" stroke={iconColor} strokeWidth="1.2" fill="none"/>
      <path d="M2 11H6L7.5 13.5H10.5L12 11H16" stroke={iconColor} strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

export function PlayNavIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="7" stroke={iconColor} strokeWidth="1.2" fill="none"/>
      <path d="M7.5 6.5L12.5 9L7.5 11.5V6.5Z" fill={iconColor}/>
    </svg>
  );
}

export function CalendarNavIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3.5" width="14" height="12" rx="1.5" stroke={iconColor} strokeWidth="1.2" fill="none"/>
      <path d="M2 7.5H16" stroke={iconColor} strokeWidth="1.2"/>
      <path d="M6 2V5" stroke={iconColor} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M12 2V5" stroke={iconColor} strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="5" y="10" width="2" height="2" rx="0.5" fill={iconColor}/>
      <rect x="8" y="10" width="2" height="2" rx="0.5" fill={iconColor}/>
      <rect x="11" y="10" width="2" height="2" rx="0.5" fill={iconColor}/>
    </svg>
  );
}

export function ListNavIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="14" height="14" rx="1.5" stroke={iconColor} strokeWidth="1.2" fill="none"/>
      <path d="M5 6H13" stroke={iconColor} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M5 9H13" stroke={iconColor} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M5 12H10" stroke={iconColor} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function ToolsNavIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.5 3.5C9.8 3.5 8.5 4 8.5 5.5C8.5 7 9.5 7.8 10.5 8L7 11.5C6.5 11 5.5 10.8 4.5 11C3.2 11.3 2.5 12.5 2.5 13.5L4 12L5.5 12.5L6 14L4.5 15.5C5.5 15.5 7 14.8 7.5 13.5C7.8 12.5 7.5 11.5 7 11.5L10.5 8C11 8.5 11.8 9 13 8.5C14.5 8 15 6.5 15 5.5L13.5 7L12 6.5L11.5 5L13 3.5H10.5Z" stroke={iconColor} strokeWidth="1.1" fill="none" strokeLinejoin="round"/>
    </svg>
  );
}
