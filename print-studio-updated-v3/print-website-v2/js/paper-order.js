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
  const paperSizeChoices = document.querySelector('#paperSizeChoices');
  const paperPricingNote = document.querySelector('#paperPricingNote');
  const paperCopies = document.querySelector('#paperCopies');
  const paperBackLink = document.querySelector('.paper-back-link');
  let currentPaperStep = 0;
  let pdfPageCount = null;
  let pdfReadRequest = 0;
  const paperCatalog = {
    plain: {
      name: 'Plain paper',
      sizes: [
        { name: 'Short', dimensions: '8.5 × 11 in' },
        { name: 'A4', dimensions: '8.27 × 11.69 in' },
        { name: 'Long', dimensions: '8.5 × 13 in' }
      ]
    },
    photo: {
      name: 'Photo paper',
      rate: 40,
      sizes: [{ name: 'A4', dimensions: '8.27 × 11.69 in' }]
    },
    vellum: {
      name: 'Vellum paper',
      rate: 40,
      sizes: [
        { name: 'Short', dimensions: '8.5 × 11 in' },
        { name: 'A4', dimensions: '8.27 × 11.69 in' },
        { name: 'Long', dimensions: '8.5 × 13 in' }
      ]
    },
    c2s: {
      name: 'C2S',
      rate: 80,
      sizes: [
        { name: 'A4', dimensions: '8.27 × 11.69 in' },
        { name: 'A3', dimensions: '11.69 × 16.5 in' }
      ]
    }
  };

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
  const formatPrice = amount => `₱${amount.toFixed(2)}`;

  const getPricePerPage = () => {
    const paperType = selectedValue('paperType');
    if (paperType === 'plain') {
      return selectedValue('printColor') === 'Black and white' ? 2 : 5;
    }
    return paperCatalog[paperType]?.rate ?? null;
  };

  const getTotalPrice = () => {
    const pricePerPage = getPricePerPage();
    const copies = Number(paperCopies.value);
    if (pricePerPage === null || !pdfPageCount || !Number.isInteger(copies) || copies < 1) {
      return null;
    }
    return pdfPageCount * copies * pricePerPage;
  };

  const renderPaperSizes = paperType => {
    paperSizeChoices.replaceChildren();
    const catalogItem = paperCatalog[paperType];
    if (!catalogItem) {
      const prompt = document.createElement('p');
      prompt.className = 'paper-size-prompt';
      prompt.textContent = 'Choose a paper type to see its available sizes.';
      paperSizeChoices.append(prompt);
      return;
    }

    catalogItem.sizes.forEach(size => {
      const label = document.createElement('label');
      label.className = 'paper-choice';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'paperSize';
      input.value = `${size.name} (${size.dimensions})`;
      input.required = true;
      const text = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = size.name;
      const dimensions = document.createElement('small');
      dimensions.textContent = size.dimensions;
      text.append(name, dimensions);
      label.append(input, text);
      paperSizeChoices.append(label);
    });
  };

  const updatePaperPricingNote = () => {
    const paperType = selectedValue('paperType');
    if (!paperType || paperType === 'plain') {
      document.querySelector('#blackAndWhitePrice').textContent = '₱2 per page';
      document.querySelector('#colorPrice').textContent = '₱5 per page';
      paperPricingNote.textContent = paperType
        ? 'Plain paper: ₱2 per page in black and white or ₱5 per page in color.'
        : '';
      return;
    }

    const catalogItem = paperCatalog[paperType];
    document.querySelector('#blackAndWhitePrice').textContent = `₱${catalogItem.rate} per page`;
    document.querySelector('#colorPrice').textContent = `₱${catalogItem.rate} per page`;
    paperPricingNote.textContent = `${catalogItem.name}: ₱${catalogItem.rate} per page, regardless of print color.`;
  };

  const updatePaperFileDetails = () => {
    const total = getTotalPrice();
    if (total === null) {
      paperPriceEstimate.hidden = true;
      return;
    }

    const pricePerPage = getPricePerPage();
    paperPriceEstimate.textContent = `Estimated total: ${formatPrice(total)} (${pdfPageCount} pages × ${paperCopies.value} ${Number(paperCopies.value) === 1 ? 'copy' : 'copies'} × ${formatPrice(pricePerPage)} per page)`;
    paperPriceEstimate.hidden = false;
  };

  const validatePaperStep = () => {
    if (currentPaperStep === 0 && (!selectedValue('paperType') || !selectedValue('paperSize'))) {
      return 'Choose a paper type and an available size to continue.';
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
    document.querySelector('#summaryType').textContent = paperCatalog[selectedValue('paperType')].name;
    document.querySelector('#summarySize').textContent = selectedValue('paperSize');
    document.querySelector('#summaryColor').textContent = selectedValue('printColor');
    document.querySelector('#summarySides').textContent = selectedValue('printSides');
    document.querySelector('#summaryCopies').textContent = paperCopies.value;
    document.querySelector('#summaryFile').textContent = paperFile.files[0].name;
    document.querySelector('#summaryPages').textContent = pdfPageCount;
    document.querySelector('#summaryComments').textContent = document.querySelector('#paperComments').value.trim() || 'No additional instructions';
    document.querySelector('#summaryPrice').textContent = formatPrice(getTotalPrice());
    // Paper comments fix
  };

  paperForm.querySelectorAll('[name="paperType"]').forEach(input => {
    input.addEventListener('change', () => {
      renderPaperSizes(input.value);
      updatePaperPricingNote();
      paperPriceEstimate.hidden = true;
    });
  });

  paperForm.querySelectorAll('[name="printColor"]').forEach(input => {
    input.addEventListener('change', updatePaperFileDetails);
  });
  paperCopies.addEventListener('input', updatePaperFileDetails);

  renderPaperSizes(selectedValue('paperType'));
  updatePaperPricingNote();

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

}