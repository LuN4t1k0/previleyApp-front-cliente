// import {
//   RiApps2Line,
//   RiMailLine,
//   RiQuestionAnswerLine,
//   RiCustomerService2Line,
//   RiPhoneLine,
//   RiMapPinLine,
// } from "@remixicon/react";

// export const footerSections = [
//   {
//     title: "Plataforma",
//     icon: RiApps2Line,
//     links: [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Prefacturas", href: "/prefacturas" },
//       { label: "Perfil", href: "/perfil" },
//     ],
//   },
//   {
//     title: "Soporte",
//     icon: RiCustomerService2Line,
//     links: [
//       { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
//       {
//         label: "Reportar un problema",
//         href: "/reportar-problema",
//         icon: RiQuestionAnswerLine,
//       },
//     ],
//   },
//   {
//     title: "Contáctanos",
//     icon: RiMailLine,
//     links: [
//       {
//         label: "Correo de soporte",
//         href: "mailto:soporte@previley.com",
//         icon: RiMailLine,
//       },
//       {
//         label: "+56 2 1234 5678",
//         href: "tel:+56212345678",
//         icon: RiPhoneLine,
//       },
//     ],
//   },
// ];

// export const footerContact = [
//   {
//     label: "Correo",
//     value: "soporte@previley.com",
//     icon: RiMailLine,
//     href: "mailto:soporte@previley.com",
//   },
//   {
//     label: "Teléfono",
//     value: "+56 2 1234 5678",
//     icon: RiPhoneLine,
//     href: "tel:+56212345678",
//   },
//   {
//     label: "Oficinas",
//     value: "Av. Providencia 1234, Santiago, Chile",
//     icon: RiMapPinLine,
//   },
// ];

// export const footerMeta = {
//   company: "Previley",
//   year: new Date().getFullYear(),
//   legal: [
//     { label: "Términos y condiciones", href: "/terminos" },
//     { label: "Política de privacidad", href: "/privacidad" },
//   ],
// };


// NUEVO:
import {
  RiApps2Line,
  RiMailLine,
  RiQuestionAnswerLine,
  RiCustomerService2Line,
  RiPhoneLine,
  RiMapPinLine,
  RiLayoutGridLine,
  RiFileTextLine,
  RiUserSettingsLine,
  RiShieldCheckLine,
  RiAuctionLine
} from "@remixicon/react";

// 1. Información base centralizada (Single Source of Truth)
const contact = {
  email: "contacto@previley.cl",
  phone: "+569 84480726",
  phoneRaw: "+56984480726",
  address: "Av. Providencia 1234, Santiago, Chile",
};

// 2. Secciones de navegación
export const footerSections = [
  {
    title: "Plataforma",
    icon: RiApps2Line,
    links: [
      { label: "Dashboard", href: "/dashboard", icon: RiLayoutGridLine },
      { label: "Prefacturas", href: "/prefacturas", icon: RiFileTextLine },
      { label: "Perfil", href: "/perfil", icon: RiUserSettingsLine },
    ],
  },
  {
    title: "Soporte",
    icon: RiCustomerService2Line,
    links: [
      { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
      {
        label: "Reportar un problema",
        href: "/reportar-problema",
        icon: RiQuestionAnswerLine,
      },
    ],
  },
  {
    title: "Contáctanos",
    icon: RiMailLine,
    links: [
      {
        label: contact.email,
        href: `mailto:${contact.email}`,
        icon: RiMailLine,
      },
      {
        label: contact.phone,
        href: `tel:${contact.phoneRaw}`,
        icon: RiPhoneLine,
      },
    ],
  },
];


// 4. Metadatos (Corregido para evitar el error de objeto)
export const footerMeta = {
  company: "Previley", // Volvemos a string para evitar el error "Objects are not valid"
  companyData: {
    name: "Previley",
    slogan: "Expertos en Recursos Humanos",
  },
  year: new Date().getFullYear(),
  legal: [
    { label: "Términos y condiciones", href: "/terminos", icon: RiAuctionLine },
    { label: "Política de privacidad", href: "/privacidad", icon: RiShieldCheckLine },
  ],
};