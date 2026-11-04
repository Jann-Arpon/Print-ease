const paperOrder = document.querySelector('#paperOrder');

if (paperOrder) {
  const paperSteps = [...paperOrder.querySelectorAll('[data-paper-step]')];
  const paperPrevious = document.querySelector('#paperPrevious');
  const paperNext = document.querySelector('#paperNext');
  const paperError = document.querySelector('#paperError');
  const paperForm = document.querySelector('#paperOrderForm');
  const paperFile = document.querySelector('#paperFile');
  const paperFileStatus = document.querySelector('#paperFileStatus');
  const paperPriceEstimate = document.querySelector('#paperPriceEstimate');
  const paperCopies = document.querySelector('#paperCopies');
  const paperBackLink = document.querySelector('.paper-back-link');
  let currentPaperStep = 0;
  let pdfPageCount = null;
  let pdfReadRequest = 0;

  const leavePaper = () => {
    const confirmed = window.confirm('Are you sure you want to return to the services page? Your changes will not be saved.');
    if (confirmed) {
      window.location.href = paperBackLink.href;
    }
  };

  const showPaperStep = step => {
    currentPaperStep = step;
    paperSteps.forEach((element, index) => {
      element.hidden = index !== step;
    });
    document.querySelector('#paperStepCount').textContent = `STEP ${step + 1} OF ${paperSteps.length}`;
    document.querySelector('#paperProgress').style.width = `${((step + 1) / paperSteps.length) * 100}%`;
    paperPrevious.textContent = step === 0 ? 'All services' : 'Back';
    paperNext.hidden = step === paperSteps.length - 1;
    paperError.hidden = true;
  };

  const selectedValue = name => paperForm.querySelector(`[name="${name}"]:checked`)?.value || '';

  const estimateBlackAndWhitePrice = () => {
    if (selectedValue('printColor') !== 'Black and white' || !pdfPageCount) {
      return null;
    }
    return pdfPageCount * Number(paperCopies.value) * 2;
  };

  const updatePaperFileDetails = () => {
    if (!pdfPageCount) {
      paperPriceEstimate.hidden = true;
      return;
    }

    if (selectedValue('printColor') === 'Black and white') {
      const estimate = estimateBlackAndWhitePrice();
      paperPriceEstimate.textContent = `Estimated price: ₱${estimate.toFixed(2)} (${pdfPageCount} pages × ${paperCopies.value} ${Number(paperCopies.value) === 1 ? 'copy' : 'copies'} × ₱2)`;
      paperPriceEstimate.hidden = false;
      return;
    }

    if (selectedValue('printColor') === 'Color') {
      paperPriceEstimate.textContent = 'Color price has not been confirmed yet.';
      paperPriceEstimate.hidden = false;
      return;
    }

    paperPriceEstimate.hidden = true;
  };

  const validatePaperStep = () => {
    if (currentPaperStep === 0 && !selectedValue('paperSize')) {
      return 'Choose a paper size to continue.';
    }
    if (currentPaperStep === 1 && (!selectedValue('printColor') || !selectedValue('printSides'))) {
      return 'Choose both print color and print sides.';
    }
    if (currentPaperStep === 2) {
      const copies = Number(document.querySelector('#paperCopies').value);
      if (!Number.isInteger(copies) || copies < 1) {
        return 'Enter a whole number of copies, at least 1.';
      }
      if (!paperFile.files.length) {
        return 'Choose a PDF file to continue.';
      }
      if (pdfPageCount === null) {
        return 'Wait for the PDF page count to finish, or choose another PDF.';
      }
      const file = paperFile.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        return 'Choose a PDF file.';
      }
    }
    return '';
  };

  const fillPaperSummary = () => {
    document.querySelector('#summarySize').textContent = selectedValue('paperSize');
    document.querySelector('#summaryColor').textContent = selectedValue('printColor');
    document.querySelector('#summarySides').textContent = selectedValue('printSides');
    document.querySelector('#summaryCopies').textContent = paperCopies.value;
    document.querySelector('#summaryFile').textContent = paperFile.files[0].name;
    document.querySelector('#summaryPages').textContent = pdfPageCount;
    const estimate = estimateBlackAndWhitePrice();
    document.querySelector('#summaryPrice').textContent = estimate === null ? 'Not confirmed for color' : `₱${estimate.toFixed(2)}`;
  };

  paperBackLink.addEventListener('click', event => {
    event.preventDefault();
    leavePaper();
  });

  paperPrevious.addEventListener('click', () => {
    if (currentPaperStep === 0) {
      leavePaper();
      return;
    }
    showPaperStep(currentPaperStep - 1);
  });

  paperNext.addEventListener('click', () => {
    const error = validatePaperStep();
    if (error) {
      paperError.textContent = error;
      paperError.hidden = false;
      return;
    }
    if (currentPaperStep === 2) {
      fillPaperSummary();
    }
    showPaperStep(currentPaperStep + 1);
  });

  paperFile.addEventListener('change', async () => {
    const requestId = ++pdfReadRequest;
    const file = paperFile.files[0];
    paperError.hidden = true;
    pdfPageCount = null;
    paperPriceEstimate.hidden = true;

    if (!file) {
      paperFileStatus.textContent = 'PDF files only. Page count is read in your browser.';
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      paperFileStatus.textContent = 'That file does not look like a PDF.';
      return;
    }

    if (!window.pdfjsLib) {
      paperFileStatus.textContent = 'PDF page counting is unavailable. Check your internet connection and reload this page.';
      return;
    }

    paperFileStatus.textContent = 'Reading PDF pages...';

    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await window.pdfjsLib.getDocument({ data }).promise;
      const pageCount = pdf.numPages;
      await pdf.destroy();
      if (requestId !== pdfReadRequest) {
        return;
      }
      pdfPageCount = pageCount;
      paperFileStatus.textContent = `${pdfPageCount} ${pdfPageCount === 1 ? 'page' : 'pages'} detected.`;
      updatePaperFileDetails();
    } catch (error) {
      if (requestId !== pdfReadRequest) {
        return;
      }
      paperFileStatus.textContent = 'Could not read this PDF. Try another PDF file.';
    }
  });

  paperForm.querySelectorAll('[name="printColor"]').forEach(input => {
    input.addEventListener('change', updatePaperFileDetails);
  });
  paperCopies.addEventListener('input', updatePaperFileDetails);
}