const tshirtOrder = document.querySelector('#tshirtOrder');

if (tshirtOrder) {
  const tshirtSteps = [...tshirtOrder.querySelectorAll('[data-tshirt-step]')];
  const tshirtForm = document.querySelector('#tshirtOrderForm');
  const tshirtFile = document.querySelector('#tshirtFile');
  const tshirtFileStatus = document.querySelector('#tshirtFileStatus');
  const tshirtPrevious = document.querySelector('#tshirtPrevious');
  const tshirtNext = document.querySelector('#tshirtNext');
  const tshirtError = document.querySelector('#tshirtError');
  const tshirtBackLink = document.querySelector('.tshirt-back-link');
  const acceptedTypes = ['image/png', 'image/jpeg'];
  const acceptedExtensions = ['.png', '.jpg', '.jpeg'];
  let currentTshirtStep = 0;

  const selectedValue = name => tshirtForm.querySelector(`[name="${name}"]:checked`)?.value || '';

  const getTshirtFileError = () => {
    const file = tshirtFile.files[0];
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

  const validateTshirtStep = () => {
    if (currentTshirtStep === 0 && !selectedValue('shirtSize')) {
      return 'Choose a T-shirt size to continue.';
    }
    if (currentTshirtStep === 1 && !selectedValue('shirtColor')) {
      return 'Choose a base color to continue.';
    }
    if (currentTshirtStep === 2) {
      return getTshirtFileError();
    }
    return '';
  };

  const showTshirtStep = step => {
    currentTshirtStep = step;
    tshirtSteps.forEach((element, index) => {
      element.hidden = index !== step;
    });
    document.querySelector('#tshirtStepCount').textContent = `STEP ${step + 1} OF ${tshirtSteps.length}`;
    document.querySelector('#tshirtProgress').style.width = `${((step + 1) / tshirtSteps.length) * 100}%`;
    tshirtPrevious.textContent = step === 0 ? 'All services' : 'Back';
    tshirtNext.hidden = step === tshirtSteps.length - 1;
    tshirtError.hidden = true;
  };

  const leaveTshirt = () => {
    const confirmed = window.confirm('Are you sure you want to return to the services page? Your changes will not be saved.');
    if (confirmed) {
      window.location.href = tshirtBackLink.href;
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

  const fillTshirtSummary = () => {
    const file = tshirtFile.files[0];
    const extension = file.name.split('.').pop().toLowerCase();
    document.querySelector('#summarySize').textContent = selectedValue('shirtSize');
    document.querySelector('#summaryColor').textContent = selectedValue('shirtColor');
    document.querySelector('#summaryFile').textContent = file.name;
    document.querySelector('#summaryFormat').textContent = extension.toUpperCase();
    document.querySelector('#summaryFileSize').textContent = formatFileSize(file.size);
  };

  tshirtBackLink.addEventListener('click', event => {
    event.preventDefault();
    leaveTshirt();
  });

  tshirtPrevious.addEventListener('click', () => {
    if (currentTshirtStep === 0) {
      leaveTshirt();
      return;
    }
    showTshirtStep(currentTshirtStep - 1);
  });

  tshirtNext.addEventListener('click', () => {
    const error = validateTshirtStep();
    if (error) {
      tshirtError.textContent = error;
      tshirtError.hidden = false;
      return;
    }
    if (currentTshirtStep === 2) {
      fillTshirtSummary();
    }
    showTshirtStep(currentTshirtStep + 1);
  });

  tshirtFile.addEventListener('change', () => {
    const error = getTshirtFileError();
    tshirtError.hidden = true;
    if (error && tshirtFile.files.length) {
      tshirtFile.value = '';
      tshirtFileStatus.textContent = error;
      return;
    }
    tshirtFileStatus.textContent = tshirtFile.files.length
      ? `${tshirtFile.files[0].name} selected. Your file stays on this device.`
      : 'PNG or JPG/JPEG only. Your file stays on this device.';
  });
}
