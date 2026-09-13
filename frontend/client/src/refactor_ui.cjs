const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'components', 'ui');
const srcDir = __dirname;

const categories = {
  forms: ['button', 'button-group', 'checkbox', 'field', 'form', 'input', 'input-group', 'input-otp', 'label', 'radio-group', 'select', 'slider', 'switch', 'textarea', 'toggle', 'toggle-group'],
  layout: ['aspect-ratio', 'card', 'carousel', 'resizable', 'scroll-area', 'separator', 'sidebar'],
  navigation: ['breadcrumb', 'command', 'menubar', 'navigation-menu', 'pagination', 'tabs'],
  overlays: ['alert-dialog', 'context-menu', 'dialog', 'drawer', 'dropdown-menu', 'hover-card', 'popover', 'sheet', 'tooltip'],
  feedback: ['alert', 'progress', 'skeleton', 'sonner', 'spinner'],
  'data-display': ['accordion', 'avatar', 'badge', 'chart', 'collapsible', 'empty', 'item', 'kbd', 'table'],
  custom: ['GameProgress', 'Panel', 'SectionHead', 'RarityBadge']
};

const moveMap = {};

// Create folders and move files
for (const [category, files] of Object.entries(categories)) {
  const catDir = path.join(uiDir, category);
  if (!fs.existsSync(catDir)) {
    fs.mkdirSync(catDir, { recursive: true });
  }

  for (const file of files) {
    const fileName = `${file}.tsx`;
    const oldPath = path.join(uiDir, fileName);
    const newPath = path.join(catDir, fileName);

    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      moveMap[file] = `${category}/${file}`;
    }
  }
}

// Function to recursively find files in a directory
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const allFiles = walk(srcDir);

// Update imports
for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  for (const [file, newRelPath] of Object.entries(moveMap)) {
    // We need to catch relative and alias imports
    // Examples: 
    // import { X } from "@/components/ui/button"
    // import { X } from "../components/ui/button"
    // import { X } from "../../components/ui/button"
    
    // Regex explanation:
    // Match quotes, followed by anything ending in components/ui/
    // then the filename (with or without .tsx), followed by quotes
    
    const regex1 = new RegExp(`(from\\s+['"].*?components/ui/)${file}(['"])`, 'g');
    if (regex1.test(content)) {
      content = content.replace(regex1, `$1${newRelPath}$2`);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
