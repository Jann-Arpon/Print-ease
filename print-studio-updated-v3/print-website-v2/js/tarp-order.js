const tarpOrder = document.querySelector('#tarpOrder');

if (tarpOrder) {
  const tarpWidth = document.querySelector('#tarpWidth');
  const tarpHeight = document.querySelector('#tarpHeight');
  const tarpFile = document.querySelector('#tarpFile');
  const tarpFileStatus = document.querySelector('#tarpFileStatus');
  const tarpPreview = document.querySelector('#tarpPreview');
  const tarpPreviewShape = document.querySelector('#tarpPreviewShape');
  const tarpPreviewDimensions = document.querySelector('#tarpPreviewDimensions');
  const tarpSizeStatus = document.querySelector('#tarpSizeStatus');
  const tarpStepCount = document.querySelector('#tarpStepCount');
  const tarpPrevious = document.querySelector('#tarpPrevious');
  const tarpNext = document.querySelector('#tarpNext');
  const tarpError = document.querySelector('#tarpError');
  const tarpBackLink = document.querySelector('.tarp-back-link');
  const tarpSteps = [...tarpOrder.querySelectorAll('[data-tarp-step]')];
  const acceptedTypes = ['image/png', 'image/jpeg'];
  const acceptedExtensions = ['.png', '.jpg', '.jpeg'];
  let currentTarpStep = 0;

  const formatDimension = value => Number(value.toFixed(2)).toString();

  const getTarpDimensions = () => ({
    width: tarpWidth.valueAsNumber,
    height: tarpHeight.valueAsNumber
  });

  const hasValidTarpDimensions = () => {
    const { width, height } = getTarpDimensions();
    return Number.isFinite(width)
      && Number.isFinite(height)
      && width >= 0.1
      && height >= 0.1
      && width <= 6
      && height <= 6;
  };

  const updateTarpPreview = () => {
    const { width, height } = getTarpDimensions();
    const widthValid = Number.isFinite(width) && width >= 0.1 && width <= 6;
    const heightValid = Number.isFinite(height) && height >= 0.1 && height <= 6;
    const isValid = widthValid && heightValid;

    tarpWidth.setAttribute('aria-invalid', String(!widthValid));
    tarpHeight.setAttribute('aria-invalid', String(!heightValid));

    if (!isValid) {
      tarpPreviewShape.hidden = true;
      tarpPreviewDimensions.textContent = 'Enter a valid size';
      tarpSizeStatus.textContent = 'Each side must be at least 0.1 ft and no more than 6 ft.';
      tarpSizeStatus.classList.add('tarp-size-status--error');
      return;
    }

    const longestSide = Math.max(width, height);
    tarpPreviewShape.style.width = `${(width / longestSide) * 100}%`;
    tarpPreviewShape.style.height = `${(height / longestSide) * 100}%`;
    tarpPreviewShape.setAttribute(
      'aria-label',
      `Tarp preview, ${formatDimension(width)} ft wide by ${formatDimension(height)} ft high`
    );
    tarpPreviewShape.hidden = false;
    tarpPreviewDimensions.textContent = `${formatDimension(width)} ft × ${formatDimension(height)} ft`;
    tarpSizeStatus.textContent = 'Preview proportions are to scale.';
    tarpSizeStatus.classList.remove('tarp-size-status--error');
    document.querySelector('#tarpSelectedSize').textContent = tarpPreviewDimensions.textContent;
  };

  const getTarpFileError = () => {
    const file = tarpFile.files[0];
    if (!file) {
      return 'Choose a PNG or JPG/JPEG image to continue.';
    }

    const fileName = file.name.toLowerCase();
    const hasAcceptedExtension = acceptedExtensions.some(extension => fileName.endsWith(extension));
    if (!acceptedTypes.includes(file.type) && !(file.type === '' && hasAcceptedExtension)) {
      return 'That file type is not supported. Choose a PNG or JPG/JPEG image.';
    }

    return '';
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

  const fillTarpSummary = () => {
    const { width, height } = getTarpDimensions();
    const file = tarpFile.files[0];
    const extension = file.name.split('.').pop().toLowerCase();
    document.querySelector('#summaryWidth').textContent = `${formatDimension(width)} ft`;
    document.querySelector('#summaryHeight').textContent = `${formatDimension(height)} ft`;
    document.querySelector('#summaryFile').textContent = file.name;
    document.querySelector('#summaryFormat').textContent = extension.toUpperCase();
    document.querySelector('#summaryFileSize').textContent = formatFileSize(file.size);
  };

  const showTarpStep = step => {
    currentTarpStep = step;
    tarpSteps.forEach((element, index) => {
      element.hidden = index !== step;
    });
    tarpPreview.hidden = step === 2;
    tarpOrder.classList.toggle('tarp-order--review', step === 2);
    tarpStepCount.textContent = `STEP ${step + 1} OF ${tarpSteps.length}`;
    document.querySelector('#tarpProgress').style.width = `${((step + 1) / tarpSteps.length) * 100}%`;
    tarpPrevious.textContent = step === 0 ? 'All services' : 'Back';
    tarpNext.hidden = step === tarpSteps.length - 1;
    tarpError.hidden = true;
  };

  const leaveTarp = () => {
    const confirmed = window.confirm('Are you sure you want to return to the services page? Your changes will not be saved.');
    if (confirmed) {
      window.location.href = tarpBackLink.href;
    }
  };

  tarpBackLink.addEventListener('click', event => {
    event.preventDefault();
    leaveTarp();
  });

  tarpPrevious.addEventListener('click', () => {
    if (currentTarpStep === 0) {
      leaveTarp();
      return;
    }
    showTarpStep(currentTarpStep - 1);
  });

  tarpNext.addEventListener('click', () => {
    if (currentTarpStep === 0 && !hasValidTarpDimensions()) {
      tarpError.textContent = 'Enter a width and height from 0.1 ft to 6 ft.';
      tarpError.hidden = false;
      return;
    }

    if (currentTarpStep === 1) {
      const error = getTarpFileError();
      if (error) {
        tarpError.textContent = error;
        tarpError.hidden = false;
        return;
      }
      fillTarpSummary();
    }

    showTarpStep(currentTarpStep + 1);
  });

  tarpFile.addEventListener('change', () => {
    const error = getTarpFileError();
    tarpError.hidden = true;
    if (error && tarpFile.files.length) {
      tarpFile.value = '';
      tarpFileStatus.textContent = error;
      return;
    }
    tarpFileStatus.textContent = tarpFile.files.length
      ? `${tarpFile.files[0].name} selected. Your file stays on this device.`
      : 'PNG or JPG/JPEG only. Your file stays on this device.';
  });

  tarpWidth.addEventListener('input', updateTarpPreview);
  tarpHeight.addEventListener('input', updateTarpPreview);
  updateTarpPreview();
}
