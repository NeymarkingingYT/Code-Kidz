// Inject Blockly
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
  trashcan: true
});

// Define custom block
Blockly.defineBlocksWithJsonArray([
  {
    type: "say_message",
    message0: "say %1",
    args0: [
      {
        type: "field_input",
        name: "TEXT",
        text: "Hello!"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 60
  }
]);

// JS code for say_message
Blockly.JavaScript['say_message'] = function(block) {
  const msg = block.getFieldValue('TEXT');
  return `alert("${msg}");\n`;
};

// Run Button
function runCode() {
  const code = Blockly.JavaScript.workspaceToCode(workspace);
  try {
    eval(code);
  } catch (err) {
    alert("⚠️ Error: " + err);
  }
}
