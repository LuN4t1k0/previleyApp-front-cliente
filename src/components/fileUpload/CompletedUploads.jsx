// src/components/fileUpload/CompletedUploads.jsx
import React from 'react';
import { RiFilePdf2Line, RiDeleteBin7Line } from '@remixicon/react';
import { List, ListItem } from '@tremor/react';

const CompletedUploads = ({ files, progress, handleRemoveFile }) => (
  <>
    <h4 className="mt-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
      Subidas Completadas
    </h4>
    <List className="mt-2 max-h-40 overflow-y-auto ">
      {files.slice().map(
        (file) =>
          progress[file.id] >= 100 && (
            <ListItem key={file.id} className="py-4">
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
                className="text-red-500 hover:text-red-600 dark:text-red-500 hover:dark:text-red-400"
                aria-label="Remove"
                onClick={() => handleRemoveFile(file.id)}
              >
                <RiDeleteBin7Line
                  className="h-5 w-5 shrink-0"
                  aria-hidden={true}
                />
              </button>
            </ListItem>
          )
      )}
    </List>
    <div className="mt-2 text-tremor-default text-tremor-content dark:text-dark-tremor-content pt-5">
      Total archivos cargados: {files.length}
    </div>
  </>
);

export default CompletedUploads;
