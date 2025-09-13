import imageCompression from "browser-image-compression";

export const compressImage = async (image: File): Promise<File> => {
  const options = {
    maxSizeMB: 3,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };
  const compressedFile = await imageCompression(image, options);
  const correctedFile = new File([compressedFile], image.name, {
    type: compressedFile.type,
  });
  return correctedFile;
};
