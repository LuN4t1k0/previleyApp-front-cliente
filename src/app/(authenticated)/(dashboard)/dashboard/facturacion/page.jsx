import FacturacionHub from '@/components/dashboard/facturacion/FacturacionHub';
import facturacionSections from '@/config/module/facturacionSections.config';

export default function FacturacionPage() {
  return <FacturacionHub config={facturacionSections} />;
}
