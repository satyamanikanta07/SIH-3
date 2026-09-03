const fs = require('fs');
const path = require('path');

const folders = ['models', 'middleware', 'routes'];
let errors = 0;

folders.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    fs.readdirSync(fullPath).forEach(file => {
      if (file.endsWith('.js')) {
        try {
          require(path.join(fullPath, file));
          console.log(`✓ ${dir}/${file}`);
        } catch (e) {
          console.error(`✗ ${dir}/${file}:`, e.message);
          errors++;
        }
      }
    });
  }
});

if (errors === 0) {
  console.log('\n🎉 All backend models, middleware, and routes loaded successfully with 0 errors!');
  process.exit(0);
} else {
  console.error(`\n❌ Failed with ${errors} error(s).`);
  process.exit(1);
}
