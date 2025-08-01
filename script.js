let workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox')
});

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

// === SPRITE ENGINE ===
let sprites = [
  { id: "Sprite1", x: 100, y: 100, costume: "blue", scripts: [], events: {} }
];
let broadcastQueue = [];

function drawSprites() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sprites.forEach(sprite => {
    ctx.fillStyle = sprite.costume;
    ctx.fillRect(sprite.x, sprite.y, 40, 40);
  });
}

setInterval(drawSprites, 100);

// === BLOCK DEFINITIONS ===
Blockly.defineBlocksWithJsonArray([
  {
    "type": "event_when_run",
    "message0": "when run",
    "nextStatement": null,
    "colour": 20
  },
  {
    "type": "event_broadcast",
    "message0": "broadcast %1",
    "args0": [{ "type": "field_input", "name": "MSG", "text": "message" }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20
  },
  {
    "type": "event_when_receive",
    "message0": "when I receive %1",
    "args0": [{ "type": "field_input", "name": "MSG", "text": "message" }],
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
    "type": "turn_right",
    "message0": "turn right %1 degrees (visual only)",
    "args0": [{ "type": "field_angle", "name": "ANGLE", "angle": 90 }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 210
  },
  {
    "type": "change_costume",
    "message0": "switch costume to %1",
    "args0": [{ "type": "field_input", "name": "COSTUME", "text": "red" }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160
  },
  {
    "type": "sound_play",
    "message0": "play sound %1",
    "args0": [{ "type": "field_input", "name": "SOUND", "text": "Beep" }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 300
  },
  {
    "type": "say_message",
    "message0": "say %1",
    "args0": [{ "type": "field_input", "name": "TEXT", "text": "Hello!" }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 60
  }
]);

// === GENERATORS ===
Blockly.JavaScript['event_when_run'] = block => 'START\n';
Blockly.JavaScript['event_broadcast'] = block => `broadcast("${block.getFieldValue('MSG')}");\n`;
Blockly.JavaScript['event_when_receive'] = block => `RECEIVE:${block.getFieldValue('MSG')}\n`;
Blockly.JavaScript['move_steps'] = block => `sprite.x += ${block.getFieldValue('STEPS')};\n`;
Blockly.JavaScript['go_to_xy'] = block => `sprite.x = ${block.getFieldValue('X')}; sprite.y = ${block.getFieldValue('Y')};\n`;
Blockly.JavaScript['turn_right'] = () => `/* visual only */\n`;
Blockly.JavaScript['change_costume'] = block => `sprite.costume = "${block.getFieldValue('COSTUME')}";\n`;
Blockly.JavaScript['sound_play'] = block => `console.log("Play sound: ${block.getFieldValue('SOUND')}");\n`;
Blockly.JavaScript['say_message'] = block => `alert("${block.getFieldValue('TEXT')}");\n`;

// === RUN ENGINE ===
function runCode() {
  const code = Blockly.JavaScript.workspaceToCode(workspace).split('\n');
  sprites.forEach(sprite => {
    sprite.scripts = [];
    let active = false;
    for (let line of code) {
      if (line === 'START') active = true;
      else if (line.startsWith('RECEIVE:')) sprite.events[line.slice(8)] = [];
      else if (active) sprite.scripts.push(line);
    }
    sprite.scripts.forEach(line => eval(line));
  });
}

function broadcast(msg) {
  sprites.forEach(sprite => {
    const lines = sprite.events[msg];
    if (lines) lines.forEach(code => eval(code));
  });
}

// === SAVE/LOAD ===
function saveProject() {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const data = Blockly.Xml.domToText(xml);
  localStorage.setItem("codekidz_project", data);
  alert("Project saved!");
}

function loadProject() {
  const data = localStorage.getItem("codekidz_project");
  if (data) {
    Blockly.Xml.clearWorkspaceAndLoadFromXml(Blockly.Xml.textToDom(data), workspace);
    alert("Project loaded!");
  } else {
    alert("No project found.");
  }
}
