import { DestinationMetadata } from '../../types/marketplace';

export const MARKETPLACE_DESTINATIONS: Record<string, DestinationMetadata> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon-Style Inventory Listing',
    tagline: 'Structured inventory spreadsheet for Amazon Seller Central',
    badge: 'XLSX Spreadsheet',
    format: 'xlsx',
    schemaVersion: 'amazon-flatfile-handmade-2026.1',
    lastVerifiedDate: '2026-08-15',
    description:
      'Generates a category-mapped inventory spreadsheet conforming to Amazon Seller Central flat-file listing specifications for handcrafted, home & lifestyle products.',
    instructions: [
      'Download the generated Amazon-style XLSX file.',
      'Log into your Amazon Seller Central account.',
      'Navigate to Catalog > Add Products via Upload.',
      'Upload this spreadsheet under the Inventory Loader / Flat File tab.',
      'Review any category-specific attribute notices directly in Seller Central.',
    ],
    supportedCategories: ['Home & Decor', 'Handicrafts & Art', 'Textiles & Handloom', 'Pottery & Ceramics', 'Jewelry & Accessories'],
    disclaimer:
      'This tool formats your catalog according to verified Amazon Seller flat-file standards. It does not provide direct API publishing or guarantee marketplace approval.',
  },
  meesho: {
    id: 'meesho',
    name: 'Meesho Micro-Seller Catalog',
    tagline: 'Zero-commission bulk catalog template for Meesho Supplier Panel',
    badge: 'CSV Catalog',
    format: 'csv',
    schemaVersion: 'meesho-catalog-v2026.2',
    lastVerifiedDate: '2026-07-20',
    description:
      'Formats your products into the official Meesho supplier bulk upload CSV format with GST, HSN code, correct packaging weight and return pricing.',
    instructions: [
      'Download the Meesho-formatted CSV file.',
      'Log into the Meesho Supplier Panel (supplier.meesho.com).',
      'Go to Catalog Uploads > Add Catalogs in Bulk.',
      'Select your primary category and upload the generated CSV.',
      'Ensure high-resolution images are reachable via public links.',
    ],
    supportedCategories: ['Ethnic Wear', 'Handicrafts', 'Home Furnishing', 'Fashion Jewelry', 'Kitchen & Craft'],
    disclaimer:
      'Conforms to Meesho bulk catalog guidelines. Seller verification and final catalog activation are governed by Meesho.',
  },
  flipkart: {
    id: 'flipkart',
    name: 'Flipkart Listing Flat File',
    tagline: 'Standard listing feed for Flipkart Seller Hub',
    badge: 'CSV Feed',
    format: 'csv',
    schemaVersion: 'flipkart-flatfile-v2026.1',
    lastVerifiedDate: '2026-08-01',
    description:
      'Creates a structured listing export matching Flipkart Seller Hub flat-file requirements including SKU ID, procurement SLA, pricing, and package dimensions.',
    instructions: [
      'Download the Flipkart-ready CSV listing file.',
      'Log into Flipkart Seller Hub (seller.flipkart.com).',
      'Navigate to Listings > Add New Listings in Bulk.',
      'Choose your category vertical and submit the file for listing validation.',
    ],
    supportedCategories: ['Handicrafts & Decor', 'Apparel & Fabric', 'Kitchen & Dining', 'Art & Collectibles'],
    disclaimer:
      'Listing feed prepared according to Flipkart catalog specs. Final brand approval and brand gating are administered by Flipkart.',
  },
  generic_csv: {
    id: 'generic_csv',
    name: 'Universal Clean CSV Catalog',
    tagline: 'Universal UTF-8 CSV with injection protection & multi-script support',
    badge: 'Universal CSV',
    format: 'csv',
    schemaVersion: 'krivio-canonical-csv-v1.0',
    lastVerifiedDate: '2026-09-01',
    description:
      'RFC-4180 compliant CSV export with full support for Indian regional scripts (Hindi, Marathi, Tamil, Bengali, Assamese, Gujarati) and built-in spreadsheet formula injection defense.',
    instructions: [
      'Download the CSV file to open in Excel, Google Sheets, LibreOffice, or ERP systems.',
      'Includes complete product metadata: SKUs, descriptions, pricing, dimensions, and materials.',
    ],
    supportedCategories: ['All Categories'],
    disclaimer: 'Universal export format for third-party tools, ERP systems, or local inventory backups.',
  },
  generic_xlsx: {
    id: 'generic_xlsx',
    name: 'Professional Excel Workbook',
    tagline: 'Branded multi-column spreadsheet with styled headers and formatting',
    badge: 'Styled XLSX',
    format: 'xlsx',
    schemaVersion: 'krivio-canonical-xlsx-v1.0',
    lastVerifiedDate: '2026-09-01',
    description:
      'A presentation-ready Microsoft Excel (.xlsx) catalog featuring KRIVIO emerald-gold header accents, auto-adjusted column widths, currency formats, and frozen header rows.',
    instructions: [
      'Open directly in Microsoft Excel, Apple Numbers, or Google Sheets.',
      'Ideal for sharing full catalogs with corporate procurement teams, distributors, and retail buyers.',
    ],
    supportedCategories: ['All Categories'],
    disclaimer: 'Formatted for human readability and business-to-business catalog sharing.',
  },
  ondc: {
    id: 'ondc',
    name: 'ONDC-Ready Beckn Catalog (JSON)',
    tagline: 'Open Network for Digital Commerce Retail Protocol representation',
    badge: 'Beckn JSON',
    format: 'json',
    schemaVersion: 'ondc-beckn-retail-v1.2.0',
    lastVerifiedDate: '2026-08-28',
    description:
      'Generates a standardized Beckn Protocol JSON payload representing your catalog items for onboarding via ONDC Seller Network Participants (e.g. Mystore, Plotch, Paytm Seller).',
    instructions: [
      'Export the ONDC-ready JSON structure.',
      'Provide or import this JSON payload into your chosen ONDC Seller Network Participant (SNP) application.',
      'Review your ONDC Seller Application onboarding parameters.',
    ],
    supportedCategories: ['Food & Beverage', 'Home & Decor', 'Apparel & Accessories', 'Electronics & Hardware', 'Grocery & Craft'],
    disclaimer:
      'This export formats product records into the ONDC Beckn Retail specification. Exporting does NOT directly syndicate products onto the live ONDC registry without an authenticated Seller App participant agreement.',
  },
};
