// src/components/fileUpload/UploadProgress.jsx
import React from 'react';
import { RiFilePdf2Line, RiCloseCircleLine } from '@remixicon/react';
import { List, ListItem, ProgressBar } from '@tremor/react';

const UploadProgress = ({ files, progress, handleRemoveFile }) => (
  <>
    <h4 className="mt-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
      En Progreso
    </h4>
    <List className="mt-2 max-h-40 overflow-y-auto">
      {files.map(
        (file) =>
          progress[file.id] < 100 && (
            <ListItem key={file.id} className="block py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <RiFilePdf2Line
                    className="h-7 w-7 shrink-0 text-tremor-content dark:text-dark-tremor-content"
                    aria-hidden={true}
                  />
                  <div>
                    <p className="text-tremor-label font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                      {file.file.name}
                    </p>
                    <p className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                      {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-tremor-content-subtle hover:text-tremor-content dark:text-dark-tremor-content-subtle hover:dark:text-dark-tremor-content"
                  aria-label="Cancel"
                  onClick={() => handleRemoveFile(file.id)}
                >
                  <RiCloseCircleLine
                    className="h-5 w-5 shrink-0"
                    aria-hidden={true}
                  />
                </button>
              </div>
              <div className="mt-2 flex items-center space-x-3">
                <ProgressBar
                  value={progress[file.id] || 0}
                  className="[&>*]:h-1.5"
                />
                <span className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                  {progress[file.id] || 0}%
                </span>
              </div>
            </ListItem>
          )
      )}
    </List>
  </>
);

export default UploadProgress;
