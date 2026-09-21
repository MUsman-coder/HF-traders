# Product photos

Drop real photos of your own materials here using these EXACT filenames
(the site already looks for these paths — nothing else to configure).
Grouped by category to match the Products page:

## Metal Scrap
aluminum-scrap.jpg, brass-scrap.jpg, copper-scrap.jpg, ms-scrap.jpg,
steel-scrap.jpg, stainless-steel-scrap.jpg, cable-scrap-aluminum.jpg,
cable-scrap-copper.jpg, tin-can-scrap.jpg

## Plastic & Drums
fiber-drums.jpg, fiber-scrap.jpg, hdpe-drums.jpg, hdpe-scrap.jpg,
oil-drums.jpg, plastic-drums.jpg, plastic-scrap.jpg, pp-drums.jpg,
pp-scrap.jpg, pvc-drums.jpg, pvc-scrap.jpg, tetra-pack.jpg

## Batteries & Power
batteries-lead-acid.jpg, lithium-batteries.jpg, ups-systems.jpg,
solar-panels-used.jpg, power-supplies.jpg, led-bulbs.jpg,
fluorescent-tubes.jpg

## Electronics & IT
led-lcd-monitors.jpg, cpu-towers.jpg, laptops.jpg, mobile-phones.jpg,
printers.jpg, photocopiers.jpg, circuit-boards.jpg, hard-drives.jpg,
memory-ram.jpg, keyboards.jpg, mice.jpg

## Home Appliances
ac-units-window.jpg, ac-units-split.jpg, refrigerators.jpg,
washing-machines.jpg, water-heaters.jpg, microwave-ovens.jpg

## Industrial Equipment
electric-motors-small.jpg, electric-motors-large.jpg,
transformers-oil-filled.jpg, transformers-dry-type.jpg

## General Waste & Materials
bricks-waste.jpg, paper-scrap.jpg, tires.jpg, wood-waste.jpg,
wood-pallets.jpg

---

**54 files total.** Tips:
- .jpg, .png, or .webp all work — just match the extension in
  `backend/scripts/migrate.js` (the `imageUrl` is auto-generated as
  `.jpg` for every item; change the file extension there if you use
  something else, then re-run `npm run db:setup`).
- If a photo is missing, the site automatically shows a clean labeled
  placeholder instead of breaking — so you can add these gradually.
- Use real photos of your own yard/materials rather than stock images.
  It's more trustworthy to customers and avoids copyright issues that
  come with using photos you don't have the rights to.
