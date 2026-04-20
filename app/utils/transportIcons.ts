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

const colorMap: Record<ProductType, string> = {
  bus: '#A5027D',
  tram: '#D82020',
  subway: '#004F8D',
  suburban: '#008d4f',
  regional: '#DA251D',
  express: '#FFF500',
  ferry: '#0080BA',
}

export function getIconForProduct(product: string): string {
  return iconMap[product as ProductType] || iconMap.express
}

export function getColorForProduct(product: string): string {
  return colorMap[product as ProductType] || colorMap.express
}

