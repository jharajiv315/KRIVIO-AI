import { getProductThumbnail, getDirectProductPhoto, isValidImageUrl, normalizeCandidateUrl } from '../src/utils/productThumbnail.ts';

const testProducts = [
  { id: '1', title: 'Chanderi Handwoven Zari Dupatta', category: 'Handicrafts & Art', imageUrls: [] },
  { id: '2', title: 'Handmade Wooden Carving', category: 'Handicrafts & Art', imageUrls: [] },
  { id: '3', title: 'Kashmir Pashmina Embroidered Shawl', category: 'Handicrafts & Art', imageUrls: [] },
  { id: '4', title: 'Handmade Terracotta Diya', category: 'Handicrafts & Art', imageUrls: [] },
  { id: '5', title: 'Handcrafted Wooden Owl', category: 'Woodcraft', imageUrls: ['https://example.com/owl.jpg'] },
  { id: '6', title: 'Brass Puja Bell and Diya', category: 'Metalcraft', imageUrls: [] },
  { id: '7', title: 'Jaipur Blue Pottery Ceramic Mug', category: 'Pottery & Home Decor', imageUrls: [] },
  { id: '8', title: 'Madhubani Handpainted Silk Scarf', category: 'Handicrafts & Art', imageUrls: [] },
  { id: '9', title: 'Custom Artisan Ceramic Vase', category: 'Pottery', imageUrls: ['data:image/jpeg;base64,samplephoto123'] },
  // Nested object candidate in photos array
  { id: '10', title: 'Carved Wood Box', category: 'Woodcraft', photos: [{ secure_url: 'https://images.unsplash.com/photo-custom-wood' }] },
  // Alternate singular field thumbnail_url
  { id: '11', title: 'Silver Filigree Earring', category: 'Jewelry', thumbnail_url: 'https://images.unsplash.com/photo-silver-earring' },
  // JSON string serialized array
  { id: '12', title: 'Clay Planter', category: 'Pottery', image_urls: '["https://images.unsplash.com/photo-clay-planter"]' },
];

let failed = false;
for (const p of testProducts) {
  const thumb = getProductThumbnail(p);
  const direct = getDirectProductPhoto(p);
  console.log(`Product: "${p.title}"`);
  console.log(`  -> Direct custom photo: ${direct ? 'YES (' + direct.slice(0, 45) + ')' : 'NONE'}`);
  console.log(`  -> Resolved Thumbnail: ${thumb.slice(0, 65)}...`);
  if (!thumb || typeof thumb !== 'string') {
    console.error('FAILED: Invalid thumbnail for', p.title);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('\nAll thumbnail resolution tests PASSED successfully!');
}
