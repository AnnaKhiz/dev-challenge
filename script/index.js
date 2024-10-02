import { checkFileType, isJSON } from "./validation.js";
import { createAxes, getTableData, createCanvas, getOrderAndDecimalSequence } from "./diagramsAndGraphs.js";
import { exportToPNG, exportToSVG, printAndExportToPDF, increaseDiagram } from "./exportFunctions.js";
import { updateCanvas } from "./customSettings.js";

const formatTypesList = document.querySelector('.form-list');
const inputUploadElement = document.getElementById('upload-file');
const infoContainerElement = document.getElementById('info-container');
const formElement = document.getElementById('files-form');
const submitButtonElement = document.getElementById('submit-button');
const lIHiddenTextarea = formatTypesList.querySelector('li[data="textarea-hidden"]');
const lIHiddenUpload = formatTypesList.querySelector('li[data="upload-hidden"]')
const tableContainerElement = document.getElementById("table-container");
const tableContentElement = document.getElementById("table-content");
const textareaElement = document.getElementById('raw-data')
const createDiagramButton = document.getElementById('chart-button');
const dragAndDropZone = document.getElementById('drag-drop-zone');
const dragAndDropEvents = ["dragover", "drop"];
const dropUploadedInfo = document.getElementById('drop-uploaded-info');
const iconDownload = dragAndDropZone.querySelector('span.material-symbols-outlined');
const chartOptionsContainerElement = document.getElementById('chart-options-container');
const diagramTypeSelect = document.getElementById('diagram-type-select');
const exportPDF = document.getElementById('export-pdf');
const exportPNG = document.getElementById('export-png');
const exportSVG = document.getElementById('export-svg');
const printButton = document.getElementById('print');
const canvasExportContainer = document.getElementById('canvas-export');
const canvasContainerElement = document.getElementById('canvas-container')
const canvasTitleElement = document.getElementById('canvas-title');
const updateChartButtonElement = document.getElementById('update-chart-button');
const customDiagramNameElement = document.getElementById('input-diagram-name');
const formOptionalSettings = document.getElementById('form-optional-settings');
const asideOptionalSettingsContainer = document.getElementById('aside-optional-container')




formOptionalSettings.addEventListener('input', (e) => {
  e.preventDefault();
  const element = document.getElementById(e.target.dataset.countdown)

  Number(element.innerText) !== 0 ? element.innerText -= 1 : element.innerText = 0
})


console.dir(inputUploadElement)

let selectedFile = null
let selectedDiagramType = '';
let checkedLiElement = ''

let customOptions = {
  name: '',
  lineColor: '#0056A2',
  dotsColor: '#003366',
  axisLabelColor: '#D32F2F',
  yAxesName: '',
  xAxesName: '',
}
let isUpdate = false;

document.addEventListener('DOMContentLoaded', () => {
	checkedLiElement = formatTypesList.querySelector('[checked]')
})


formOptionalSettings.addEventListener('submit', (e) => {
  e.preventDefault();

  isUpdate = true;
  console.log('edit')

  const form = new FormData(formOptionalSettings)

  for (let [key, value] of form.entries()) {
    console.log('value +++++++', key, value)
    if (value) {
      console.log('value', value)
      customOptions[key] = value;

    }
    // else {
    //   console.log(customOptions)
    //   customOptions[key] = customOptions[key]
    // }

  }


  console.log(customOptions)

  // customOptions.name = customDiagramNameElement.value;

  console.log('update custom name --- ', customOptions.name)
  createDiagram()
})


dragAndDropEvents.forEach(function (event) {

  document.addEventListener(event, function (evt) {
    evt.preventDefault();
    return false;
  });
});

dragAndDropZone.addEventListener('drop', (event) => {
  dragAndDropZone.classList.remove('active');
  const file = event.dataTransfer?.files[0];

  if (file && checkFileType(file)) {
    inputUploadElement.files = event.dataTransfer.files;
    selectedFile = event.dataTransfer.files[0];

    dropUploadedInfo.innerText = `Uploaded: ${selectedFile.name}`;

    console.log(iconDownload)
    iconDownload.classList.add('hidden')
    console.log(selectedFile)
    submitButtonElement.disabled = false;
    // console.log(inputUploadElement.files)
  } else {
    infoContainerElement.innerText = 'Incorrect file type! Allowed types - .csv, .json, .xls, .xlsx!'
    inputUploadElement.value = null;
    submitButtonElement.disabled = true;
  }
})

dragAndDropZone.addEventListener('dragenter', () => {
  dragAndDropZone.classList.add('active')
})

dragAndDropZone.addEventListener('dragleave', () => {
  dragAndDropZone.classList.remove('active')
})




// radio buttons, show/hide textarea form
formatTypesList.addEventListener('click', (event) => {
	let lIElement = null;

	if (!checkedLiElement) {
		lIElement = event.target.closest('li')
	} else {
		lIElement = checkedLiElement;
		checkedLiElement = ''
	}


	if (!lIElement) {
		lIElement.dataset.type = 'allowed'
		lIElement = event.target.closest('li')
	}

	console.log(lIElement)

	const input = lIElement.querySelector('input[type="radio"]')

	if (input) {
		input.checked = true;

		if (input.value === 'raw') {
      selectedFile = null
      submitButtonElement.disabled = false;
			infoContainerElement.innerText = ''
			lIHiddenTextarea.classList.remove('hidden')
			lIHiddenUpload.classList.add('hidden')
		} else {
      submitButtonElement.disabled = true;
			infoContainerElement.innerText = ''
			lIHiddenUpload.classList.remove('hidden')
			lIHiddenTextarea.classList.add('hidden')
		}

	}
})

inputUploadElement.addEventListener('change', (event) => {
  infoContainerElement.innerText = '';
	const file = inputUploadElement.files?.[0];

  console.log('file', file)

  if (file && checkFileType(file)) {
    selectedFile = file;
    dropUploadedInfo.innerText = `Uploaded: ${selectedFile.name}`;
    iconDownload.classList.add('hidden')
    submitButtonElement.disabled = false;
  } else {
    infoContainerElement.innerText = 'Incorrect file type! Allowed types - .csv, .json, .xls, .xlsx!'
    inputUploadElement.value = null;
    submitButtonElement.disabled = true;
  }

})

function uploadAndRenderExcelFiles(e) {

		const content = e.target.result;

		const data = new Uint8Array(content);
		const workbook = XLSX.read(data, {type: 'array'});
		const wsname = workbook.SheetNames[0];
		const ws = workbook.Sheets[wsname];

		if (!workbook.Strings.length) {
			infoContainerElement.innerText = 'Emply file!';
			submitButtonElement.disabled = true;
			return false;
		}

    chartOptionsContainerElement.classList.remove('hidden')

  tableContentElement.innerHTML = XLSX.utils.sheet_to_html(ws);

	if (tableContentElement.innerHTML !== '') {
		resetUploadFormData();
		return
	}
	submitButtonElement.disabled = false;
}

function uploadAndRenderJSONFile(e) {
	const content = selectedFile ? e.target.result.trim() : textareaElement.value;

	if (content.length === 0 || content === '[]') {
			infoContainerElement.innerText = 'Empty file!';
			submitButtonElement.disabled = true;
			return;
	}

  chartOptionsContainerElement.classList.remove('hidden')

  if (!isJSON(content)) {
    infoContainerElement.innerText = 'This file with errors!';
    submitButtonElement.disabled = true;
    return;
  }

	const parsedJSON = JSON.parse(content);

	const table = document.createElement('table');
	const headers = Object.keys(parsedJSON[0]);

	const headerHTML = `
			<tr>
					${headers.map(header => `<td>${header}</td>`).join('')}
			</tr>
	`;

	const rowsHTML = parsedJSON.map(row => `
			<tr>
					${headers.map(key => `<td>${row[key]}</td>`).join('')}
			</tr>
	`).join('');

	table.innerHTML = headerHTML + rowsHTML;
  tableContentElement.appendChild(table);

}

function uploadAndRenderCSVFile(e) {
  const content = selectedFile ? e.target.result.trim() : textareaElement.value;

  if (content.trim().length === 0 || content === '[]') {
    infoContainerElement.innerText = 'Emply file!';
    submitButtonElement.disabled = true;
    return ;
  }

  chartOptionsContainerElement.classList.remove('hidden')

  const parsedCSV = content.split('\n').map(el => el.split(','));
  const table = document.createElement('table');
  const headers = parsedCSV[0];

  const headerHTML = `
			<tr>
					${headers.map(header => `<td>${header}</td>`).join('')}
			</tr>
	`;

  parsedCSV.splice(0,1);

  const rowsHTML = parsedCSV.map(row => `
			<tr>
					${headers.map((key, index) => `<td>${row[index]}</td>`).join('')}
			</tr>
	`).join('');

  table.innerHTML = headerHTML + rowsHTML;

  tableContentElement.appendChild(table);

}

function resetUploadFormData() {
	lIHiddenTextarea.classList.add('hidden');
	infoContainerElement.innerText = '';
	inputUploadElement.value = null;
	submitButtonElement.disabled = false;
}

function uploadRawData() {
  const rawData = textareaElement.value;

  if (!rawData.trim().length) {
    infoContainerElement.innerText = 'Empty field!';
    return
  }

  if (isJSON(rawData)) {
    infoContainerElement.innerText = 'This is JSON file';
    uploadAndRenderJSONFile()
  } else {
    infoContainerElement.innerText = 'This is CSV file';
    uploadAndRenderCSVFile()
  }
}

function uploadFileData() {
  const reader = new FileReader();

  if (selectedFile.type === 'application/vnd.ms-excel' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ) {
    reader.onload = uploadAndRenderExcelFiles;

    reader.readAsArrayBuffer(selectedFile);

  } else {
    if (selectedFile.type === 'application/json') {
      reader.onload = uploadAndRenderJSONFile;
      resetUploadFormData();
      reader.readAsText(selectedFile, 'utf-8');
    } else {
      reader.onload = uploadAndRenderCSVFile;
      resetUploadFormData();
      reader.readAsText(selectedFile, 'utf-8');
    }

  }

  reader.onerror = function(e) {
    console.log('Error in reading files', e)
  }
}

formElement.addEventListener('submit', (event) => {
	event.preventDefault();
  tableContentElement.innerHTML = '';
  console.log(selectedFile)
  if (!selectedFile) {
    uploadRawData()
    tableContainerElement.classList.remove('hidden')
  } else {
    dropUploadedInfo.innerText = '';
    iconDownload.classList.remove('hidden')
    uploadFileData()
    tableContainerElement.classList.remove('hidden')
  }
})

function createCanvasBarDiagram() {
  const { labels, values, headers } = getTableData();
  const { canvas, ctx } = createCanvas(customOptions.name);

  createAxes(ctx, canvas, headers, customOptions);

  const padding = 20;
  const totalHeight = canvas.height - 40;
  const barWidth = (canvas.width - 80) / values.length;
  const maxValue = Math.max(...values);
  const minValue = 0;

  console.log(maxValue)

  const yStep = getOrderAndDecimalSequence(maxValue);
  const ySegments = yStep.length;

  console.log(yStep)

  for (let i = 0; i <= ySegments; i++) {
    const yValue = yStep[i]; // Значение для подписи
    const yPosition = canvas.height - 30 - (yValue / maxValue) * (totalHeight - 2 * padding); // Позиция по Y для подписи

    ctx.fillStyle = '#000';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(yValue), 45, yPosition + 5);
  }


  for (let i = 0; i < values.length; i++) {
    const x = 50 + i * barWidth;
    const barHeight = (values[i] / maxValue) * (totalHeight - 2 * padding);
    const y = canvas.height - 30 - barHeight;

    ctx.fillStyle = customOptions.lineColor;
    ctx.fillRect(x, y, barWidth - 10, barHeight);

    ctx.save();
    ctx.fillStyle = '#000';
    ctx.font = '10px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText(values[i], x + (barWidth - 10) / 2, y - 5);

    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + (barWidth - 10) / 2, canvas.height - 10);

  }

}


function createCanvasLinearGraph() {
  const { labels, values, headers } = getTableData();
  const { canvas, ctx } = createCanvas(customOptions.name);

  createAxes(ctx, canvas, headers, customOptions);

  const barWidth = (canvas.width - 80) / values.length;
  const maxValue = Math.max(...values);
  const minValue = 0;

  const padding = 20;
  const totalHeight = canvas.height - 40;


  const yStep = getOrderAndDecimalSequence(maxValue);
  const ySegments = yStep.length;

  // const ySegments = values.length;
  // const yStep = 20;

  for (let i = 0; i <= ySegments; i++) {
    const yValue = yStep[i];
    const yPosition = canvas.height - 30 - (yValue / maxValue) * (totalHeight - 2 * padding); // Позиция по Y для подписи

    // Рисуем подпись на оси Y
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';

    ctx.fillText(Math.round(yValue), 45, yPosition + 5);

  }

  ctx.beginPath();
  const startX = 50 + barWidth / 2;
  const startY = canvas.height - 30 - ((values[0] - minValue) / (maxValue - minValue) * (totalHeight - 2 * padding));
  ctx.moveTo(startX, startY);


  for (let i = 0; i < values.length; i++) {
    const x = 50 + barWidth * i + barWidth / 2;
    const y = canvas.height - 30 - ((values[i] - minValue) / (maxValue - minValue) * (totalHeight - 2 * padding));

    ctx.lineTo(x, y);
  }

  ctx.strokeStyle = customOptions.lineColor;
  ctx.stroke();

  for (let i = 0; i < values.length; i++) {
    const x = 50 + barWidth * i + barWidth / 2;
    const y = canvas.height - 30 - ((values[i] - minValue) / (maxValue - minValue) * (totalHeight - 2 * padding));

    ctx.lineTo(x , y);

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = customOptions.dotsColor;
    ctx.fill();
    ctx.closePath()

    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';

    if (i % 2 === 0) {
      ctx.fillText(values[i], x, y - 10);
    } else {
      ctx.fillText(values[i], x, y + 20);
    }

    ctx.fillText(labels[i], x, canvas.height - 10);

    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';

    ctx.fillText(labels[i], x, canvas.height - 10);
  }

}

function createCanvasPieDiagram() {
  const { labels, values, headers } = getTableData();
  const { canvas, ctx } = createCanvas(customOptions.name);

  createAxes(ctx, canvas, headers, customOptions);

  const total = values.reduce((sum, value) => sum + value, 0);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) / 3;

  let startAngle = 0;
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  for (let i = 0; i < values.length; i++) {
    const sliceAngle = (values[i] / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();


    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    const middleAngle = startAngle + sliceAngle / 2;
    const textX = centerX + Math.cos(middleAngle) * (radius + 20);
    const textY = centerY + Math.sin(middleAngle) * (radius + 20);

    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], textX, textY);

    startAngle += sliceAngle;
  }

  for (let i = 0; i < values.length; i++) {
    const legendX = canvas.width - 100;
    const legendY = 20 + i * 20;


    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(legendX, legendY, 15, 15);


    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText(values[i], legendX + 20, legendY + 12);
  }


}

diagramTypeSelect.addEventListener('change', (e) => {
  console.log(e.target.value)
  selectedDiagramType = e.target.value;
  createDiagram()
})

function createDiagram() {
  if (isUpdate) {

    const { name, lineColor, dotsColor, xAxesName, yAxesName, axisLabelColor} = customOptions;

    customOptions.name = name || customOptions.name || '';
    customOptions.lineColor = lineColor || customOptions.lineColor || '';
    customOptions.dotsColor = dotsColor || customOptions.dotsColor || '';
    customOptions.xAxesName = xAxesName || customOptions.xAxesName || '';
    customOptions.yAxesName = yAxesName || customOptions.yAxesName || '';
    customOptions.axisLabelColor = axisLabelColor || customOptions.axisLabelColor || ''

    createDiagramButton.disabled = selectedDiagramType
  } else {

    if (selectedDiagramType !== '') {
      customOptions.name = selectedFile.name.split('.')[0];
      createDiagramButton.disabled = false

    } else {
      createDiagramButton.disabled = false
    }
  }

  defineDiagramType();
  canvasExportContainer.disabled = false
}

function updateDiagramSettings(field) {
  if (!field || field === '') {
    customOptions[field] = !field || field === '' ? customOptions[field] : '';
  } else {
    customOptions[field] = field
  }
}





createDiagramButton.addEventListener('click', (e) => {
  e.preventDefault();

  if (selectedDiagramType !== '') {
    canvasContainerElement.classList.remove('hidden');
    canvasExportContainer.classList.remove('hidden')
    asideOptionalSettingsContainer.classList.remove('hidden');
  }



})

canvasContainerElement.addEventListener('click', increaseDiagram)

exportPNG.addEventListener('click', exportToPNG)

exportSVG.addEventListener('click', exportToSVG)

exportPDF.addEventListener('click', printAndExportToPDF)

printButton.addEventListener('click', printAndExportToPDF)

function defineDiagramType() {
  switch (selectedDiagramType) {
    case 'bar': return createCanvasBarDiagram();
    case 'pie': return createCanvasPieDiagram();
    default: return createCanvasLinearGraph()
  }
}

