import { CanonicalProduct } from '../../../types/marketplace';

export interface OndcBecknItem {
  id: string;
  descriptor: {
    name: string;
    code: string;
    symbol: string;
    short_desc: string;
    long_desc: string;
    images: string[];
  };
  price: {
    currency: string;
    value: string;
    maximum_value: string;
  };
  quantity: {
    available: {
      count: string;
    };
    maximum: {
      count: string;
    };
  };
  category_id: string;
  fulfillment_id: string;
  tags: {
    code: string;
    list: { code: string; value: string }[];
  }[];
  '@ondc/org/returnable': boolean;
  '@ondc/org/cancellable': boolean;
  '@ondc/org/return_window': string;
  '@ondc/org/seller_pickup_return': boolean;
  '@ondc/org/time_to_ship': string;
  '@ondc/org/available_on_cod': boolean;
  '@ondc/org/contact_details_consumer_care': string;
}

export function exportOndcJson(
  products: CanonicalProduct[],
  providerInfo?: {
    providerId?: string;
    providerName?: string;
    phone?: string;
    email?: string;
    location?: string;
  }
): object {
  const providerId = providerInfo?.providerId || 'krivio-artisan-provider';
  const providerName = providerInfo?.providerName || 'Krivio Rural Artisan';
  const contact = providerInfo?.phone || providerInfo?.email || 'support@krivio.org';

  const items: OndcBecknItem[] = products.map((p) => ({
    id: p.sku || p.id,
    descriptor: {
      name: p.title,
      code: p.sku,
      symbol: p.primaryImageUrl || '',
      short_desc: p.shortDescription || p.description.slice(0, 100),
      long_desc: p.description,
      images: p.imageUrls,
    },
    price: {
      currency: p.currency || 'INR',
      value: p.price.toFixed(2),
      maximum_value: (p.mrp || Math.round(p.price * 1.25)).toFixed(2),
    },
    quantity: {
      available: {
        count: String(p.stock),
      },
      maximum: {
        count: String(Math.min(p.stock, 25)),
      },
    },
    category_id: p.category,
    fulfillment_id: 'standard-delivery',
    tags: [
      {
        code: 'origin',
        list: [
          { code: 'country', value: 'IND' },
          { code: 'state', value: p.originState || 'India' },
        ],
      },
      {
        code: 'attribute',
        list: [
          { code: 'brand', value: p.brand },
          { code: 'material', value: p.material || 'Natural' },
          { code: 'weight', value: p.weight },
          { code: 'dimensions', value: p.dimensions },
          { code: 'hsn', value: p.hsnCode || '6913' },
        ],
      },
      ...(p.craftStory
        ? [
            {
              code: 'craft_heritage',
              list: [{ code: 'story', value: p.craftStory }],
            },
          ]
        : []),
    ],
    '@ondc/org/returnable': false,
    '@ondc/org/cancellable': true,
    '@ondc/org/return_window': 'P7D',
    '@ondc/org/seller_pickup_return': false,
    '@ondc/org/time_to_ship': 'P3D',
    '@ondc/org/available_on_cod': false,
    '@ondc/org/contact_details_consumer_care': contact,
  }));

  return {
    $schema: 'https://ondc.org/protocol/v1.2.0/retail-catalog.json',
    format: 'ONDC-Ready Beckn Retail Protocol Representation',
    schema_version: '1.2.0',
    generated_at: new Date().toISOString(),
    disclaimer:
      'This payload formats catalog items according to the ONDC Beckn Retail Protocol specification for onboarding onto Seller Network Participant (SNP) nodes. Exporting does not directly syndicate items to the ONDC network without an authorized Seller App integration.',
    bpp_provider: {
      id: providerId,
      descriptor: {
        name: providerName,
        short_desc: 'Authentic grassroots handicraft producer',
      },
      categories: Array.from(new Set(products.map((p) => p.category))).map((cat) => ({
        id: cat,
        descriptor: { name: cat },
      })),
      items,
    },
  };
}
