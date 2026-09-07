import { getProductThumbnail, getDirectProductPhoto } from '../src/utils/productThumbnail.ts';

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
];

for (const p of testProducts) {
  const thumb = getProductThumbnail(p);
  const direct = getDirectProductPhoto(p);
  console.log(`Product: "${p.title}"`);
  console.log(`  -> Direct custom photo: ${direct ? 'YES (' + direct.slice(0, 30) + ')' : 'NONE'}`);
  console.log(`  -> Resolved Thumbnail: ${thumb.slice(0, 65)}...`);
}
