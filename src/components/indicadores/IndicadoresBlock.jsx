// src/components/indicadores/IndicadoresBlock.jsx
import {
  Card,
  Title,
  Text,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Grid,
} from "@tremor/react";

export default function IndicadoresBlock({ data }) {
  const {
    valor_uf,
    valor_utm_uta,
    rentas_minimas_imponibles,
    rentas_topes_imponibles,
    afp,
    seguro_de_cesantia,
    cotizacion_trabajos_pesados,
    impuestosegundacatsii,
    mutual_sanna,
    ahorro_previsional_voluntario,
    deposito_convenido,
    asignacion_familiar,
  } = data;

  return (
    <Grid numItems={1} md={2} lg={3} className="gap-6">
      <Card>
        <Title>Valor UF</Title>
        <Table>
          <TableBody>
            {valor_uf.Fecha.map((fecha, i) => (
              <TableRow key={i}>
                <TableCell>{fecha}</TableCell>
                <TableCell>{valor_uf.UF[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <Title>Valor UTM / UTA</Title>
        <Text>UTM: {valor_utm_uta.utm[0]}</Text>
        <Text>UTA: {valor_utm_uta.uta[0]}</Text>
      </Card>

      <Card>
        <Title>Rentas Mínimas Imponibles</Title>
        <Table>
          <TableBody>
            {rentas_minimas_imponibles.grupo.map((g, i) => (
              <TableRow key={i}>
                <TableCell>{g}</TableCell>
                <TableCell>{rentas_minimas_imponibles.valor[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <Title>Rentas Topes Imponibles</Title>
        <Table>
          <TableBody>
            {rentas_topes_imponibles.grupo.map((g, i) => (
              <TableRow key={i}>
                <TableCell>{g}</TableCell>
                <TableCell>{rentas_topes_imponibles.valor[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="col-span-full">
        <Title>AFP</Title>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>AFP</TableHeaderCell>
              <TableHeaderCell>Dependientes</TableHeaderCell>
              <TableHeaderCell>SIS</TableHeaderCell>
              <TableHeaderCell>Independientes</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {afp.afp.map((nombre, i) => (
              <TableRow key={i}>
                <TableCell>{nombre}</TableCell>
                <TableCell>{afp.tasa_afp_dependientes[i]}</TableCell>
                <TableCell>{afp.SIS_dependientes[i]}</TableCell>
                <TableCell>{afp.tasa_afp_independientes[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <Title>Seguro de Cesantía</Title>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Contrato</TableHeaderCell>
              <TableHeaderCell>Empleador</TableHeaderCell>
              <TableHeaderCell>Trabajador</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seguro_de_cesantia.contrato.map((c, i) => (
              <TableRow key={i}>
                <TableCell>{c}</TableCell>
                <TableCell>{seguro_de_cesantia.financiemiento_empleador[i]}</TableCell>
                <TableCell>{seguro_de_cesantia.financiamiento_trabajador[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <Title>Cotización Trabajos Pesados</Title>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Puesto</TableHeaderCell>
              <TableHeaderCell>Calificación</TableHeaderCell>
              <TableHeaderCell>Empleador</TableHeaderCell>
              <TableHeaderCell>Trabajador</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cotizacion_trabajos_pesados.puesto_de_trabajo.map((p, i) => (
              <TableRow key={i}>
                <TableCell>{p}</TableCell>
                <TableCell>{cotizacion_trabajos_pesados.calificación[i]}</TableCell>
                <TableCell>{cotizacion_trabajos_pesados.financiamiento_empleador[i]}</TableCell>
                <TableCell>{cotizacion_trabajos_pesados.financiamiento_trabajador[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="col-span-full">
        <Title>Impuestos de Segunda Categoría</Title>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Desde</TableHeaderCell>
              <TableHeaderCell>Hasta</TableHeaderCell>
              <TableHeaderCell>Factor</TableHeaderCell>
              <TableHeaderCell>Rebaja</TableHeaderCell>
              <TableHeaderCell>Tasa Máxima</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {impuestosegundacatsii.desde.map((_, i) => (
              <TableRow key={i}>
                <TableCell>{impuestosegundacatsii.desde[i]}</TableCell>
                <TableCell>{impuestosegundacatsii.hasta[i]}</TableCell>
                <TableCell>{impuestosegundacatsii.factor[i]}</TableCell>
                <TableCell>{impuestosegundacatsii.cantidad_a_rebajar[i]}</TableCell>
                <TableCell>{impuestosegundacatsii.tasa_de_impuesto_efectiva_maxima[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <Title>Mutual y SANNA</Title>
        <Table>
          <TableBody>
            {mutual_sanna.tipo.map((tipo, i) => (
              <TableRow key={i}>
                <TableCell>{tipo}</TableCell>
                <TableCell>{mutual_sanna.porcentaje[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <Title>Ahorro Previsional Voluntario</Title>
        <Table>
          <TableBody>
            {ahorro_previsional_voluntario.tipo_tope.map((tipo, i) => (
              <TableRow key={i}>
                <TableCell>{tipo}</TableCell>
                <TableCell>{ahorro_previsional_voluntario.valor[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <Title>Depósito Convenido</Title>
        <Table>
          <TableBody>
            {deposito_convenido.tipo_tope.map((tipo, i) => (
              <TableRow key={i}>
                <TableCell>{tipo}</TableCell>
                <TableCell>{deposito_convenido.valor[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="col-span-full">
        <Title>Asignación Familiar</Title>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Tramo</TableHeaderCell>
              <TableHeaderCell>Monto</TableHeaderCell>
              <TableHeaderCell>Requisitos</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asignacion_familiar.tramo.map((t, i) => (
              <TableRow key={i}>
                <TableCell>{t}</TableCell>
                <TableCell>{asignacion_familiar.monto[i]}</TableCell>
                <TableCell>{asignacion_familiar.requisito_de_renta[i]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Grid>
  );
}
