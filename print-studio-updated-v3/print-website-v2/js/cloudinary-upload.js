const cloudinaryOrderForm = document.querySelector(
  '#paperOrderForm, #tarpOrderForm, #stickerOrderForm, #tshirtOrderForm, #mugOrderForm'
);
const cloudinaryCloudName = 'vmugif4v';
const cloudinaryUploadPreset = 'Root';

if (cloudinaryOrderForm) {
  const fileInput = cloudinaryOrderForm.querySelector('input[type="file"]');
  const orderSteps = [
    ...cloudinaryOrderForm.querySelectorAll(
      '[data-paper-step], [data-tarp-step], [data-sticker-step], [data-tshirt-step], [data-mug-step]'
    )
  ];
  const reviewStep = orderSteps[orderSteps.length - 1];

  if (fileInput && reviewStep) {
    const uploadPanel = document.createElement('section');
    uploadPanel.className = 'cloudinary-upload';
    uploadPanel.setAttribute('aria-label', 'Upload your design');

    const uploadNotice = document.createElement('p');
    uploadNotice.textContent = 'Prototype upload: your file is sent to Cloudinary using a public unsigned preset and may be accessible by URL. Do not upload sensitive files. Uploads remain in Cloudinary even if you do not submit an order.';

    const uploadButton = document.createElement('button');
    uploadButton.className = 'cloudinary-upload-button';
    uploadButton.type = 'button';
    uploadButton.textContent = 'Upload design to Cloudinary';

    const uploadStatus = document.createElement('p');
    uploadStatus.className = 'cloudinary-upload-status';
    uploadStatus.setAttribute('role', 'status');
    uploadStatus.setAttribute('aria-live', 'polite');

    uploadPanel.append(uploadNotice, uploadButton, uploadStatus);
    const orderActions = reviewStep.querySelector(
      '.paper-actions, .tarp-actions, .sticker-actions, .tshirt-actions, .mug-actions'
    );
    reviewStep.insertBefore(uploadPanel, orderActions);

    let uploadedFileKey = '';

    fileInput.addEventListener('change', () => {
      uploadedFileKey = '';
      uploadStatus.textContent = '';
      delete cloudinaryOrderForm.dataset.cloudinaryAssetId;
      delete cloudinaryOrderForm.dataset.cloudinaryPublicId;
      delete cloudinaryOrderForm.dataset.cloudinaryUrl;
      if (window.printEaseUploads) {
        delete window.printEaseUploads[cloudinaryOrderForm.id];
      }
    });

    uploadButton.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) {
        uploadStatus.textContent = 'Choose a design file before uploading.';
        return;
      }

      const fileKey = `${file.name}:${file.size}:${file.lastModified}`;
      if (fileKey === uploadedFileKey) {
        uploadStatus.textContent = 'This design has already been uploaded.';
        return;
      }

      uploadButton.disabled = true;
      fileInput.disabled = true;
      uploadStatus.textContent = 'Uploading your design...';

      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', cloudinaryUploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`,
          { method: 'POST', body: uploadData }
        );
        let result;
        try {
          result = await response.json();
        } catch (error) {
          throw new Error('Cloudinary returned an unreadable response.');
        }

        if (!response.ok) {
          const errorMessage = result && result.error && result.error.message;
          throw new Error(errorMessage || `Cloudinary upload failed (${response.status}).`);
        }
        if (!result || !result.asset_id || !result.public_id || !result.secure_url) {
          throw new Error('Cloudinary response is missing the uploaded asset details.');
        }

        const uploadReference = {
          assetId: result.asset_id,
          publicId: result.public_id,
          secureUrl: result.secure_url,
          resourceType: result.resource_type,
          format: result.format
        };
        window.printEaseUploads = window.printEaseUploads || {};
        window.printEaseUploads[cloudinaryOrderForm.id] = uploadReference;
        cloudinaryOrderForm.dataset.cloudinaryAssetId = uploadReference.assetId;
        cloudinaryOrderForm.dataset.cloudinaryPublicId = uploadReference.publicId;
        cloudinaryOrderForm.dataset.cloudinaryUrl = uploadReference.secureUrl;
        uploadedFileKey = fileKey;
        uploadStatus.textContent = `Upload complete. Cloudinary asset ID: ${uploadReference.assetId}. No order has been submitted.`;
      } catch (error) {
        console.error('Could not upload the design to Cloudinary.', error);
        uploadStatus.textContent = `Upload failed: ${error.message}`;
      } finally {
        uploadButton.disabled = false;
        fileInput.disabled = false;
      }
    });
  }
}
