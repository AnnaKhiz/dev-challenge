const customDiagramNameElement = document.getElementById('input-diagram-name');


export function updateCanvas(e) {
  e.preventDefault();
  return customDiagramNameElement.value
}

