import fs from 'fs';
import path from 'path';
import { LOCATIONS } from './src/features/main-menu/constants/locations';
import { SCENE_CONFIG } from './src/features/main-menu/constants/config';

const mainScene = {
  id: "main",
  name: "Башкы бет",
  assetFolder: "main_menu",
  sections: SCENE_CONFIG.sections,
  locations: LOCATIONS
};

const scenesDir = path.join(process.cwd(), 'src/features/main-menu/data/scenes');
if (!fs.existsSync(scenesDir)) {
  fs.mkdirSync(scenesDir, { recursive: true });
}

fs.writeFileSync(path.join(scenesDir, 'main.json'), JSON.stringify(mainScene, null, 2), 'utf-8');
console.log('Migration complete!');
