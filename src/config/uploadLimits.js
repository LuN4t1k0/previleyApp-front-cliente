const DEFAULT_UPLOAD_MAX_FILE_SIZE_MB = 10;

const parseUploadLimitMb = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_UPLOAD_MAX_FILE_SIZE_MB;
};

export const UPLOAD_MAX_FILE_SIZE_MB = parseUploadLimitMb(
  process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB
);

export const UPLOAD_MAX_FILE_SIZE_BYTES =
  UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

export const formatUploadMaxFileSize = () =>
  `${UPLOAD_MAX_FILE_SIZE_MB} MB`;

