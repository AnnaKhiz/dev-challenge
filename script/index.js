import { checkFileType, isJSON } from "./validation.js";
const formatTypesList = document.querySelector('.form-list');
const inputUploadElement = document.getElementById('upload-file');
const infoContainerElement = document.getElementById('info-container');
const formElement = document.getElementById('files-form');
const submitButtonElement = document.getElementById('submit-button');
const lIHiddenTextarea = formatTypesList.querySelector('li[data="textarea-hidden"]');
const lIHiddenUpload = formatTypesList.querySelector('li[data="upload-hidden"]')
const tableContainerElement = document.getElementById("table-container");
const textareaElement = document.getElementById('raw-data')
const chartButtonElement = document.getElementById('chart-button');
const dragAndDropZone = document.getElementById('drag-drop-zone');
const dragAndDropEvents = ["dragover", "drop"];
const dropUploadedInfo = document.getElementById('drop-uploaded-info');
const iconDownload = dragAndDropZone.querySelector('span.material-symbols-outlined');
const chartOptionsContainerElement = document.getElementById('chart-options-container');
const diagramTypeSelect = document.getElementById('diagram-type-select');

let selectedFile = null
let selectedDiagramType = 'bar';
let checkedLiElement = ''

document.addEventListener('DOMContentLoaded', () => {
	checkedLiElement = formatTypesList.querySelector('[checked]')
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

	const file = inputUploadElement.files?.[0];

  console.log('file', file)

  if (checkFileType(file)) {
    selectedFile = file;
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

		tableContainerElement.innerHTML = XLSX.utils.sheet_to_html(ws);

	if (tableContainerElement.innerHTML !== '') {
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
	tableContainerElement.appendChild(table);

}

function resetUploadFormData() {
	lIHiddenTextarea.classList.add('hidden');
	infoContainerElement.innerText = '';
	inputUploadElement.value = null;
	submitButtonElement.disabled = false;
}

function uploadAndRenderCSVFile(e) {
	const content = selectedFile ? e.target.result.trim() : textareaElement.value;

	if (content.trim().length === 0 || content === '[]') {
		infoContainerElement.innerText = 'Emply file!';
		submitButtonElement.disabled = true;
		return ;
	}

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

	tableContainerElement.appendChild(table);

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
	tableContainerElement.innerHTML = '';
  console.log(selectedFile)
  if (!selectedFile) {
    uploadRawData()
    chartOptionsContainerElement.classList.remove('hidden')
  } else {
    dropUploadedInfo.innerText = '';
    iconDownload.classList.remove('hidden')
    uploadFileData()
    chartOptionsContainerElement.classList.remove('hidden')
  }

})

function createCanvasBarDiagram() {

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
    values.push(Number.isNaN(cells[1].innerText) ? parseInt(cells[1].innerText) : cells[1].innerText);
  }

  console.log(labels)
  console.log(values)

  const canvas = document.getElementById('chart-canvas');
  const ctx = canvas.getContext('2d');


  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const maxVal = Math.max(...values);
  const chartHeight = canvas.height - 50;
  const barWidth = (canvas.width - 50) / values.length;


  values.forEach((value, index) => {
    const barHeight = (value / maxVal) * chartHeight;


    const x = 50 + index * barWidth;
    const y = canvas.height - barHeight - 30;


    ctx.fillStyle = 'rgba(0, 102, 204, 0.7)';
    ctx.fillRect(x, y, barWidth - 10, barHeight);


    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(labels[index], x + (barWidth / 2) - 5, canvas.height - 10);


    ctx.fillText(value, x + (barWidth / 2) - 5, y - 5);
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';

  });


  // Рисуем ось Y
  ctx.beginPath();
  ctx.moveTo(20, 10);
  ctx.lineTo(20, canvas.height - 30);
  ctx.stroke();
  ctx.save();

  ctx.translate(0, 150);
  ctx.rotate(-Math.PI / 2);

  ctx.font = '12px Roboto';
  ctx.fillStyle = 'red';
  ctx.fillText(headers[1], 0, 10);
  ctx.restore();


  // Рисуем ось X
  ctx.beginPath();
  ctx.moveTo(20, canvas.height - 30);
  ctx.lineTo(canvas.width, canvas.height - 30);
  ctx.stroke();

  ctx.font = '12px Roboto';
  ctx.fillStyle = 'red';
  ctx.fillText(headers[0], canvas.width - 20, canvas.height - 10);
}


function createCanvasLinearGraph() {

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

  const canvas = document.getElementById('chart-canvas');
  const ctx = canvas.getContext('2d');


  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Y
  ctx.beginPath();
  ctx.font = '12px Roboto';
  ctx.fillStyle = 'black';
  ctx.moveTo(50, 10);
  ctx.lineTo(50, canvas.height - 30);
  ctx.stroke();
  ctx.save();

  ctx.translate(0, 150);
  ctx.rotate(-Math.PI / 2);

  ctx.font = '12px Roboto';
  ctx.fillStyle = 'red';
  ctx.fillText(headers[1], 0, 10);
  ctx.restore();

  // X
  ctx.beginPath();
  ctx.font = '12px Roboto';
  ctx.fillStyle = 'black';
  ctx.moveTo(50, canvas.height - 30);
  ctx.lineTo(canvas.width, canvas.height - 30);
  ctx.stroke();
  ctx.font = '12px Roboto';
  ctx.fillStyle = 'red';
  ctx.fillText(headers[0], canvas.width - 20, canvas.height - 10);

  const barWidth = (canvas.width - 40) / values.length;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  const padding = 10;
  const totalHeight = canvas.height - 40;

  ctx.beginPath();
  const startX = 20 + barWidth / 2;
  const startY = canvas.height - 30 - ((values[0] - minValue) / (maxValue - minValue) * (totalHeight - 2 * padding));
  ctx.moveTo(startX, startY);

  for (let i = 0; i < values.length; i++) {
    const x = 20 + barWidth * i + barWidth / 2;
    const y = canvas.height - 30 - ((values[i] - minValue) / (maxValue - minValue) * (totalHeight - 2 * padding));

    ctx.lineTo(x , y);

    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x, canvas.height - 10);

    ctx.save();
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.translate(10, y);
    ctx.fillText(values[i], 25, 0);
    ctx.restore();
  }

  ctx.strokeStyle = 'blue';
  ctx.stroke();

}

diagramTypeSelect.addEventListener('change', (e) => {
  console.log(e.target.value)
  selectedDiagramType = e.target.value

  if (selectedDiagramType === 'bar') {
    createCanvasBarDiagram()
  }

  if (selectedDiagramType === 'linear') {
    const canvas = document.getElementById('chart-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createCanvasLinearGraph()
  }

  if (selectedDiagramType === 'pie') {
    console.log('pie diagram')
  }
})
chartButtonElement.addEventListener('click', (e) => {
  e.preventDefault();
  const canvas = document.getElementById('chart-canvas');
  canvas.classList.remove('hidden');
  createCanvasBarDiagram()


})

