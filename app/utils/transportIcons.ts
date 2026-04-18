type ProductType = 'bus' | 'tram' | 'subway' | 'suburban' | 'regional' | 'express' | 'ferry'

const iconMap: Record<ProductType, string> = {
  bus: '/travel-comp/images/BUS-Logo-BVG.svg',
  tram: '/travel-comp/images/Tram-Logo.svg',
  subway: '/travel-comp/images/U-Bahn.svg',
  suburban: '/travel-comp/images/S-Bahn-Logo.svg',
  regional: '/travel-comp/images/VBB_Bahn-Regionalverkehr.svg',
  express: '/travel-comp/images/haf_prod_ic.svg',
  ferry: '/travel-comp/images/Fähre-Logo-BVG.svg',
}

export function getIconForProduct(product: string): string {
  return iconMap[product as ProductType] || iconMap.express
}
