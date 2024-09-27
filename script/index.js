const formatTypesList = document.querySelector('.form-list');
const inputUploadElement = document.getElementById('upload-file');
const infoContainerElement = document.getElementById('info-container');
const formElement = document.getElementById('files-form');
const submitButtonElement = document.getElementById('submit-button');
const allowedExcelTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const allowedTypes = ['text/csv', 'application/json', ...allowedExcelTypes];
const lIHiddenTextarea = formatTypesList.querySelector('li[data="textarea-hidden"]');
const lIHiddenUpload = formatTypesList.querySelector('li[data="upload-hidden"]')
const tableContainerElement = document.getElementById("table-container");

let isCorrectType = false;
let selectedFile = {}
let infoMessage = ''

let checkedLiElement = ''

document.addEventListener('DOMContentLoaded', () => {
	checkedLiElement = formatTypesList.querySelector('[checked]')
	// console.log(checkedLiElement)
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
			infoContainerElement.innerText = ''
			lIHiddenTextarea.classList.remove('hidden')
			lIHiddenUpload.classList.add('hidden')
		} else {
			infoContainerElement.innerText = ''
			lIHiddenUpload.classList.remove('hidden')
			lIHiddenTextarea.classList.add('hidden')
		} 

	}
})



inputUploadElement.addEventListener('change', (event) => {

	const file = inputUploadElement.files[0];

	if (checkFileType(file)) {
		selectedFile = file;
		submitButtonElement.disabled = false;
	} else {
		infoContainerElement.innerText = 'Incorrect file type! Allowed types - .csv, .json, .xls, .xlsx!'
		inputUploadElement.value = null;
		submitButtonElement.disabled = true;
	}

})


function checkFileType(file) {

	if (allowedTypes.includes(file.type)) {
		isCorrectType = true;
		
		return true
	} else {
		isCorrectType = false;
		
	}
}

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
	const content = e.target.result.trim();
	
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
					${headers.map(header => `<th>${header}</th>`).join('')}
			</tr>
	`;
	
	const rowsHTML = parsedJSON.map(row => `
			<tr>
					${headers.map(key => `<td>${row[key]}</td>`).join('')}
			</tr>
	`).join('');

	table.innerHTML = headerHTML + rowsHTML;
	tableContainerElement.appendChild(table);

	resetUploadFormData()

}

function resetUploadFormData() {
	lIHiddenTextarea.classList.add('hidden');
	infoContainerElement.innerText = '';
	inputUploadElement.value = null;
	submitButtonElement.disabled = false;
}



function uploadAndRenderCSVFile(e) {
	const content = e.target.result.trim();

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
					${headers.map(header => `<th>${header}</th>`).join('')}
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

	resetUploadFormData();
	
}
	

formElement.addEventListener('submit', (event) => {
	event.preventDefault();
	tableContainerElement.innerHTML = '';

	const reader = new FileReader();

	if (allowedExcelTypes.includes(selectedFile.type)) {
		reader.onload = uploadAndRenderExcelFiles;
		reader.readAsArrayBuffer(selectedFile);

	} else {
		if (selectedFile.type === 'application/json') {
			reader.onload = uploadAndRenderJSONFile;
			reader.readAsText(selectedFile, 'utf-8');
		} else {
			reader.onload = uploadAndRenderCSVFile;
		reader.readAsText(selectedFile, 'utf-8');
		}
		
	}

	reader.onerror = function(e) {
		console.log('Error in reading files', e)
	}


})

