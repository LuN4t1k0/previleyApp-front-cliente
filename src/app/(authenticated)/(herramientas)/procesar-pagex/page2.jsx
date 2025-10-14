// src/app/(authenticated)/herramientas/procesar-pagex/page.jsx

"use client";

import PagexUploader from "@/components/pagex/PagexUploader";
import { Title, Text, Card } from "@tremor/react";


export default function ProcesarPagexPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <Title>Procesar archivos Pagex</Title>
        <Text>
          Sube tus archivos PDF y deja que la magia haga su trabajo. Una vez
          procesados, obtendrás un ZIP con el resumen y archivos por entidad 🧙‍♂️
        </Text>
      </div>

      <Card className="p-6">
        <PagexUploader />
      </Card>
    </div>
  );
}
