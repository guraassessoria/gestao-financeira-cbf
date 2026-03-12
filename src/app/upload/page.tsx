"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type FileType = "CT1" | "CT2" | "CTT";

interface UploadStatus {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
  linhasValidas?: number;
  totalLinhas?: number;
}

export default function UploadPage() {
  const [statuses, setStatuses] = useState<Record<FileType, UploadStatus>>({
    CT1: { state: "idle" },
    CT2: { state: "idle" },
    CTT: { state: "idle" },
  });
  const inputRefs = useRef<Record<FileType, HTMLInputElement | null>>({
    CT1: null,
    CT2: null,
    CTT: null,
  });

  async function handleUpload(tipo: FileType, file: File) {
    setStatuses((prev) => ({
      ...prev,
      [tipo]: { state: "loading" },
    }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", tipo);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStatuses((prev) => ({
          ...prev,
          [tipo]: {
            state: "success",
            message: data.message,
            linhasValidas: data.linhasValidas,
            totalLinhas: data.totalLinhas,
          },
        }));
      } else {
        setStatuses((prev) => ({
          ...prev,
          [tipo]: { state: "error", message: data.error ?? "Erro desconhecido" },
        }));
      }
    } catch {
      setStatuses((prev) => ({
        ...prev,
        [tipo]: { state: "error", message: "Falha na conexão com o servidor" },
      }));
    }
  }

  const arquivos: Array<{ tipo: FileType; label: string; descricao: string }> = [
    {
      tipo: "CT1",
      label: "CT1 – Plano de Contas",
      descricao: "Arquivo de contas contábeis exportado do TOTVS Protheus",
    },
    {
      tipo: "CT2",
      label: "CT2 – Lançamentos",
      descricao: "Arquivo de lançamentos contábeis exportado do TOTVS Protheus",
    },
    {
      tipo: "CTT",
      label: "CTT – Centros de Custo",
      descricao: "Arquivo de centros de custo exportado do TOTVS Protheus",
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Carga de Dados</h2>
        <p className="text-sm text-slate-500 mt-1">
          Importe os arquivos CSV exportados do TOTVS Protheus
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800">
        <p className="font-semibold mb-2">Formato esperado dos arquivos:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Delimitador: ponto-e-vírgula <code className="bg-blue-100 rounded px-1">;</code></li>
          <li>As 2 primeiras linhas são cabeçalho do Protheus e serão ignoradas</li>
          <li>Encoding: UTF-8 ou Latin-1 (ISO-8859-1)</li>
          <li>Tipo de lançamento filtrado: <strong>Partida Dobrada</strong></li>
        </ul>
      </div>

      {/* Upload cards */}
      <div className="space-y-4">
        {arquivos.map(({ tipo, label, descricao }) => {
          const status = statuses[tipo];
          return (
            <div
              key={tipo}
              className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{label}</p>
                <p className="text-sm text-slate-500 mt-0.5">{descricao}</p>

                {status.state === "success" && (
                  <p className="text-sm text-green-700 mt-1 flex items-center gap-1">
                    <CheckCircle size={14} />
                    {status.message} · {status.linhasValidas} linhas importadas de{" "}
                    {status.totalLinhas} lidas
                  </p>
                )}
                {status.state === "error" && (
                  <p className="text-sm text-red-700 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {status.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="file"
                  accept=".csv,.txt"
                  ref={(el) => {
                    inputRefs.current[tipo] = el;
                  }}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(tipo, file);
                  }}
                />
                <button
                  onClick={() => inputRefs.current[tipo]?.click()}
                  disabled={status.state === "loading"}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {status.state === "loading" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processando…
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      {status.state === "success" ? "Reenviar" : "Selecionar arquivo"}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit notice */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">
        <strong>Trilha de Auditoria:</strong> Cada carga é registrada com data/hora,
        usuário, arquivo, total de linhas e status. Os registros podem ser consultados
        na tabela <code>snapshots_carga</code> no Supabase.
      </div>
    </div>
  );
}
