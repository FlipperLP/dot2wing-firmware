function parseButton(rawButton) {
  const button = {};
  button.name = rawButton.tt.t;
  button.isRun = !!rawButton.isRun;
  button.empty = rawButton.i.c === '#000000';
  button.color = rawButton.bdC;
  return button;
}

function buttonRow(row) {
  const buttons = [];
  row.items.forEach((buttonRaw) => {
    buttons.push(parseButton(buttonRaw[0]));
  });
  return buttons;
}

// function parseFaderButton(rawButton) {
//   console.log(rawButton);
// }

function parseFader(rawFader) {
  const output = {};
  output.fader = {};
  const execBlocks = rawFader.executorBlocks[0];
  output.fader.name = rawFader.tt.t;
  output.fader.isRun = !!rawFader.isRun;
  output.fader.empty = rawFader.i.c === '#000000';
  output.fader.color = rawFader.bdC;
  output.fader.value = execBlocks.fader.v;
  // output.upperButton = { isPressed: parseFaderButton(execBlocks.button1) };
  // output.lowerButton = { isPressed: parseFaderButton(execBlocks.button2) };
  return output;
}

function faderRow(row) {
  const faders = [];
  row.items.forEach((faderRaw) => {
    faders.push(parseFader(faderRaw[0]));
  });
  return faders;
}

export function parseValues(rawData) {
  const output = [];
  rawData.itemGroups.forEach((row) => {
    let parsedFaders;
    let parsedButtons;
    switch (row.itemsType) {
      case 2:
        parsedFaders = faderRow(row);
        break;
      case 3:
        parsedButtons = buttonRow(row);
        break;
      default: break;
    }
    if (parsedFaders) output.fader = parsedFaders;
    if (parsedButtons) output.push(parsedButtons);
  });
  return output;
}

export { parseValues as default };
