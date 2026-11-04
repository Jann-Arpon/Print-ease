document.documentElement.classList.add('js');

document.querySelectorAll('[data-year]').forEach(element => {
  element.textContent = new Date().getFullYear();
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealedElements = document.querySelectorAll('.reveal');

if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -15px 0px' });
  revealedElements.forEach(element => observer.observe(element));
} else {
  revealedElements.forEach(element => element.classList.add('is-visible'));
}

const staffLoginForm = document.querySelector('#staffLoginForm');

if (staffLoginForm) {
  staffLoginForm.addEventListener('submit', event => {
    event.preventDefault();

    const username = document.querySelector('#staffUsername').value.trim();
    const password = document.querySelector('#staffPassword').value;
    const loginError = document.querySelector('#loginError');

    if (username === 'admin' && password === '123') {
      window.location.href = 'admin.html';
      return;
    }

    loginError.hidden = false;
  });
}

const paperOrder = document.querySelector('#paperOrder');

const serviceSearch = document.querySelector('#serviceSearch');

if (serviceSearch) {
  const serviceCards = [...document.querySelectorAll('.category-card[data-search]')];
  const emptyMessage = document.querySelector('#serviceSearchEmpty');

  serviceSearch.addEventListener('input', () => {
    const query = serviceSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    serviceCards.forEach(card => {
      const matches = card.dataset.search.includes(query) || card.textContent.toLowerCase().includes(query);
      card.hidden = !matches;
      visibleCount += matches ? 1 : 0;
    });

    emptyMessage.hidden = visibleCount > 0;
  });
}

if (paperOrder) {
  const paperSteps = [...paperOrder.querySelectorAll('[data-paper-step]')];
  const paperPrevious = document.querySelector('#paperPrevious');
  const paperNext = document.querySelector('#paperNext');
  const paperError = document.querySelector('#paperError');
  const paperForm = document.querySelector('#paperOrderForm');
  const paperFile = document.querySelector('#paperFile');
  const paperFileStatus = document.querySelector('#paperFileStatus');
  const paperBackLink = document.querySelector('.paper-back-link');
  let currentPaperStep = 0;

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
    document.querySelector('#summaryCopies').textContent = document.querySelector('#paperCopies').value;
    document.querySelector('#summaryFile').textContent = paperFile.files[0].name;
  };

  paperBackLink.addEventListener('click', event => {
    if (currentPaperStep === 0) {
      event.preventDefault();
      leavePaper();
    }
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

  paperFile.addEventListener('change', () => {
    paperFileStatus.textContent = paperFile.files.length ? paperFile.files[0].name : 'PDF files only.';
    paperError.hidden = true;
  });
}
