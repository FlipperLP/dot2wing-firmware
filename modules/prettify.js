export function prettify(rawData) {
  // row
  const rows = [];
  for (let row = 0; row <= 8; row++) {
    // buttonrow
    const button1 = {
      name: rawData.itemGroups[1].items[row][0].tt.t,
      id: rawData.itemGroups[1].items[row][0].i.t,
      isRun: rawData.itemGroups[1].items[row][0].isRun,
    };
    const button2 = {
      name: rawData.itemGroups[2].items[row][0].tt.t,
      id: rawData.itemGroups[2].items[row][0].i.t,
      isRun: rawData.itemGroups[2].items[row][0].isRun,
    };
    // faderExecutor
    const name = rawData.itemGroups[0].items[5][0].tt.t;
    const isRun = rawData.itemGroups[0].items[5][0].isRun;
    const go = {
      name: rawData.itemGroups[0].items[row][0].executorBlocks[0].button1.t,
    };
    const flash = {
      name: rawData.itemGroups[0].items[row][0].executorBlocks[0].button2.t,
    };
    const faderExecutor = {
      name, isRun, go, flash,
    };
    rows.push({
      row, button1, button2, faderExecutor,
    });
  }
  return rows;
}

export { prettify as default };
