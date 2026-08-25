"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/layout/button";
import { ModelFormDialog } from "./components/ModelFormDialog";
import {
  createRegisteredModel,
  deleteRegisteredModel,
  getModelRegistryError,
  listRegisteredModels,
  type ModelRegistryPayload,
  type RegisteredModel,
  updateRegisteredModel,
} from "./modelRegistryApi";

const queryKey = ["model-registry"] as const;

function Tags({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span
          key={value}
          className="rounded-full border border-purple-400/20 bg-purple-400/10 px-2 py-1 text-xs capitalize text-purple-100"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

export default function ModelRegistryPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<RegisteredModel | null>(null);

  const registryQuery = useQuery({
    queryKey,
    queryFn: listRegisteredModels,
  });

  const saveMutation = useMutation({
    mutationFn: ({
      model,
      payload,
    }: {
      model: RegisteredModel | null;
      payload: ModelRegistryPayload;
    }) => (model ? updateRegisteredModel(model.id, payload) : createRegisteredModel(payload)),
    onSuccess: async () => {
      setDialogOpen(false);
      setSelectedModel(null);
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRegisteredModel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  function openCreateDialog() {
    saveMutation.reset();
    setSelectedModel(null);
    setDialogOpen(true);
  }

  function openEditDialog(model: RegisteredModel) {
    saveMutation.reset();
    setSelectedModel(model);
    setDialogOpen(true);
  }

  function confirmDelete(model: RegisteredModel) {
    if (window.confirm(`Remove ${model.name} from the model registry?`)) {
      deleteMutation.mutate(model.id);
    }
  }

  const models = registryQuery.data ?? [];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#090312_0%,#160628_55%,#090312_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
              <Bot className="size-4" /> AI model pool
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Model Registry</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Track every private and open-source model available to FloBrain, including its
              accepted inputs and capabilities.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-purple-600 text-white hover:bg-purple-500"
          >
            <Plus /> Register model
          </Button>
        </div>

        {deleteMutation.error ? (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {getModelRegistryError(deleteMutation.error)}
          </p>
        ) : null}

        {registryQuery.isLoading ? (
          <div aria-label="Loading model registry" className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-2xl border border-white/5 bg-white/5"
              />
            ))}
          </div>
        ) : registryQuery.error ? (
          <section className="rounded-2xl border border-red-400/20 bg-red-500/5 px-6 py-14 text-center">
            <h2 className="text-xl font-semibold">Model registry unavailable</h2>
            <p role="alert" className="mx-auto mt-2 max-w-lg text-sm text-red-200">
              {getModelRegistryError(registryQuery.error)}
            </p>
            <Button
              onClick={() => registryQuery.refetch()}
              variant="outline"
              className="mt-6 border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <RefreshCw /> Try again
            </Button>
          </section>
        ) : models.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-purple-400/25 bg-white/[0.03] px-6 py-16 text-center">
            <Bot className="mx-auto size-12 text-purple-300/60" />
            <h2 className="mt-5 text-xl font-semibold">No models registered</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              Add the first AI model to make the FloBrain model pool visible and manageable.
            </p>
            <Button
              onClick={openCreateDialog}
              className="mt-6 bg-purple-600 text-white hover:bg-purple-500"
            >
              <Plus /> Register the first model
            </Button>
          </section>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-purple-950/20 md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">Model</th>
                    <th className="px-5 py-4 font-medium">Provider</th>
                    <th className="px-5 py-4 font-medium">Inputs</th>
                    <th className="px-5 py-4 font-medium">Capabilities</th>
                    <th className="px-5 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.07]">
                  {models.map((model) => (
                    <tr key={model.id} className="transition hover:bg-white/[0.035]">
                      <td className="px-5 py-5 font-semibold text-white">{model.name}</td>
                      <td className="px-5 py-5">
                        <div className="font-medium text-zinc-200">{model.provider_name}</div>
                        <div className="mt-1 text-xs capitalize text-zinc-500">
                          {model.provider_type}
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <Tags values={model.supported_input_types} />
                      </td>
                      <td className="max-w-sm px-5 py-5">
                        <Tags values={model.capabilities} />
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-1">
                          <Button
                            aria-label={`Edit ${model.name}`}
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(model)}
                            className="text-zinc-300 hover:bg-white/10 hover:text-white"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            aria-label={`Delete ${model.name}`}
                            variant="ghost"
                            size="icon"
                            disabled={deleteMutation.isPending}
                            onClick={() => confirmDelete(model)}
                            className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 md:hidden">
              {models.map((model) => (
                <article
                  key={model.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">{model.name}</h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        {model.provider_name} ·{" "}
                        <span className="capitalize">{model.provider_type}</span>
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        aria-label={`Edit ${model.name}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(model)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        aria-label={`Delete ${model.name}`}
                        variant="ghost"
                        size="icon"
                        disabled={deleteMutation.isPending}
                        onClick={() => confirmDelete(model)}
                        className="text-red-300"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">Inputs</p>
                    <Tags values={model.supported_input_types} />
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                      Capabilities
                    </p>
                    <Tags values={model.capabilities} />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <ModelFormDialog
        key={`${selectedModel?.id ?? "new"}-${dialogOpen ? "open" : "closed"}`}
        open={dialogOpen}
        model={selectedModel}
        isSaving={saveMutation.isPending}
        serverError={saveMutation.error ? getModelRegistryError(saveMutation.error) : undefined}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedModel(null);
        }}
        onSubmit={(payload) => saveMutation.mutate({ model: selectedModel, payload })}
      />
    </main>
  );
}
