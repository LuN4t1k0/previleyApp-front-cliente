
// import React from 'react';
// import PropTypes from 'prop-types';

// const CustomBadge = ({
//   variant = 'default',
//   children,
//   textTransform = 'uppercase', // 👈 nuevo prop con default
// }) => {
//   let styles = '';

//   switch (variant) {
//     case 'success':
//       styles = 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20';
//       break;
//     case 'error':
//       styles = 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10';
//       break;
//     case 'warning':
//       styles = 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20';
//       break;
//     case 'neutral':
//       styles = 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10';
//       break;
//     default:
//       styles = 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10';
//   }

//   return (
//     <span
//       className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${styles} ${textTransform}`}
//     >
//       {children}
//     </span>
//   );
// };

// CustomBadge.propTypes = {
//   variant: PropTypes.oneOf(['success', 'error', 'warning', 'neutral', 'default']),
//   textTransform: PropTypes.string, // 👈 lo agregamos al PropTypes
//   children: PropTypes.node.isRequired,
// };

// export default CustomBadge;

import React from 'react';
import PropTypes from 'prop-types';

const CustomBadge = ({
  variant = 'default',
  children,
  textTransform = 'uppercase',
}) => {
  let styles = '';

  switch (variant) {
    case 'success':
    case 'green':
      styles = 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20';
      break;
    case 'emerald':
      styles = 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
      break;
    case 'warning':
    case 'yellow':
      styles = 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20';
      break;
    case 'orange':
      styles = 'bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-600/20';
      break;
    case 'error':
    case 'red':
      styles = 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10';
      break;
    case 'neutral':
    case 'gray':
      styles = 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10';
      break;
    case 'blue':
      styles = 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20';
      break;
    case 'indigo':
      styles = 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20';
      break;
    case 'cyan':
      styles = 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/20';
      break;
    case 'fuchsia':
      styles = 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20';
      break;
    default:
      styles = 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10';
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${styles} ${textTransform}`}
    >
      {children}
    </span>
  );
};

CustomBadge.propTypes = {
  variant: PropTypes.oneOf([
    'success',
    'warning',
    'error',
    'neutral',
    'default',
    'green',
    'emerald',
    'yellow',
    'orange',
    'red',
    'gray',
    'blue',
    'indigo',
    'cyan',
    'fuchsia',
  ]),
  textTransform: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default CustomBadge;
