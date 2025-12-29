//
// Table internals
//

const columnNames = [ `P(x)`, `x_0`, `x_1`, `x_2`, `x_3`, `x_4`, `P(x_0)`, `P(x_1)`, `P(x_2)`, `P(x_3)`, `P(x_4)`, `rhodot` ];
const columnBaseWidths = columnNames.map(x => x.length);
const columnWidths = columnNames.map(x => x.length);
const rows = [];

const addRow = (row) => {
  let tryIncreaseWidth = (index, name) => {
    if (row[name] != undefined && row[name]["length"] != undefined) {
      columnWidths[index] = Math.max(columnWidths[index], row[name]["length"]);
    }
  }
  
  rows.push([ row[`p_x`], row[`x_0`], row[`x_1`], row[`x_2`], row[`x_3`], row[`x_4`], row[`p_x0`], row[`p_x1`], row[`p_x2`], row[`p_x3`], row[`p_x4`], row[`rhodot`] ]);
  tryIncreaseWidth(0, `p_x`);
  tryIncreaseWidth(1, `x_0`);
  tryIncreaseWidth(2, `x_1`);
  tryIncreaseWidth(3, `x_2`);
  tryIncreaseWidth(4, `x_3`);
  tryIncreaseWidth(5, `x_4`);
  tryIncreaseWidth(6, `p_x0`);
  tryIncreaseWidth(7, `p_x1`);
  tryIncreaseWidth(8, `p_x2`);
  tryIncreaseWidth(9, `p_x3`);
  tryIncreaseWidth(10, `p_x4`);
  tryIncreaseWidth(11, `rhodot`);
}

const resolveQuadratic = (a0Level, a1Level, a2Level) => {
  const result = remote(`(() => {
const polynomialDegree = 2;
const a4HypopMsLevel = 0;
const a5HypopMsLevel = 0;
let a0Value = getA0(${a0Level});
let a1Value = getA1(${a1Level});
let a2Value = getA2(${a2Level});

const P = (x) => x.mul(x).mul(BigComplexNumber.fromReal(a2Value)).add(x.mul(BigComplexNumber.fromReal(a1Value))).add(BigComplexNumber.fromReal(a0Value));
const polynomial = \`\${a2Value}x^2+\${a1Value}x+\${a0Value}\`;

let testRoots = rootSolvers[polynomialDegree]([a0Value, a1Value, a2Value]);
let sortedTestRoots = sortRoots(polynomialDegree, testRoots, a4HypopMsLevel, a5HypopMsLevel);
let mappedRoots = sortedTestRoots.map(i => P(testRoots[i]));
let rhodot = calculateRhodot(polynomialDegree, i => testRoots[sortedTestRoots[i]], a4HypopMsLevel, a5HypopMsLevel);

return \`\${polynomial} \${testRoots[sortedTestRoots[0]].toLatexString()} \${testRoots[sortedTestRoots[1]].toLatexString()} \${mappedRoots[1].toLatexString()} \${mappedRoots[1].toLatexString()} \${rhodot}\`;
})()`).split(' ');

  addRow({
    p_x: result[0],
    x_0: result[1],
    x_1: result[2],
    p_x0: result[3],
    p_x1: result[4],
    rhodot: result[5]
  });
}

const resolveCubic = (a0Level, a1Level, a2Level, a3Level) => {
  const result = remote(`(() => {
const polynomialDegree = 3;
const a4HypopMsLevel = 0;
const a5HypopMsLevel = 0;
let a0Value = getA0(${a0Level});
let a1Value = getA1(${a1Level});
let a2Value = getA2(${a2Level});
let a3Value = getA3(${a3Level});

const P = (x) => x.mul(x).mul(x).mul(BigComplexNumber.fromReal(a3Value)).add(x.mul(x).mul(BigComplexNumber.fromReal(a2Value))).add(x.mul(BigComplexNumber.fromReal(a1Value))).add(BigComplexNumber.fromReal(a0Value));
const polynomial = \`\${a3Value}x^3+\${a2Value}x^2+\${a1Value}x+\${a0Value}\`;

let testRoots = rootSolvers[polynomialDegree]([a0Value, a1Value, a2Value, a3Value]);
let sortedTestRoots = sortRoots(polynomialDegree, testRoots, a4HypopMsLevel, a5HypopMsLevel);
let mappedRoots = sortedTestRoots.map(i => P(testRoots[i]));
let rhodot = calculateRhodot(polynomialDegree, i => testRoots[sortedTestRoots[i]], a4HypopMsLevel, a5HypopMsLevel);

return \`\${polynomial} \${testRoots[sortedTestRoots[0]].toLatexString()} \${testRoots[sortedTestRoots[1]].toLatexString()} \${testRoots[sortedTestRoots[2]].toLatexString()} \${mappedRoots[0].toLatexString()} \${mappedRoots[1].toLatexString()} \${mappedRoots[2].toLatexString()} \${rhodot}\`;
})()`).split(' ');

  addRow({
    p_x: result[0],
    x_0: result[1],
    x_1: result[2],
    x_2: result[3],
    p_x0: result[4],
    p_x1: result[5],
    p_x2: result[6],
    rhodot: result[7]
  });
}


//
// Populating data
//


{ 
  resolveQuadratic(3, 4, 2);
}

{
  resolveCubic(5, 9, 3, 2);
  resolveCubic(3, 4, 2, 1);
  for (let i = 1; i < 3; i++) {
    for (let j = 1; j < 3; j++) {
      for (let k = 1; k < 3; k++) {
        for (let m = 1; m < 3; m++) {
          resolveCubic(3 + i, 4 + j, 2 + k, 1 + m);
        }
      }
    }
  }
}


//
// Table render
//

const totalWidth = columnWidths.reduce((a, b) => a + b, 0);

log('-'.repeat(totalWidth + 3 * columnNames.length + 1));
let rowHeader = '|';
for (let i = 0; i < columnNames.length; i++) {
  rowHeader += ` ${columnNames[i]}${' '.repeat(columnWidths[i] - columnBaseWidths[i])} |`;
}
log(rowHeader);
log('-'.repeat(totalWidth + 3 * columnNames.length + 1));
for (let i = 0; i < rows.length; i++) {
  const rowData = rows[i];
  let row = '|';
  for (let j = 0; j < rowData.length; j++) {
    if (rowData[j] == undefined) {
      row += ` ${' '.repeat(columnWidths[j])} |`;
    } else {
      row += ` ${rowData[j]}${' '.repeat(columnWidths[j] - rowData[j].length)} |`;
    }
  }
  for (let j = rowData.length; j < columnNames.length; j++) {
    row += ` ${' '.repeat(columnWidths[j])} |`;
  }
  log(row);
  log('-'.repeat(totalWidth + 3 * columnNames.length + 1));
}
