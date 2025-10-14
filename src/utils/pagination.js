// import React from 'react';
// import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

// // Componente para el botón de paginación (Anterior/Siguiente)
// const PaginationButton = ({ onClick, disabled, children, hidden }) => (
//   <button
//     onClick={onClick}
//     disabled={disabled}
//     className={`group p-2 text-tremor-default ring-1 ring-inset ring-tremor-ring hover:bg-tremor-background-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-tremor-background dark:ring-dark-tremor-ring hover:dark:bg-dark-tremor-background disabled:hover:dark:bg-dark-tremor-background ${hidden ? 'sm:hidden' : 'sm:inline-flex'}`}
//   >
//     {children}
//   </button>
// );

// // Componente para el botón de número de página
// const PaginationPageButton = ({ index, isActive, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`min-w-[36px] rounded-tremor-small p-2 text-tremor-default text-tremor-content-strong disabled:opacity-50 dark:text-dark-tremor-content-strong ${
//       isActive
//         ? 'bg-tremor-brand font-semibold text-white dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted'
//         : 'hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background'
//     }`}
//   >
//     {index + 1}
//   </button>
// );

// // Componente principal de paginación
// const Pagination = ({ paginationCount, actualPage, setPage }) => {
//   const canPreviousPage = actualPage > 1;
//   const canNextPage = actualPage < paginationCount;

//   // Función para cambiar a una página específica
//   const handlePageChange = (page) => {
//     console.log(`Cambiando a la página ${page}`);
//     setPage(page - 1); // Convertir a 0-based index
//   };

//   return (
//     <div className="mt-10 flex items-center justify-between sm:justify-center">
//       {/* Botones de paginación para dispositivos grandes */}
//       <div className="hidden gap-0.5 sm:inline-flex">
//         {/* Botón Anterior */}
//         <PaginationButton
//           onClick={() => handlePageChange(actualPage - 1)}
//           disabled={!canPreviousPage}
//         >
//           <span className="sr-only">Previous</span>
//           <RiArrowLeftSLine
//             className="h-5 w-5 text-tremor-content-emphasis group-hover:text-tremor-content-strong dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong"
//             aria-hidden={true}
//           />
//         </PaginationButton>

//         {/* Botones de número de página */}
//         {Array.from({ length: paginationCount }).map((_, index) => (
//           <PaginationPageButton
//             key={index}
//             index={index}
//             isActive={index + 1 === actualPage}
//             onClick={() => handlePageChange(index + 1)}
//           />
//         ))}

//         {/* Botón Siguiente */}
//         <PaginationButton
//           onClick={() => handlePageChange(actualPage + 1)}
//           disabled={!canNextPage}
//         >
//           <span className="sr-only">Next</span>
//           <RiArrowRightSLine
//             className="h-5 w-5 text-tremor-content-emphasis group-hover:text-tremor-content-strong dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong"
//             aria-hidden={true}
//           />
//         </PaginationButton>
//       </div>

//       {/* Indicador de página actual para dispositivos pequeños */}
//       <p className="text-tremor-default tabular-nums text-tremor-content dark:text-dark-tremor-content sm:hidden">
//         Page{' '}
//         <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
//           {actualPage}
//         </span>{' '}
//         of{' '}
//         <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
//           {paginationCount}
//         </span>
//       </p>

//       {/* Botones de paginación para dispositivos pequeños */}
//       <div className="inline-flex items-center rounded-tremor-small shadow-tremor-input dark:shadow-dark-tremor-input sm:hidden">
//         <PaginationButton
//           onClick={() => handlePageChange(actualPage - 1)}
//           disabled={!canPreviousPage}
//           hidden
//         >
//           <span className="sr-only">Previous</span>
//           <RiArrowLeftSLine
//             className="h-5 w-5 text-tremor-content-emphasis group-hover:text-tremor-content-strong dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong"
//             aria-hidden={true}
//           />
//         </PaginationButton>
//         <PaginationButton
//           onClick={() => handlePageChange(actualPage + 1)}
//           disabled={!canNextPage}
//           hidden
//         >
//           <span className="sr-only">Next</span>
//           <RiArrowRightSLine
//             className="h-5 w-5 text-tremor-content-emphasis group-hover:text-tremor-content-strong dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong"
//             aria-hidden={true}
//           />
//         </PaginationButton>
//       </div>
//     </div>
//   );
// };

// export default Pagination;



// NUEVO:
import React from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

const PaginationButton = ({ onClick, disabled, children, hidden }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group p-2 text-tremor-default ring-1 ring-inset ring-tremor-ring hover:bg-tremor-background-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-tremor-background dark:ring-dark-tremor-ring hover:dark:bg-dark-tremor-background disabled:hover:dark:bg-dark-tremor-background ${hidden ? 'sm:hidden' : 'sm:inline-flex'}`}
  >
    {children}
  </button>
);

const PaginationPageButton = ({ index, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`min-w-[36px] rounded-tremor-small p-2 text-tremor-default text-tremor-content-strong disabled:opacity-50 dark:text-dark-tremor-content-strong ${
      isActive
        ? 'bg-tremor-brand font-semibold text-white dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted'
        : 'hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background'
    }`}
  >
    {index + 1}
  </button>
);

const Pagination = ({ paginationCount, actualPage, setPage }) => {
  const canPreviousPage = actualPage > 1;
  const canNextPage = actualPage < paginationCount;

  const handlePageChange = (page) => {
    setPage(page - 1);
  };

  // Limitar el número de botones de paginación que se muestran
  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalVisibleButtons = 5; // Número máximo de botones a mostrar
    let startPage = Math.max(1, actualPage - Math.floor(totalVisibleButtons / 2));
    let endPage = Math.min(paginationCount, startPage + totalVisibleButtons - 1);

    if (endPage - startPage < totalVisibleButtons - 1) {
      startPage = Math.max(1, endPage - totalVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="mt-3 flex items-center justify-between sm:justify-center">
      {/* Botones de paginación para dispositivos grandes */}
      <div className="hidden gap-0.5 sm:inline-flex">
        <PaginationButton
          onClick={() => handlePageChange(actualPage - 1)}
          disabled={!canPreviousPage}
        >
          <span className="sr-only">Previous</span>
          <RiArrowLeftSLine
            className="h-5 w-5 text-tremor-content-emphasis group-hover:text-tremor-content-strong dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong"
            aria-hidden={true}
          />
        </PaginationButton>

        {/* Si el número de la primera página no está incluido, mostrar botón de "Primera" */}
        {actualPage > 3 && (
          <>
            <PaginationPageButton
              index={0}
              isActive={1 === actualPage}
              onClick={() => handlePageChange(1)}
            />
            <span className="p-2">...</span>
          </>
        )}

        {/* Botones de número de página dinámicos */}
        {getPageNumbers().map((page) => (
          <PaginationPageButton
            key={page}
            index={page - 1}
            isActive={page === actualPage}
            onClick={() => handlePageChange(page)}
          />
        ))}

        {/* Si el número de la última página no está incluido, mostrar botón de "Última" */}
        {actualPage < paginationCount - 2 && (
          <>
            <span className="p-2">...</span>
            <PaginationPageButton
              index={paginationCount - 1}
              isActive={paginationCount === actualPage}
              onClick={() => handlePageChange(paginationCount)}
            />
          </>
        )}

        <PaginationButton
          onClick={() => handlePageChange(actualPage + 1)}
          disabled={!canNextPage}
        >
          <span className="sr-only">Next</span>
          <RiArrowRightSLine
            className="h-5 w-5 text-tremor-content-emphasis group-hover:text-tremor-content-strong dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong"
            aria-hidden={true}
          />
        </PaginationButton>
      </div>

      {/* Indicador de página actual para dispositivos pequeños */}
      <p className="text-tremor-default tabular-nums text-tremor-content dark:text-dark-tremor-content sm:hidden">
        Page{' '}
        <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {actualPage}
        </span>{' '}
        of{' '}
        <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {paginationCount}
        </span>
      </p>

      {/* Botones de paginación para dispositivos pequeños */}
      <div className="inline-flex items-center rounded-tremor-small shadow-tremor-input dark:shadow-dark-tremor-input sm:hidden">
        <PaginationButton
          onClick={() => handlePageChange(actualPage - 1)}
          disabled={!canPreviousPage}
          hidden
        >
          <span className="sr-only">Previous</span>
          <RiArrowLeftSLine
            className="h-5 w-5 text-tremor-content-emphasis group-hover:text-tremor-content-strong dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong"
            aria-hidden={true}
          />
        </PaginationButton>
        <PaginationButton
          onClick={() => handlePageChange(actualPage + 1)}
          disabled={!canNextPage}
          hidden
        >
          <span className="sr-only">Next</span>
          <RiArrowRightSLine
            className="h-5 w-5 text-tremor-content-emphasis group-hover:text-tremor-content-strong dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong"
            aria-hidden={true}
          />
        </PaginationButton>
      </div>
    </div>
  );
};

export default Pagination;
