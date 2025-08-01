let workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  scrollbars: true
});

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

let sprites = [{ x: 240, y: 180 }];
let clones = [];
let sounds = {};
let broadcasts = {};
let darkMode = false;

function drawSprites() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sprites.concat(clones).forEach(sprite => {
    ctx.fillStyle = 'red';
    ctx.fillRect(sprite.x - 10, sprite.y - 10, 20, 20);
  });
}

function runCode() {
  clones = [];
  broadcasts = {};
  try {
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    eval(code);
    drawSprites();
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

// --- Custom Blockly Blocks ---

Blockly.Blocks['event_when_run'] = {
  init: function() {
    this.appendDummyInput().appendField("when run");
    this.appendStatementInput("DO").setCheck(null);
    this.setColour(20);
    this.setTooltip("Run this when play is clicked.");
  }
};

Blockly.JavaScript['event_when_run'] = function(block) {
  return Blockly.JavaScript.statementToCode(block, 'DO');
};

Blockly.Blocks['move_steps'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("move")
      .appendField(new Blockly.FieldNumber(10), "STEPS")
      .appendField("steps");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
  }
};

Blockly.JavaScript['move_steps'] = function(block) {
  const steps = block.getFieldValue('STEPS');
  return `sprites[0].x += ${steps}; drawSprites();\n`;
};

Blockly.Blocks['go_to_xy'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("go to x:")
      .appendField(new Blockly.FieldNumber(0), "X")
      .appendField("y:")
      .appendField(new Blockly.FieldNumber(0), "Y");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
  }
};

Blockly.JavaScript['go_to_xy'] = function(block) {
  const x = block.getFieldValue('X');
  const y = block.getFieldValue('Y');
  return `sprites[0].x = ${x}; sprites[0].y = ${y}; drawSprites();\n`;
};

Blockly.Blocks['sound_play'] = {
  init: function() {
    this.appendDummyInput().appendField("play sound").appendField(new Blockly.FieldTextInput("sound.mp3"), "SRC");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(300);
  }
};

Blockly.JavaScript['sound_play'] = function(block) {
  const src = block.getFieldValue('SRC');
  return `new Audio('${src}').play();\n`;
};

Blockly.Blocks['change_costume'] = {
  init: function() {
    this.appendDummyInput().appendField("change costume to").appendField(new Blockly.FieldTextInput("costume.png"), "COSTUME");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(160);
  }
};

Blockly.JavaScript['change_costume'] = function(block) {
  const costume = block.getFieldValue('COSTUME');
  return `/* Costume change: ${costume} */\n`;
};

Blockly.Blocks['create_clone'] = {
  init: function() {
    this.appendDummyInput().appendField("create clone");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(120);
  }
};

Blockly.JavaScript['create_clone'] = function() {
  return `clones.push({...sprites[0]}); drawSprites();\n`;
};

Blockly.Blocks['say_message'] = {
  init: function() {
    this.appendDummyInput().appendField("say").appendField(new Blockly.FieldTextInput("Hello!"), "MSG");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(60);
  }
};

Blockly.JavaScript['say_message'] = function(block) {
  const msg = block.getFieldValue('MSG');
  return `alert("${msg}");\n`;
};

Blockly.Blocks['event_broadcast'] = {
  init: function() {
    this.appendDummyInput().appendField("broadcast").appendField(new Blockly.FieldTextInput("message"), "MSG");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(20);
  }
};

Blockly.JavaScript['event_broadcast'] = function(block) {
  const msg = block.getFieldValue('MSG');
  return `broadcasts["${msg}"] = true;\n`;
};

Blockly.Blocks['event_when_receive'] = {
  init: function() {
    this.appendDummyInput().appendField("when I receive").appendField(new Blockly.FieldTextInput("message"), "MSG");
    this.appendStatementInput("DO").setCheck(null);
    this.setColour(20);
  }
};

Blockly.JavaScript['event_when_receive'] = function(block) {
  const msg = block.getFieldValue('MSG');
  const code = Blockly.JavaScript.statementToCode(block, 'DO');
  return `if (broadcasts["${msg}"]) {\n${code}}\n`;
};

// --- Theme Toggle ---
document.getElementById('modeToggle').addEventListener('change', (e) => {
  document.body.className = e.target.checked ? 'dark' : 'light';
});

// --- Upload ---
function uploadBackdrop() {
  document.getElementById('backdropInput').click();
}
document.getElementById('backdropInput').addEventListener('change', (e) => {
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawSprites();
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

function uploadSound() {
  document.getElementById('soundInput').click();
}

function saveProject() {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const xmlText = Blockly.Xml.domToText(xml);
  localStorage.setItem("codekidz_project", xmlText);
  alert("Project saved!");
}

function loadProject() {
  const xmlText = localStorage.getItem("codekidz_project");
  if (!xmlText) return alert("No project saved.");
  const xml = Blockly.Xml.textToDom(xmlText);
  Blockly.Xml.domToWorkspace(xml, workspace);
  alert("Project loaded!");
}
