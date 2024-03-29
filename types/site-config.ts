export interface NavTab {
  name: string
  current: boolean
  icon?: any
  href?: string
}

export interface NestedTab extends NavTab {
  children: {
    [key: string]: NavTab | NestedTab
  }
}

interface MainNavTab extends NavTab {
  icon: any
  children?: any
}

export interface SiteConfig {
  siteName: string
  domain: string
  developer: string
  productBrand: string
  contactEmail: string
  description?: string

  mainNavTabs: MainNavTab[]
  accountNavTabs: Partial<NavTab>[]
  settingsNavTabs: NavTab[]
}

export const siteConfig = (config: SiteConfig): SiteConfig => {
  return config
}
