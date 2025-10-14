import {
  RiApps2Line,
  RiMailLine,
  RiQuestionAnswerLine,
  RiCustomerService2Line,
  RiPhoneLine,
  RiMapPinLine,
} from "@remixicon/react";

export const footerSections = [
  {
    title: "Plataforma",
    icon: RiApps2Line,
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Prefacturas", href: "/prefacturas" },
      { label: "Perfil", href: "/perfil" },
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
        label: "Correo de soporte",
        href: "mailto:soporte@previley.com",
        icon: RiMailLine,
      },
      {
        label: "+56 2 1234 5678",
        href: "tel:+56212345678",
        icon: RiPhoneLine,
      },
    ],
  },
];

export const footerContact = [
  {
    label: "Correo",
    value: "soporte@previley.com",
    icon: RiMailLine,
    href: "mailto:soporte@previley.com",
  },
  {
    label: "Teléfono",
    value: "+56 2 1234 5678",
    icon: RiPhoneLine,
    href: "tel:+56212345678",
  },
  {
    label: "Oficinas",
    value: "Av. Providencia 1234, Santiago, Chile",
    icon: RiMapPinLine,
  },
];

export const footerMeta = {
  company: "Previley",
  year: new Date().getFullYear(),
  legal: [
    { label: "Términos y condiciones", href: "/terminos" },
    { label: "Política de privacidad", href: "/privacidad" },
  ],
};
