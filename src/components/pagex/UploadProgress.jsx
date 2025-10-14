// src/components/pagex/UploadProgress.jsx

"use client";

import { Card, Text, Title } from "@tremor/react";
import { RiMagicLine } from "@remixicon/react";

export default function UploadProgress({ step }) {
  return (
    <Card className="flex items-center space-x-4 bg-tremor-background-muted dark:bg-dark-tremor-background-muted animate-pulse">
      <RiMagicLine className="w-6 h-6 text-purple-500" />
      <div>
        <Title className="text-sm font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Procesando archivos ...
        </Title>
        <Text className="text-tremor-content dark:text-dark-tremor-content">
          {step || "Analizando PDF, extrayendo entidades y transformando datos..."}
        </Text>
      </div>
    </Card>
  );
}
