import PdfjsWorker from "pdfjs-dist/build/pdf.worker.js";
import PDFJS, { getDocument } from "pdfjs-dist";
PDFJS.workerSrc = "pdfjs-dist/build/pdf.worker.js";
PDFJS.GlobalWorkerOptions.workerSrc = "pdfjs-dist/build/pdf.worker.js";
PDFJS.GlobalWorkerOptions.workerPort = new PdfjsWorker();
async function init(){

    // const pdfjs = await import('pdfjs-dist/build/pdf');
    // const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
  
    // pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;


    const pdf = 'parts of a guitar.pdf';

    const pageNum = document.querySelector('#page_num');
    const pageCount = document.querySelector('#page_count');
    const currentPage = document.querySelector('#current_page');
    const previousPage = document.querySelector('#prev_page');
    const nextPage = document.querySelector('#next_page');
    const zoomIn = document.querySelector('#zoom_in');
    const zoomOut = document.querySelector('#zoom_out');

    const initialState = {
        pdfDoc: null,
        currentPage: 1,
        pageCount: 0,
        zoom: 1,
    };



    pdfjsLib
        .getDocument(pdf)
        .promise.then((data) => {
            initialState.pdfDoc = data;
            console.log('pdfDocument', initialState.pdfDoc);

            pageCount.textContent = initialState.pdfDoc.numPages;

            renderPage();
        })
        .catch((err) => {
            alert(err.message);
        });
}

init();