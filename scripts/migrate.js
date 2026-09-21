require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

// Full product catalog. image_url matches files you'll place in
// frontend/public/images/products/<id>.jpg — see that folder's README.
const PRODUCTS = [
  // ---------- Metal Scrap ----------
  { id: 'aluminum-scrap', name: 'Aluminum Scrap', category: 'Metal Scrap', type: 'Aluminum', grade: 'Sorted & Graded', availability: 'In Stock', description: 'Clean aluminum offcuts and sheet scrap, sorted by grade.' },
  { id: 'brass-scrap', name: 'Brass Scrap', category: 'Metal Scrap', type: 'Brass', grade: 'Sorted & Graded', availability: 'In Stock', description: 'Machined brass turnings and solid brass fittings.' },
  { id: 'copper-scrap', name: 'Copper Scrap', category: 'Metal Scrap', type: 'Copper', grade: 'Sorted & Graded', availability: 'In Stock', description: 'Bare bright and berry copper, high conductivity grade.' },
  { id: 'ms-scrap', name: 'MS Scrap', category: 'Metal Scrap', type: 'Steel', grade: 'Sorted & Graded', availability: 'In Stock', description: 'Mild steel scrap from structural and fabrication offcuts.' },
  { id: 'steel-scrap', name: 'Steel Scrap', category: 'Metal Scrap', type: 'Steel', grade: 'Sorted & Graded', availability: 'In Stock', description: 'General structural and sheet steel scrap, mixed grade.' },
  { id: 'stainless-steel-scrap', name: 'Stainless Steel Scrap', category: 'Metal Scrap', type: 'Stainless Steel', grade: 'Sorted & Graded', availability: 'Limited', description: 'Kitchen, industrial, and fabrication-grade stainless offcuts.' },
  { id: 'cable-scrap-aluminum', name: 'Cable Scrap (Aluminum)', category: 'Metal Scrap', type: 'Aluminum', grade: 'Sorted & Graded', availability: 'In Stock', description: 'Aluminum-core cable, stripped or insulated, priced by yield.' },
  { id: 'cable-scrap-copper', name: 'Cable Scrap (Copper)', category: 'Metal Scrap', type: 'Copper', grade: 'Sorted & Graded', availability: 'In Stock', description: 'Copper-core cable and wire, stripped or insulated.' },
  { id: 'tin-can-scrap', name: 'Tin / Can Scrap', category: 'Metal Scrap', type: 'Tin', grade: 'Sorted & Graded', availability: 'In Stock', description: 'Baled tin and aluminum can scrap from industrial and post-consumer sources.' },

  // ---------- Plastic & Drums ----------
  { id: 'fiber-drums', name: 'Fiber Drums', category: 'Plastic & Drums', type: 'Fiber', grade: 'Industrial Grade', availability: 'In Stock', description: 'Used fiber drums, cleaned and ready for reuse or recycling.' },
  { id: 'fiber-scrap', name: 'Fiber Scrap', category: 'Plastic & Drums', type: 'Fiber', grade: 'Industrial Grade', availability: 'In Stock', description: 'Fiber offcuts and reject material sorted for reprocessing.' },
  { id: 'hdpe-drums', name: 'HDPE Drums', category: 'Plastic & Drums', type: 'HDPE', grade: 'Industrial Grade', availability: 'In Stock', description: 'Food and industrial-grade HDPE drums, cleaned and sorted.' },
  { id: 'hdpe-scrap', name: 'HDPE Scrap', category: 'Plastic & Drums', type: 'HDPE', grade: 'Industrial Grade', availability: 'In Stock', description: 'Reground and baled HDPE scrap ready for reprocessing.' },
  { id: 'oil-drums', name: 'Oil Drums', category: 'Plastic & Drums', type: 'Steel/Plastic Drum', grade: 'Industrial Grade', availability: 'In Stock', description: 'Used oil drums, decontaminated and sorted by size and material.' },
  { id: 'plastic-drums', name: 'Plastic Drums', category: 'Plastic & Drums', type: 'Plastic', grade: 'Industrial Grade', availability: 'In Stock', description: 'Mixed plastic drums, cleaned and sorted by grade and color.' },
  { id: 'plastic-scrap', name: 'Plastic Scrap', category: 'Plastic & Drums', type: 'Plastic', grade: 'Industrial Grade', availability: 'In Stock', description: 'Sorted industrial plastic offcuts and production rejects.' },
  { id: 'pp-drums', name: 'PP Drums', category: 'Plastic & Drums', type: 'Polypropylene', grade: 'Industrial Grade', availability: 'In Stock', description: 'Polypropylene drums, cleaned and sorted for reuse or reprocessing.' },
  { id: 'pp-scrap', name: 'PP Scrap', category: 'Plastic & Drums', type: 'Polypropylene', grade: 'Industrial Grade', availability: 'In Stock', description: 'Baled and reground polypropylene scrap, sorted by color.' },
  { id: 'pvc-drums', name: 'PVC Drums', category: 'Plastic & Drums', type: 'PVC', grade: 'Industrial Grade', availability: 'Limited', description: 'PVC drums cleaned and sorted, suitable for reprocessing.' },
  { id: 'pvc-scrap', name: 'PVC Scrap', category: 'Plastic & Drums', type: 'PVC', grade: 'Industrial Grade', availability: 'In Stock', description: 'PVC pipe, sheet, and profile offcuts sorted for recycling.' },
  { id: 'tetra-pack', name: 'Tetra Pack', category: 'Plastic & Drums', type: 'Composite Packaging', grade: 'Industrial Grade', availability: 'In Stock', description: 'Baled tetra pack cartons collected for composite recycling.' },

  // ---------- Batteries & Power ----------
  { id: 'batteries-lead-acid', name: 'Batteries (Lead Acid)', category: 'Batteries & Power', type: 'Lead Acid Battery', grade: 'Tested', availability: 'In Stock', description: 'Used lead-acid batteries, handled and stored per safety guidelines.' },
  { id: 'lithium-batteries', name: 'Lithium Batteries', category: 'Batteries & Power', type: 'Lithium Battery', grade: 'Tested', availability: 'Limited', description: 'Lithium-ion battery packs and cells, safely stored for processing.' },
  { id: 'ups-systems', name: 'UPS Systems', category: 'Batteries & Power', type: 'Power Equipment', grade: 'Used - Functional', availability: 'On Order', description: 'Decommissioned UPS units, sold as-is or for parts.' },
  { id: 'solar-panels-used', name: 'Solar Panels (Used)', category: 'Batteries & Power', type: 'Solar Equipment', grade: 'Used - Functional', availability: 'Limited', description: 'Used solar panels, tested for output before resale.' },
  { id: 'power-supplies', name: 'Power Supplies', category: 'Batteries & Power', type: 'Electronics', grade: 'Mixed Condition', availability: 'In Stock', description: 'PC and industrial power supply units, sorted by condition.' },
  { id: 'led-bulbs', name: 'LED Bulbs', category: 'Batteries & Power', type: 'Lighting', grade: 'Mixed Condition', availability: 'In Stock', description: 'Used and surplus LED bulbs collected for component recovery.' },
  { id: 'fluorescent-tubes', name: 'Fluorescent Tubes', category: 'Batteries & Power', type: 'Lighting', grade: 'Handled per Safety Guidelines', availability: 'Limited', description: 'Fluorescent tubes collected and handled per safety guidelines.' },

  // ---------- Electronics & IT ----------
  { id: 'led-lcd-monitors', name: 'LED / LCD Monitors', category: 'Electronics & IT', type: 'IT Equipment', grade: 'Mixed Condition', availability: 'In Stock', description: 'Used monitors sorted by working condition and screen size.' },
  { id: 'cpu-towers', name: 'CPU Towers', category: 'Electronics & IT', type: 'IT Equipment', grade: 'Mixed Condition', availability: 'In Stock', description: 'Decommissioned desktop towers, sold whole or for parts.' },
  { id: 'laptops', name: 'Laptops', category: 'Electronics & IT', type: 'IT Equipment', grade: 'Mixed Condition', availability: 'Limited', description: 'Used laptops in varying condition, data-wiped before resale.' },
  { id: 'mobile-phones', name: 'Mobile Phones', category: 'Electronics & IT', type: 'IT Equipment', grade: 'Mixed Condition', availability: 'Limited', description: 'Used mobile devices collected for resale or material recovery.' },
  { id: 'printers', name: 'Printers', category: 'Electronics & IT', type: 'IT Equipment', grade: 'Mixed Condition', availability: 'In Stock', description: 'Office printers and multifunction units, sorted by condition.' },
  { id: 'photocopiers', name: 'Photocopiers', category: 'Electronics & IT', type: 'IT Equipment', grade: 'Mixed Condition', availability: 'On Order', description: 'Decommissioned office photocopiers, sold for parts or scrap.' },
  { id: 'circuit-boards', name: 'Circuit Boards', category: 'Electronics & IT', type: 'E-Waste', grade: 'Mixed Condition', availability: 'In Stock', description: 'Populated PCBs collected for precious metal recovery.' },
  { id: 'hard-drives', name: 'Hard Drives', category: 'Electronics & IT', type: 'E-Waste', grade: 'Data-Wiped', availability: 'In Stock', description: 'Used hard drives, securely wiped before resale or recycling.' },
  { id: 'memory-ram', name: 'Memory RAM', category: 'Electronics & IT', type: 'E-Waste', grade: 'Mixed Condition', availability: 'In Stock', description: 'Used RAM modules sorted by type and capacity.' },
  { id: 'keyboards', name: 'Keyboards', category: 'Electronics & IT', type: 'E-Waste', grade: 'Mixed Condition', availability: 'In Stock', description: 'Used keyboards collected in bulk for resale or recycling.' },
  { id: 'mice', name: 'Mice', category: 'Electronics & IT', type: 'E-Waste', grade: 'Mixed Condition', availability: 'In Stock', description: 'Used computer mice collected in bulk lots.' },

  // ---------- Home Appliances ----------
  { id: 'ac-units-window', name: 'AC Units (Window)', category: 'Home Appliances', type: 'Appliance', grade: 'Used - Functional', availability: 'Limited', description: 'Used window AC units, tested before resale or scrapping.' },
  { id: 'ac-units-split', name: 'AC Units (Split)', category: 'Home Appliances', type: 'Appliance', grade: 'Used - Functional', availability: 'Limited', description: 'Used split AC systems, indoor and outdoor units.' },
  { id: 'refrigerators', name: 'Refrigerators', category: 'Home Appliances', type: 'Appliance', grade: 'Used - Functional', availability: 'In Stock', description: 'Used refrigerators, sold working or for parts and metal recovery.' },
  { id: 'washing-machines', name: 'Washing Machines', category: 'Home Appliances', type: 'Appliance', grade: 'Used - Functional', availability: 'In Stock', description: 'Used washing machines, sorted by condition and type.' },
  { id: 'water-heaters', name: 'Water Heaters', category: 'Home Appliances', type: 'Appliance', grade: 'Used - Functional', availability: 'On Order', description: 'Decommissioned water heaters, sold for parts or scrap metal.' },
  { id: 'microwave-ovens', name: 'Microwave Ovens', category: 'Home Appliances', type: 'Appliance', grade: 'Used - Functional', availability: 'In Stock', description: 'Used microwave ovens collected for resale or component recovery.' },

  // ---------- Industrial Equipment ----------
  { id: 'electric-motors-small', name: 'Electric Motors (Small)', category: 'Industrial Equipment', type: 'Industrial', grade: 'Decommissioned', availability: 'In Stock', description: 'Small industrial and appliance motors, sorted by output.' },
  { id: 'electric-motors-large', name: 'Electric Motors (Large)', category: 'Industrial Equipment', type: 'Industrial', grade: 'Decommissioned', availability: 'On Order', description: 'Large industrial motors decommissioned from factory lines.' },
  { id: 'transformers-oil-filled', name: 'Transformers (Oil Filled)', category: 'Industrial Equipment', type: 'Industrial', grade: 'Decommissioned', availability: 'On Order', description: 'Oil-filled transformers, drained and handled per safety guidelines.' },
  { id: 'transformers-dry-type', name: 'Transformers (Dry Type)', category: 'Industrial Equipment', type: 'Industrial', grade: 'Decommissioned', availability: 'Limited', description: 'Dry-type transformers decommissioned from industrial sites.' },

  // ---------- General Waste & Materials ----------
  { id: 'bricks-waste', name: 'Bricks Waste', category: 'General Waste & Materials', type: 'Construction Waste', grade: 'Bulk', availability: 'In Stock', description: 'Broken brick and construction rubble collected for reuse.' },
  { id: 'paper-scrap', name: 'Paper Scrap', category: 'General Waste & Materials', type: 'Paper', grade: 'Bulk', availability: 'In Stock', description: 'Baled cardboard and paper waste from industrial sources.' },
  { id: 'tires', name: 'Tires', category: 'General Waste & Materials', type: 'Rubber', grade: 'Bulk', availability: 'In Stock', description: 'Used vehicle tires collected for recycling or resale.' },
  { id: 'wood-waste', name: 'Wood Waste', category: 'General Waste & Materials', type: 'Wood', grade: 'Bulk', availability: 'In Stock', description: 'Offcut and scrap wood collected from industrial and construction sources.' },
  { id: 'wood-pallets', name: 'Wood Pallets', category: 'General Waste & Materials', type: 'Wood', grade: 'Bulk', availability: 'In Stock', description: 'Used wooden pallets, sold for reuse or reprocessing.' },
].map((p) => ({ ...p, imageUrl: `/images/products/${p.id}.jpg` }));

async function run() {
  console.log('[migrate] Connecting to database...');
  const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf-8');
  await pool.query(schema);
  console.log('[migrate] Schema created / verified.');

  // Clear out any old catalog so removed products don't linger.
  await pool.query('DELETE FROM products WHERE id NOT IN (SELECT unnest($1::text[]))', [
    PRODUCTS.map((p) => p.id),
  ]);

  for (const p of PRODUCTS) {
    await pool.query(
      `INSERT INTO products (id, name, category, type, grade, availability, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         type = EXCLUDED.type,
         grade = EXCLUDED.grade,
         availability = EXCLUDED.availability,
         description = EXCLUDED.description,
         image_url = EXCLUDED.image_url`,
      [p.id, p.name, p.category, p.type, p.grade, p.availability, p.description, p.imageUrl]
    );
  }
  console.log(`[migrate] Seeded ${PRODUCTS.length} products.`);

  await pool.end();
  console.log('[migrate] Done.');
}

run().catch((err) => {
  console.error('[migrate] Failed:', err.message);
  process.exit(1);
});
