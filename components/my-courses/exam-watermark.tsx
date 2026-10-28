"use client";

import { useMemo } from "react";

export interface ExamStudent {
  name: string;
  email: string;
}

/**
 * Nome e email do aluno repetidos em diagonal sobre as perguntas. Não impede
 * a captura de ecrã (nada no browser o consegue), mas identifica quem a tirou
 * se ela circular. Fica por cima do conteúdo, sem apanhar cliques.
 */
export function ExamWatermark({ student }: { student: ExamStudent }) {
  const background = useMemo(() => {
    const stamp = new Date().toLocaleDateString("pt-PT");
    const lines = [student.name, student.email, stamp].map(escapeXml);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="220">` +
      `<g transform="rotate(-28 170 110)" fill="rgb(128,128,128)" fill-opacity="0.14" ` +
      `font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">` +
      lines.map((line, i) => `<text x="170" y="${95 + i * 18}">${line}</text>`).join("") +
      `</g></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, [student.name, student.email]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 select-none"
      style={{ backgroundImage: background, backgroundRepeat: "repeat" }}
    />
  );
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
