export function exportToPNG(e) {
  e.preventDefault();
  const { imageURL } = getCanvasImage();

  clickHidden(imageURL, 'png')
}

export function exportToSVG(e) {
  e.preventDefault();
  const { canvas, imageURL } = getCanvasImage();

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
      <image href="${imageURL}" width="${canvas.width}" height="${canvas.height}" />
    </svg>
  `;

  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const svgURL = URL.createObjectURL(svgBlob);

  clickHidden(svgURL, 'svg')
}


export function printAndExportToPDF(e) {
  e.preventDefault();
  const { imageURL } = getCanvasImage();

  const pdfWindow = window.open('');

  pdfWindow.document.write(`
    <html lang="en">
      <head>
        <title>Canvas diagram PDF</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <img src="${imageURL}" style="width: 100%; height: auto;" alt="content">
      </body>
    </html>`);

  pdfWindow.document.close();
  pdfWindow.focus();
  pdfWindow.print();
}

function getCanvasImage() {
  const canvas = document.getElementById('chart-canvas');
  const imageURL = canvas.toDataURL('image/png');

  return { canvas, imageURL }
}

function clickHidden(url, ext) {
  const link = document.createElement('a');
  link.href = url;
  link.download = `canvas_image.${ext}`;
  link.click();
}
