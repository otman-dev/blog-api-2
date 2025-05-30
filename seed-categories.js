const { CategoryService } = require('./src/lib/categoryService.ts');

async function seedCategories() {
  try {
    console.log('🌱 Starting categories seeding...');
    const service = CategoryService.getInstance();
    await service.seedCategoriesFromFile();
    console.log('✅ Categories seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed categories:', error);
  }
  process.exit(0);
}

seedCategories();
