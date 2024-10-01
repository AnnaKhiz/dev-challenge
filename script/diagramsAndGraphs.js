export function createAxes(ctx, canvas, headers, selectedDiagramType) {

  // Y axis
  ctx.beginPath();
  ctx.font = '12px Roboto';
  ctx.strokeStyle = 'black';
  ctx.moveTo(50, 10);
  ctx.lineTo(50, canvas.height - 30);
  ctx.stroke();
  ctx.save();

  ctx.translate(0, 150);
  ctx.rotate(-Math.PI / 2);

  ctx.font = '12px Roboto';
  ctx.fillStyle = '#D32F2F';
  ctx.fillText(headers[1], 0, 10);
  ctx.restore();

  // X axis
  ctx.beginPath();
  ctx.font = '12px Roboto';
  ctx.strokeStyle = 'black';
  ctx.moveTo(50, canvas.height - 30);
  ctx.lineTo(canvas.width, canvas.height - 30);
  ctx.stroke();
  ctx.font = '12px Roboto';
  ctx.fillStyle = '#D32F2F';
  ctx.fillText(headers[0], canvas.width - 20, canvas.height - 10);
}

export function createCanvas() {
  const canvas = document.getElementById('chart-canvas');
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  return { ctx, canvas }
}

export function getTableData() {
  const table = document.querySelector('#table-container > table');
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
    labels.push(cells[0].innerText);
    values.push(parseInt(cells[1].innerText));
  }



  return { labels, values, headers }
}
