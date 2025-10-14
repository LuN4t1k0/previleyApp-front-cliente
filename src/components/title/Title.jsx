import React from "react";


const Titulo = ({title, subtitle}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong text-base sm:text-xl">
          {title}
        </h3>
        <p className="mt-1 text-tremor-default text-sm sm:text-base leading-6 text-tremor-content dark:text-dark-tremor-content">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default Titulo;
