export function createAxes(ctx, canvas, headers, customSettings) {


  // Y axis
  ctx.beginPath();
  ctx.font = '10px Roboto';
  ctx.strokeStyle = 'black';
  ctx.moveTo(50, 10);
  ctx.lineTo(50, canvas.height - 30);
  ctx.stroke();
  ctx.save();

  ctx.translate(0, 150);
  ctx.rotate(-Math.PI / 2);

  ctx.font = '10px Roboto';
  ctx.fillStyle = customSettings.axisLabelColor;
  ctx.fillText(customSettings.yAxesName ? customSettings.yAxesName : headers[1], 0, 15);
  ctx.restore();

  // X axis
  ctx.beginPath();
  ctx.font = '10px Roboto';
  ctx.strokeStyle = 'black';
  ctx.moveTo(50, canvas.height - 30);
  ctx.lineTo(canvas.width - 20, canvas.height - 30);
  ctx.stroke();
  ctx.font = '10px Roboto';
  ctx.fillStyle = customSettings.axisLabelColor;
  ctx.fillText(customSettings.xAxesName ? customSettings.xAxesName : headers[0], canvas.width - 25, canvas.height - 10);
}

export function createCanvas(diagramName) {
  const canvas = document.getElementById('chart-canvas');
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  console.log('diagram name:  ', diagramName)
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'black';
  ctx.fillText(diagramName, canvas.width / 2, 20);

  return { ctx, canvas }
}

export function getTableData() {
  const table = document.querySelector('#table-content > table');
  const rows = table.querySelectorAll('tr');

  const labels = [];
  const values = [];
  const headers = [];
  const rowElements = rows[0].querySelectorAll('td')

  for (let i = 0; i < rowElements.length; i++) {
    const cells = rows[0].querySelectorAll('td');
    headers.push(cells[i].innerText)
  }

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td');
    if (labels.includes(cells[0].innerText)) {
      const index = labels.findIndex(el => el === cells[0].innerText)

      if (index === -1) return;

      values[index] = values[index] + parseInt(cells[1].innerText);
    } else {
      labels.push(cells[0].innerText);
      values.push(parseInt(cells[1].innerText));
    }
  }
  return { labels, values, headers }
}

export function getOrderAndDecimalSequence(number) {
  if (number === 0) return;
  const absNumber = Math.abs(number);

  let order = 0;
  let tempNumber = absNumber;

  while (tempNumber >= 10) {
    tempNumber /= 10;
    order++;
  }

  const baseValue = Math.pow(10, order - 1);

  const decimalSequence = [];
  let currentValue = baseValue;

  while (currentValue <= Math.ceil(absNumber / baseValue) * baseValue) {
    decimalSequence.push(currentValue);
    currentValue += baseValue;
  }

  return decimalSequence
}
