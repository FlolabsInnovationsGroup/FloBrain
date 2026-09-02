"use client";

import { FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/layout/dialog";
import { Button } from "@/components/layout/button";
import {
  INPUT_TYPES,
  type InputType,
  type ModelRegistryPayload,
  type ProviderType,
  type RegisteredModel,
} from "../modelRegistryApi";

type ModelFormDialogProps = {
  open: boolean;
  model: RegisteredModel | null;
  isSaving: boolean;
  serverError?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ModelRegistryPayload) => void;
};

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-white/15 bg-[#130b25] px-3 py-2.5 text-sm text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20";

function uniqueLabels(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function ModelFormDialog({
  open,
  model,
  isSaving,
  serverError,
  onOpenChange,
  onSubmit,
}: ModelFormDialogProps) {
  const [name, setName] = useState(model?.name ?? "");
  const [providerName, setProviderName] = useState(model?.provider_name ?? "");
  const [providerType, setProviderType] = useState<ProviderType>(model?.provider_type ?? "private");
  const [inputTypes, setInputTypes] = useState<InputType[]>(model?.supported_input_types ?? []);
  const [capabilities, setCapabilities] = useState(model?.capabilities.join(", ") ?? "");
  const [validationError, setValidationError] = useState("");

  function toggleInputType(inputType: InputType) {
    setInputTypes((current) =>
      current.includes(inputType)
        ? current.filter((item) => item !== inputType)
        : [...current, inputType]
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const capabilityList = uniqueLabels(capabilities);
    if (!name.trim() || !providerName.trim()) {
      setValidationError("Model name and provider name are required.");
      return;
    }
    if (inputTypes.length === 0) {
      setValidationError("Select at least one supported input type.");
      return;
    }
    if (capabilityList.length === 0) {
      setValidationError("Add at least one capability.");
      return;
    }
    setValidationError("");
    onSubmit({
      name: name.trim(),
      provider_name: providerName.trim(),
      provider_type: providerType,
      supported_input_types: inputTypes,
      capabilities: capabilityList,
    });
  }

  const error = validationError || serverError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0d0718] text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{model ? "Edit registered model" : "Register a model"}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Record the provider, accepted inputs, and capabilities available to FloBrain.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-zinc-200">
              Model name
              <input
                className={fieldClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. GPT-4o"
                maxLength={200}
              />
            </label>
            <label className="text-sm font-medium text-zinc-200">
              Provider name
              <input
                className={fieldClass}
                value={providerName}
                onChange={(event) => setProviderName(event.target.value)}
                placeholder="e.g. OpenAI"
                maxLength={200}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-zinc-200">
            Provider type
            <select
              className={fieldClass}
              value={providerType}
              onChange={(event) => setProviderType(event.target.value as ProviderType)}
            >
              <option value="private">Private</option>
              <option value="open-source">Open source</option>
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-zinc-200">Supported input types</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {INPUT_TYPES.map((inputType) => (
                <label
                  key={inputType}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm capitalize text-zinc-300"
                >
                  <input
                    type="checkbox"
                    checked={inputTypes.includes(inputType)}
                    onChange={() => toggleInputType(inputType)}
                    className="accent-purple-500"
                  />
                  {inputType}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="model-capabilities" className="block text-sm font-medium text-zinc-200">
              Capabilities
            </label>
            <input
              id="model-capabilities"
              className={fieldClass}
              value={capabilities}
              onChange={(event) => setCapabilities(event.target.value)}
              placeholder="chat, coding, embeddings"
              aria-describedby="capabilities-help"
            />
            <span id="capabilities-help" className="mt-1.5 block text-xs text-zinc-500">
              Separate capabilities with commas.
            </span>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/15 bg-transparent text-zinc-200 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-purple-600 text-white hover:bg-purple-500"
            >
              {isSaving ? "Saving…" : model ? "Save changes" : "Register model"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
