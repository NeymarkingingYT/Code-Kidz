// === Blockly Injection ===
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
  trashcan: true
});

// === Theme Switching ===
document.getElementById("modeToggle").addEventListener("change", e => {
  document.body.className = e.target.checked ? "dark" : "light";
});

// === Stage and Sprites ===
const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
let backdrop = null;
let sprites = [{ id: 0, x: 240, y: 180, costume: "🧍", clones: [] }];

function drawStage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backdrop) ctx.drawImage(backdrop, 0, 0, canvas.width, canvas.height);
  for (const s of [sprites[0], ...sprites[0].clones]) {
    ctx.font = "32px serif";
    ctx.fillText(s.costume, s.x, s.y);
  }
}

// === Blocks ===
Blockly.defineBlocksWithJsonArray([
  {
    type: "event_when_run",
    message0: "when run",
    nextStatement: null,
    colour: 20
  },
  {
    type: "move_steps",
    message0: "move %1 steps",
    args0: [{ type: "field_number", name: "STEPS", value: 10 }],
    previousStatement: null, nextStatement: null,
    colour: 210
  },
  {
    type: "go_to_xy",
    message0: "go to x: %1 y: %2",
    args0: [
      { type: "field_number", name: "X", value: 0 },
      { type: "field_number", name: "Y", value: 0 }
    ],
    previousStatement: null, nextStatement: null,
    colour: 210
  },
  {
    type: "change_costume",
    message0: "switch costume to %1",
    args0: [{ type: "field_input", name: "LOOK", text: "🐱" }],
    previousStatement: null, nextStatement: null,
    colour: 160
  },
  {
    type: "sound_play",
    message0: "play sound",
    previousStatement: null, nextStatement: null,
    colour: 300
  },
  {
    type: "create_clone",
    message0: "create clone of myself",
    previousStatement: null, nextStatement: null,
    colour: 120
  },
  {
    type: "say_message",
    message0: "say %1",
    args0: [{ type: "field_input", name: "TEXT", text: "Hello!" }],
    previousStatement: null, nextStatement: null,
    colour: 60
  }
]);

// === Generators ===
Blockly.JavaScript['event_when_run'] = () => '';
Blockly.JavaScript['move_steps'] = b => `sprite.x += ${b.getFieldValue('STEPS')}; drawStage();\n`;
Blockly.JavaScript['go_to_xy'] = b => `sprite.x = ${b.getFieldValue('X')}; sprite.y = ${b.getFieldValue('Y')}; drawStage();\n`;
Blockly.JavaScript['change_costume'] = b => `sprite.costume = "${b.getFieldValue('LOOK')}"; drawStage();\n`;
Blockly.JavaScript['sound_play'] = () => `if(sound) sound.play();\n`;
Blockly.JavaScript['create_clone'] = () => `sprite.clones.push({ ...sprite }); drawStage();\n`;
Blockly.JavaScript['say_message'] = b => `alert("${b.getFieldValue('TEXT')}");\n`;

// === Run Button ===
function runCode() {
  const code = Blockly.JavaScript.workspaceToCode(workspace);
  window.sprite = sprites[0];
  try {
    new Function(code)();
  } catch (e) {
    alert("Error: " + e);
  }
}

// === Backdrop Upload ===
function uploadBackdrop() {
  document.getElementById("backdropInput").click();
}
document.getElementById("backdropInput").addEventListener("change", e => {
  const file = e.target.files[0];
  const img = new Image();
  img.onload = () => { backdrop = img; drawStage(); };
  img.src = URL.createObjectURL(file);
});

// === Sound Upload ===
let sound = null;
function uploadSound() {
  document.getElementById("soundInput").click();
}
document.getElementById("soundInput").addEventListener("change", e => {
  const file = e.target.files[0];
  sound = new Audio(URL.createObjectURL(file));
});

// === Save / Load ===
function saveProject() {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const data = Blockly.Xml.domToPrettyText(xml);
  localStorage.setItem("codekidz", data);
  alert("Project saved!");
}

function loadProject() {
  const data = localStorage.getItem("codekidz");
  if (data) {
    workspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(data), workspace);
  } else alert("No saved project found.");
}

// === Initial Draw ===
drawStage();
