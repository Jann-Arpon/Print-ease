const stickerOrder = document.querySelector('#stickerOrder');

if (stickerOrder) {
  const stickerSteps = [...stickerOrder.querySelectorAll('[data-sticker-step]')];
  const stickerCopies = document.querySelector('#stickerCopies');
  const stickerFile = document.querySelector('#stickerFile');
  const stickerFileStatus = document.querySelector('#stickerFileStatus');
  const stickerPrevious = document.querySelector('#stickerPrevious');
  const stickerNext = document.querySelector('#stickerNext');
  const stickerError = document.querySelector('#stickerError');
  const stickerBackLink = document.querySelector('.sticker-back-link');
  const acceptedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
  const acceptedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  let currentStickerStep = 0;

  const getStickerFileError = () => {
    const file = stickerFile.files[0];
    if (!file) {
      return 'Choose a PDF, PNG, or JPG/JPEG file to continue.';
    }

    const fileName = file.name.toLowerCase();
    const hasAcceptedExtension = acceptedExtensions.some(extension => fileName.endsWith(extension));
    if (!acceptedTypes.includes(file.type) && !(file.type === '' && hasAcceptedExtension)) {
      return 'That file type is not supported. Choose a PDF, PNG, or JPG/JPEG file.';
    }

    return '';
  };

  const validateStickerStep = () => {
    if (currentStickerStep === 0) {
      const copies = Number(stickerCopies.value);
      if (!Number.isInteger(copies) || copies < 1) {
        return 'Enter a whole number of sheets, at least 1.';
      }
    }
    if (currentStickerStep === 1) {
      return getStickerFileError();
    }
    return '';
  };

  const showStickerStep = step => {
    currentStickerStep = step;
    stickerSteps.forEach((element, index) => {
      element.hidden = index !== step;
    });
    document.querySelector('#stickerStepCount').textContent = `STEP ${step + 1} OF ${stickerSteps.length}`;
    document.querySelector('#stickerProgress').style.width = `${((step + 1) / stickerSteps.length) * 100}%`;
    stickerPrevious.textContent = step === 0 ? 'All services' : 'Back';
    stickerNext.hidden = step === stickerSteps.length - 1;
    stickerError.hidden = true;
  };

  const leaveStickers = () => {
    const confirmed = window.confirm('Are you sure you want to return to the services page? Your changes will not be saved.');
    if (confirmed) {
      window.location.href = stickerBackLink.href;
    }
  };

  const formatFileSize = bytes => {
    if (bytes < 1024) {
      return `${bytes} bytes`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fillStickerSummary = () => {
    const file = stickerFile.files[0];
    const extension = file.name.split('.').pop().toLowerCase();
    document.querySelector('#summaryCopies').textContent = stickerCopies.value;
    document.querySelector('#summaryFile').textContent = file.name;
    document.querySelector('#summaryFormat').textContent = extension.toUpperCase();
    document.querySelector('#summaryFileSize').textContent = formatFileSize(file.size);
  };

  stickerBackLink.addEventListener('click', event => {
    event.preventDefault();
    leaveStickers();
  });

  stickerPrevious.addEventListener('click', () => {
    if (currentStickerStep === 0) {
      leaveStickers();
      return;
    }
    showStickerStep(currentStickerStep - 1);
  });

  stickerNext.addEventListener('click', () => {
    const error = validateStickerStep();
    if (error) {
      stickerError.textContent = error;
      stickerError.hidden = false;
      return;
    }
    if (currentStickerStep === 1) {
      fillStickerSummary();
    }
    showStickerStep(currentStickerStep + 1);
  });

  stickerFile.addEventListener('change', () => {
    const error = getStickerFileError();
    stickerError.hidden = true;
    if (error && stickerFile.files.length) {
      stickerFile.value = '';
      stickerFileStatus.textContent = error;
      return;
    }
    stickerFileStatus.textContent = stickerFile.files.length
      ? `${stickerFile.files[0].name} selected. Your file stays on this device.`
      : 'PDF, PNG, or JPG/JPEG. For best results, prepare your artwork to fit an A4 page. Your file stays on this device.';
  });
}
