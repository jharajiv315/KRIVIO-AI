import {
  LayoutDashboard,
  Package,
  Camera,
  Mic,
  Menu,
  Building2,
  Store,
  Landmark,
  Crown,
  User as UserIcon,
  Settings,
  LucideIcon,
  Sparkles,
} from 'lucide-react';

export interface PrimaryNavItem {
  id: string;
  labelKey: string;
  defaultLabel: string;
  icon: LucideIcon;
  badge?: string;
  isSpecial?: boolean;
}

export interface SecondaryNavItem {
  id: string;
  labelKey: string;
  defaultLabel: string;
  descriptionKey: string;
  defaultDesc: string;
  icon: LucideIcon;
  badge?: string;
}

export interface SecondaryNavGroup {
  id: string;
  titleKey: string;
  defaultTitle: string;
  items: SecondaryNavItem[];
}

/**
 * SINGLE SOURCE OF TRUTH FOR PRIMARY NAVIGATION
 * Strictly limited to the 5 most important destinations
 */
export const PRIMARY_NAV_ITEMS: PrimaryNavItem[] = [
  {
    id: 'dashboard',
    labelKey: 'nav.dashboard',
    defaultLabel: 'Home',
    icon: LayoutDashboard,
  },
  {
    id: 'products',
    labelKey: 'nav.productStudio',
    defaultLabel: 'Products',
    icon: Package,
  },
  {
    id: 'images',
    labelKey: 'nav.imageStudio',
    defaultLabel: 'AI Studio',
    icon: Camera,
    badge: 'Vision',
  },
  {
    id: 'mentor',
    labelKey: 'nav.voiceMentor',
    defaultLabel: 'AI Mentor',
    icon: Mic,
    badge: 'Voice AI',
    isSpecial: true,
  },
  {
    id: 'more',
    labelKey: 'common.more',
    defaultLabel: 'More',
    icon: Menu,
  },
];

/**
 * SINGLE SOURCE OF TRUTH FOR SECONDARY / MORE NAVIGATION
 * Grouped logically by user intent without burying any existing feature
 */
export const SECONDARY_NAV_GROUPS: SecondaryNavGroup[] = [
  {
    id: 'business',
    titleKey: 'nav.groupBusiness',
    defaultTitle: 'Business & Store',
    items: [
      {
        id: 'business-profile',
        labelKey: 'nav.businessProfile',
        defaultLabel: 'Business Profile',
        descriptionKey: 'nav.businessProfileDesc',
        defaultDesc: 'Artisan heritage, craft technique & story',
        icon: Building2,
      },
      {
        id: 'storefront',
        labelKey: 'nav.publicStore',
        defaultLabel: 'Live Storefront',
        descriptionKey: 'nav.publicStoreDesc',
        defaultDesc: 'Public catalog with direct WhatsApp orders',
        icon: Store,
        badge: 'Live',
      },
    ],
  },
  {
    id: 'growth',
    titleKey: 'nav.groupGrowth',
    defaultTitle: 'Growth & Opportunities',
    items: [
      {
        id: 'marketplace',
        labelKey: 'nav.marketplace',
        defaultLabel: 'Sell & Export',
        descriptionKey: 'nav.marketplaceDesc',
        defaultDesc: 'Amazon, Meesho, Flipkart, ONDC & B2B Quotes',
        icon: Store,
        badge: 'Export',
      },
      {
        id: 'schemes',
        labelKey: 'nav.schemes',
        defaultLabel: 'Govt Schemes',
        descriptionKey: 'nav.schemesDesc',
        defaultDesc: 'PM Vishwakarma, PMEGP & Mudra subsidies',
        icon: Landmark,
      },
    ],
  },
  {
    id: 'account',
    titleKey: 'nav.groupAccount',
    defaultTitle: 'Account & Preferences',
    items: [
      {
        id: 'profile',
        labelKey: 'nav.profile',
        defaultLabel: 'Entrepreneur Profile',
        descriptionKey: 'nav.profileDesc',
        defaultDesc: 'Personal verification & contact details',
        icon: UserIcon,
      },
      {
        id: 'subscriptions',
        labelKey: 'nav.subscription',
        defaultLabel: 'Subscription Plan',
        descriptionKey: 'nav.subscriptionDesc',
        defaultDesc: 'Upgrade to Pro or manage your plan',
        icon: Crown,
      },
      {
        id: 'settings',
        labelKey: 'nav.settings',
        defaultLabel: 'Settings',
        descriptionKey: 'nav.settingsDesc',
        defaultDesc: 'Language preferences & notifications',
        icon: Settings,
      },
    ],
  },
];

/**
 * Returns true if tabId is one of the 4 direct primary destinations (excluding 'more')
 */
export function isPrimaryTab(tabId: string): boolean {
  return PRIMARY_NAV_ITEMS.some((item) => item.id === tabId && item.id !== 'more');
}

/**
 * Returns true if tabId belongs to any secondary group
 */
export function isSecondaryTab(tabId: string): boolean {
  return SECONDARY_NAV_GROUPS.some((group) =>
    group.items.some((item) => item.id === tabId)
  );
}

/**
 * Find which group a tab belongs to
 */
export function getSecondaryGroupForTab(tabId: string): SecondaryNavGroup | undefined {
  return SECONDARY_NAV_GROUPS.find((group) =>
    group.items.some((item) => item.id === tabId)
  );
}
