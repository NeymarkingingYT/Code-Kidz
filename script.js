var workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.8
  },
  trashcan: true
});

workspace.addChangeListener(() => {
  const code = Blockly.JavaScript.workspaceToCode(workspace);
  console.clear();
  console.log(code);
});
