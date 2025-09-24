export const triggerBrowserDownloadFileFromUrl = async ({
  url,
  filename,
}: {
  url: string;
  filename: string;
}) => {
  const response = await fetch(url);
  const blob = await response.blob();
  triggerBrowserDownloadFileFromBlob({ blob, filename });
};

export const triggerBrowserDownloadFileFromBlob = ({
  blob,
  filename,
}: {
  blob: Blob | MediaSource;
  filename: string;
}) => {
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
