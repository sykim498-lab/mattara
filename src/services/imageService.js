function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('선택한 사진을 읽지 못했습니다.'));
    };
    image.src = url;
  });
}

function drawImage(image, maxDimension, quality) {
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export async function compressImageFile(file, maxLength = 90000) {
  const image = await loadImage(file);
  let maxDimension = 1200;
  let quality = 0.78;
  let dataUrl = '';
  for (let attempt = 0; attempt < 10; attempt += 1) {
    dataUrl = drawImage(image, maxDimension, quality);
    if (dataUrl.length <= maxLength) return dataUrl;
    if (quality > 0.42) quality -= 0.09;
    else maxDimension = Math.round(maxDimension * 0.75);
  }
  if (dataUrl.length > maxLength * 1.35) {
    throw new Error('사진 용량을 줄이지 못했습니다. 다른 사진을 선택해 주세요.');
  }
  return dataUrl;
}

export async function embedPostImages(photos, description) {
  const maxLength = Math.max(65000, Math.floor(680000 / photos.length));
  return Promise.all(photos.map(async (photo, index) => ({
    url: await compressImageFile(photo.file, maxLength),
    title: photo.title?.trim() || '',
    description: photo.description?.trim() || photo.comment?.trim() || description,
    comment: photo.description?.trim() || photo.comment?.trim() || description,
    address: photo.address?.trim() || '',
    lat: Number(photo.lat) || null,
    lng: Number(photo.lng) || null,
    placeId: photo.placeId || '',
    googleMapsUri: photo.googleMapsUri || '',
    website: photo.website || '',
    placeSource: photo.placeSource || '',
    order: index,
  })));
}
