type ChoiceOption<T extends string> = { value: T; label: string };

type ChoiceGroupProps<T extends string> = {
  name: string;
  legend: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
};

/** Segmented single choice built on native radios, so keyboard and screen readers work. */
export function ChoiceGroup<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className="fb-v2-task-fieldset">
      <legend className="fb-v2-task-label">{legend}</legend>
      <div className="fb-v2-task-choices">
        {options.map((option) => (
          <label key={option.value} className="fb-v2-task-choice" data-tone={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
