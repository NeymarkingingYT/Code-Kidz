// Blockly setup
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox')
});

// Light/Dark Theme Toggle
function toggleTheme() {
  const isDark = document.getElementById('modeToggle').checked;
  document.body.className = isDark ? 'dark' : 'light';
}

// Canvas setup
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

// Sprites
let sprites = [{ x: 100, y: 100 }];
let clones = [];
let spriteCostume = null;
let backdrop = null;

// Drawing
function drawSprites() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backdrop) ctx.drawImage(backdrop, 0, 0, canvas.width, canvas.height);
  [...sprites, ...clones].forEach(sprite => {
    if (spriteCostume) {
      ctx.drawImage(spriteCostume, sprite.x - 20, sprite.y - 20, 40, 40);
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(sprite.x - 10, sprite.y - 10, 20, 20);
    }
  });
}

// Sprite Dragging
let dragging = false;
let offsetX = 0, offsetY = 0;

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const sprite = sprites[0];
  if (x >= sprite.x - 10 && x <= sprite.x + 10 && y >= sprite.y - 10 && y <= sprite.y + 10) {
    dragging = true;
    offsetX = x - sprite.x;
    offsetY = y - sprite.y;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (dragging) {
    const rect = canvas.getBoundingClientRect();
    sprites[0].x = e.clientX - rect.left - offsetX;
    sprites[0].y = e.clientY - rect.top - offsetY;
    drawSprites();
  }
});

canvas.addEventListener('mouseup', () => {
  dragging = false;
});

// Backdrop Upload
function uploadBackdrop() {
  document.getElementById('backdropInput').click();
}
document.getElementById('backdropInput').addEventListener('change', (e) => {
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      backdrop = img;
      drawSprites();
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Costume Upload
function uploadCostume() {
  document.getElementById('costumeInput').click();
}
document.getElementById('costumeInput').addEventListener('change', (e) => {
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      spriteCostume = img;
      drawSprites();
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Sound Upload (placeholder)
function uploadSound() {
  document.getElementById('soundInput').click();
}
document.getElementById('soundInput').addEventListener('change', (e) => {
  alert("Sound uploaded (not yet functional)");
});

// Save/Load
function saveProject() {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  localStorage.setItem('codekidz_project', Blockly.Xml.domToText(xml));
  alert("Project saved!");
}

function loadProject() {
  const xmlText = localStorage.getItem('codekidz_project');
  if (xmlText) {
    const xml = Blockly.Xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(xml, workspace);
    alert("Project loaded!");
  } else {
    alert("No project found.");
  }
}

// Export/Import
function downloadProject() {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const xmlText = Blockly.Xml.domToText(xml);
  const blob = new Blob([xmlText], { type: 'text/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "project.codekidz";
  link.click();
}

document.getElementById('importInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const xml = Blockly.Xml.textToDom(event.target.result);
    Blockly.Xml.domToWorkspace(xml, workspace);
    alert("Project imported!");
  };
  reader.readAsText(file);
});

// Gallery
function openGallery() {
  fetch('gallery.json')
    .then(res => res.json())
    .then(projects => {
      const list = projects.map(p =>
        `<li><button onclick=\"loadSharedProject('${p.file}')\">${p.title} by ${p.author}</button></li>`
      ).join('');
      const html = `<ul>${list}</ul>`;
      const w = window.open("", "_blank", "width=400,height=600");
      w.document.write(`<h1>Project Gallery</h1>${html}`);
    });
}

function loadSharedProject(fileUrl) {
  fetch(fileUrl)
    .then(res => res.text())
    .then(xmlText => {
      const xml = Blockly.Xml.textToDom(xmlText);
      workspace.clear();
      Blockly.Xml.domToWorkspace(xml, workspace);
      alert("Project loaded from gallery!");
    });
}

// Basic Blockly Blocks
Blockly.defineBlocksWithJsonArray([
  {
    "type": "event_when_run",
    "message0": "when run",
    "nextStatement": null,
    "colour": 20
  },
  {
    "type": "move_steps",
    "message0": "move %1 steps",
    "args0": [{ "type": "field_number", "name": "STEPS", "value": 10 }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 210
  },
  {
    "type": "go_to_xy",
    "message0": "go to x: %1 y: %2",
    "args0": [
      { "type": "field_number", "name": "X", "value": 0 },
      { "type": "field_number", "name": "Y", "value": 0 }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 210
  },
  {
    "type": "change_costume",
    "message0": "change costume",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160
  },
  {
    "type": "say_message",
    "message0": "say %1",
    "args0": [{ "type": "field_input", "name": "TEXT", "text": "hello" }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 60
  }
]);

// Code Generator
Blockly.JavaScript['event_when_run'] = function() {
  return '';
};
Blockly.JavaScript['move_steps'] = function(block) {
  const steps = Number(block.getFieldValue('STEPS'));
  return `sprites[0].x += ${steps}; drawSprites();\n`;
};
Blockly.JavaScript['go_to_xy'] = function(block) {
  const x = Number(block.getFieldValue('X'));
  const y = Number(block.getFieldValue('Y'));
  return `sprites[0].x = ${x}; sprites[0].y = ${y}; drawSprites();\n`;
};
Blockly.JavaScript['change_costume'] = function() {
  return `drawSprites();\n`;
};
Blockly.JavaScript['say_message'] = function(block) {
  const text = block.getFieldValue('TEXT');
  return `alert(\"${text}\");\n`;
};

// Run only from event_when_run blocks
function runCode() {
  sprites = [{ x: 100, y: 100 }];
  clones = [];

  const topBlocks = workspace.getTopBlocks(true);
  const codeBlocks = topBlocks
    .filter(b => b.type === 'event_when_run')
    .map(b => Blockly.JavaScript.blockToCode(b))
    .join('\n');

  try {
    eval(codeBlocks);
  } catch (e) {
    alert("Error: " + e.message);
  }

  drawSprites();
}

drawSprites();
