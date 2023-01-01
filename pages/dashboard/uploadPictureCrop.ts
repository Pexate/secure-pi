import { centerCrop, makeAspectCrop } from "react-image-crop";
import type { PixelCrop } from "react-image-crop";

const createURLFromCrop = async (image: HTMLImageElement, crop: PixelCrop) => {
  const canvas = document.createElement("canvas");
  canvasPreview(image, canvas, crop);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve);
  });

  if (!blob) {
    console.error("Failed to create blob");
    return "";
  }
  /*
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
  */
  let previewUrl = URL.createObjectURL(blob);
  console.log(previewUrl);

  var file = new File([blob], "name");
  return file;
};

const canvasPreview = async (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop
) => {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);

  ctx.scale(1, 1);
  ctx.imageSmoothingQuality = "high";

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;
  console.log("center", centerX, centerY);

  ctx.save();

  ctx.translate(-crop.x * 2, -crop.y * 2);

  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  ctx.restore();
};

const centerAspectCrop = (
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) => {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
};

export { createURLFromCrop, centerAspectCrop };
