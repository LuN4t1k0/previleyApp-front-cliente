// 'use client';
// import { useRouter } from 'next/navigation';
// import { RiArrowLeftLine } from '@remixicon/react';

// export default function BackButton({ fallbackHref = '/dashboard', label = 'Volver' }) {
//   const router = useRouter();

//   const handleClick = () => {
//     if (window.history.length > 1) {
//       router.back();
//     } else {
//       router.push(fallbackHref);
//     }
//   };

//   return (
//     <button
//       onClick={handleClick}
//       className="mb-4 text-sm text-blue-600 hover:underline flex items-center"
//     >
//       <RiArrowLeftLine className="mr-1 text-base" />
//       {label}
//     </button>
//   );
// }


// NUEVO:
'use client';
import { useRouter } from 'next/navigation';
import { RiArrowLeftLine } from '@remixicon/react';

export default function BackButton({ label = "Volver al Dashboard", fallbackHref = "/dashboard" }) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <div className="flex items-center mb-4">
      <button
        onClick={handleClick}
        className="flex items-center text-sm text-blue-600 hover:underline focus:outline-none"
      >
        <RiArrowLeftLine className="mr-1 text-lg" />
        {label}
      </button>
    </div>
  );
}
