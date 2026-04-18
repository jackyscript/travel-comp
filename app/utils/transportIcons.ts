type ProductType = 'bus' | 'tram' | 'subway' | 'suburban' | 'regional' | 'express' | 'ferry'

const iconMap: Record<ProductType, string> = {
  bus: '/images/BUS-Logo-BVG.svg',
  tram: '/images/Tram-Logo.svg',
  subway: '/images/U-Bahn.svg',
  suburban: '/images/S-Bahn-Logo.svg',
  regional: '/images/VBB_Bahn-Regionalverkehr.svg',
  express: '/images/haf_prod_ic.svg',
  ferry: '/images/Fähre-Logo-BVG.svg',
}

export function getIconForProduct(product: string): string {
  return iconMap[product as ProductType] || iconMap.express
}
