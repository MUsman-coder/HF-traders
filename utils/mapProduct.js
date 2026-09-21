/**
 * Maps a raw Postgres products row (snake_case columns) to the camelCase
 * shape the frontend expects. Shared between the public /products route
 * and the /admin/products routes so the two never drift out of sync.
 */
function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type,
    grade: row.grade,
    availability: row.availability,
    description: row.description,
    imageUrl: row.image_url,
  };
}

module.exports = { mapProduct };
