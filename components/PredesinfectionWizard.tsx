"use client";

import { useState } from "react";

type Step = 1 | 2 | 3;

type Priority = "standard" | "urgent";

type InstrumentLine = {
  id: string;
  name: string;
  quantity: number;
};

interface PredesinfectionWizardProps {
  cycleId: string;
}

export function PredesinfectionWizard({ cycleId }: PredesinfectionWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [priority, setPriority] = useState<Priority>("standard");
  const [boxName, setBoxName] = useState("");
  const [operatorBadge, setOperatorBadge] = useState("");
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);

  // Keep workflow data in parent state for continuity across steps.
  const [provenance] = useState("SALLE OP n° 04");
  const [soakingSummary] = useState({
    detergent: "Anioxyde 1000",
    duration: "10 min",
    dilution: "0,5%",
    dosage: "50 mL/L",
    waterVolume: "12 L",
  });
  const [instruments] = useState<InstrumentLine[]>([
    { id: "ins-1", quantity: 4, name: "Ciseaux" },
    { id: "ins-2", quantity: 2, name: "Pinces" },
    { id: "ins-3", quantity: 1, name: "Porte-aiguille" },
    { id: "ins-4", quantity: 1, name: "Cupule" },
  ]);

  const canGoBack = currentStep > 1;
  const isLastStep = currentStep === 3;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const renderInstruction = () => {
    if (currentStep === 1) {
      return "Scanner le code-barres du bac de trempage";
    }
    if (currentStep === 2) {
      return "Scanner le code-barres des contenants (conteneurs ou papiers non tissés) incluant les instruments non utilisés mais ouverts";
    }
    return "Scanner le badge de l'agent responsable (Pré-désinfection)";
  };

  const renderStepTitle = () => {
    if (currentStep === 1) return "Étape 1 : Trempage";
    if (currentStep === 2) return "Étape 2 : Contenants";
    return "Étape 3 : Opérateur";
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Provenance
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
              {provenance}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">Soaking Summary</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Detergent
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {soakingSummary.detergent}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Duration
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {soakingSummary.duration}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Dilution
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {soakingSummary.dilution}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Dosage
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {soakingSummary.dosage}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Water Volume
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {soakingSummary.waterVolume}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-sm font-semibold text-slate-800">
                Instruments in tray
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-white">
                  <tr className="text-left">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Instrument Name
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {instruments.map((line) => (
                    <tr key={line.id} className="odd:bg-white even:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {line.quantity}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{line.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-[1.3fr,1fr]">
            <div className="space-y-2">
              <label htmlFor="boxName" className="block text-sm font-medium text-slate-700">
                Box Name
              </label>
              <input
                id="boxName"
                type="text"
                value={boxName}
                onChange={(e) => setBoxName(e.target.value)}
                placeholder="Ex. Conteneur / papier non tissé"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">Priorité</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPriority("standard")}
                  className={[
                    "h-12 rounded-2xl border text-sm font-semibold shadow-sm transition",
                    priority === "standard"
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                  ].join(" ")}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("urgent")}
                  className={[
                    "h-12 rounded-2xl border text-sm font-semibold shadow-sm transition",
                    priority === "urgent"
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-red-200 bg-red-50 text-red-800 hover:bg-red-100",
                  ].join(" ")}
                >
                  Urgent
                </button>
              </div>
              <div className="text-xs text-slate-500">
                Sélection actuelle :{" "}
                <span className="font-medium text-slate-700">
                  {priority === "standard" ? "Standard" : "Urgent"}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-sm font-semibold text-slate-800">
                Instruments assigned to this container
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-white">
                  <tr className="text-left">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Instrument Name
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {instruments.map((line) => (
                    <tr key={line.id} className="odd:bg-white even:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {line.quantity}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{line.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    const operator = operatorConfirmed
      ? { fullName: "Amina BENALI", role: "Agent de stérilisation" }
      : null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="operatorBadge" className="block text-sm font-medium text-slate-700">
            Badge de l'agent responsable
          </label>
          <input
            id="operatorBadge"
            type="text"
            value={operatorBadge}
            onChange={(e) => {
              setOperatorBadge(e.target.value);
              setOperatorConfirmed(false);
            }}
            placeholder="Scannez ou saisissez le badge"
            className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <div className="font-semibold text-slate-800">Statut de scan</div>
            <div className="mt-1 text-slate-600">
              {operatorConfirmed ? "Badge scanné et confirmé." : "En attente de scan de badge."}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOperatorConfirmed(true)}
            disabled={!operatorBadge}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
          >
            Confirmer
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">Operator confirmation</div>
          {operator ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Full Name
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {operator.fullName}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Role / Function
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">{operator.role}</div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-slate-600">
              Scannez puis confirmez le badge pour afficher l’identité et la fonction.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Prédésinfection
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Flux de travail de stérilisation
            </h2>
            <div className="text-xs text-slate-500">
              Cycle&nbsp;
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                {cycleId}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Suivez les étapes ci-dessous pour garantir une prédésinfection conforme et
            traçable avant le lavage et la stérilisation.
          </p>
        </header>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
              {currentStep}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                Étape {currentStep} / 3
              </div>
              <div className="text-sm font-medium text-slate-900">
                {renderStepTitle()}
              </div>
            </div>
          </div>

          <div className="flex gap-1 text-[11px] font-medium text-slate-500">
            <span
              className={`h-1.5 w-8 rounded-full ${
                currentStep >= 1 ? "bg-rose-500" : "bg-slate-200"
              }`}
            />
            <span
              className={`h-1.5 w-8 rounded-full ${
                currentStep >= 2 ? "bg-rose-500" : "bg-slate-200"
              }`}
            />
            <span
              className={`h-1.5 w-8 rounded-full ${
                currentStep >= 3 ? "bg-rose-500" : "bg-slate-200"
              }`}
            />
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-xl border-2 border-pink-400 bg-pink-50 px-4 py-3 text-sm font-semibold text-pink-700">
            {renderInstruction()}
          </div>

          {renderStepContent()}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={!canGoBack}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:shadow-none"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isLastStep}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
          >
            {isLastStep ? "Terminé" : "Suivant"}
          </button>
        </div>
      </div>
    </div>
  );
}


