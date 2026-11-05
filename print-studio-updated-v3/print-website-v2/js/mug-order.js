const mugFile = document.querySelector('#mugFile');

if (mugFile) {
  const mugFileStatus = document.querySelector('#mugFileStatus');
  const mugSteps = [...document.querySelectorAll('[data-mug-step]')];
  const mugPrevious = document.querySelector('#mugPrevious');
  const mugNext = document.querySelector('#mugNext');
  const mugError = document.querySelector('#mugError');
  const mugBackLink = document.querySelector('.mug-back-link');
  let currentMugStep = 0;
  const acceptedTypes = ['image/png', 'image/jpeg'];
  const acceptedExtensions = ['.png', '.jpg', '.jpeg'];

  const getMugFileError = () => {
    const file = mugFile.files[0];
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

  const showMugStep = step => {
    currentMugStep = step;
    mugSteps.forEach((element, index) => {
      element.hidden = index !== step;
    });
    document.querySelector('#mugStepCount').textContent = `STEP ${step + 1} OF ${mugSteps.length}`;
    document.querySelector('#mugProgress').style.width = `${((step + 1) / mugSteps.length) * 100}%`;
    mugPrevious.textContent = step === 0 ? 'All services' : 'Back';
    mugNext.hidden = step === mugSteps.length - 1;
    mugError.hidden = true;
  };

  const leaveMug = () => {
    const confirmed = window.confirm('Are you sure you want to return to the services page? Your changes will not be saved.');
    if (confirmed) {
      window.location.href = mugBackLink.href;
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

  const fillMugSummary = () => {
    const file = mugFile.files[0];
    const extension = file.name.split('.').pop().toLowerCase();
    document.querySelector('#summaryFile').textContent = file.name;
    document.querySelector('#summaryFormat').textContent = extension.toUpperCase();
    document.querySelector('#summaryFileSize').textContent = formatFileSize(file.size);
  };

  mugBackLink.addEventListener('click', event => {
    event.preventDefault();
    leaveMug();
  });

  mugPrevious.addEventListener('click', () => {
    if (currentMugStep === 0) {
      leaveMug();
      return;
    }
    showMugStep(currentMugStep - 1);
  });

  mugNext.addEventListener('click', () => {
    const error = getMugFileError();
    if (error) {
      mugError.textContent = error;
      mugError.hidden = false;
      return;
    }
    fillMugSummary();
    showMugStep(currentMugStep + 1);
  });

  mugFile.addEventListener('change', () => {
    const error = getMugFileError();
    mugError.hidden = true;
    if (error && mugFile.files.length) {
      mugFile.value = '';
      mugFileStatus.textContent = error;
      return;
    }
    mugFileStatus.textContent = mugFile.files.length
      ? `${mugFile.files[0].name} selected. Your file stays on this device.`
      : 'PNG or JPG/JPEG only. Your file stays on this device.';
  });
}
