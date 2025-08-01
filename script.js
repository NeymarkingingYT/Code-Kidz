// Inject Blockly
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox')
});

// Define blocks
Blockly.defineBlocksWithJsonArray([
  {
    "type": "say_message",
    "message0": "say %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TEXT",
        "text": "Hello!"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160
  }
]);

// Generate JS code for block
Blockly.JavaScript['say_message'] = function(block) {
  const msg = block.getFieldValue('TEXT');
  return `alert("${msg}");\n`;
};

// Run button
function runCode() {
  const code = Blockly.JavaScript.workspaceToCode(workspace);
  try {
    eval(code);
  } catch (e) {
    alert("Error: " + e);
  }
}
