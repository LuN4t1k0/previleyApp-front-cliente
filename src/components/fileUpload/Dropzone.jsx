import React from 'react';
import { RiFileLine } from '@remixicon/react';

const Dropzone = ({ onDrop, onDragOver, onDragEnter, onDragLeave, onFileChange, dragging, acceptedFileTypes, fileLimit }) => (
  <div
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}
    onDragOver={onDragOver}
    onDrop={onDrop}
    className={`mt-4 flex justify-center rounded-tremor-default border border-dashed border-gray-300 px-6 py-16 dark:border-dark-tremor-border ${dragging ? 'bg-green-100 border-green-500' : 'bg-white'}`}
  >
    <div>
      <RiFileLine
        className="mx-auto h-12 w-12 text-tremor-content-subtle dark:text-dark-tremor-content"
        aria-hidden={true}
      />
      <div className="mt-4 flex text-tremor-default leading-6 text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
        <p>Arrastra y suelta o</p>
        <label
          htmlFor="file-upload"
          className="relative cursor-pointer rounded-tremor-small pl-1 font-medium text-tremor-brand hover:underline hover:underline-offset-4 dark:text-dark-tremor-brand"
        >
          <span>elige un archivo</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            multiple
            onChange={onFileChange}
          />
        </label>
        <p className="pl-1">para subir</p>
      </div>
      <p className="text-center text-tremor-label leading-5 text-tremor-content dark:text-dark-tremor-content">
        Archivos permitidos: {acceptedFileTypes.join(', ')} hasta {fileLimit}MB
      </p>
    </div>
  </div>
);

export default Dropzone;