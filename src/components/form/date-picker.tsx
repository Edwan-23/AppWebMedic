import { useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import Label from './Label';
import { CalenderIcon } from '../../icons';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  maxDate?: DateOption;
  minDate?: DateOption;
  position?: "auto" | "above" | "below";
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  maxDate,
  minDate,
  position = "auto",
}: PropsType) {
  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: false,
      disableMobile: true,
      monthSelectorType: "dropdown",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange,
      locale: Spanish,
      maxDate,
      minDate,
      allowInput: false,
      clickOpens: true,
      position: position,
      positionElement: undefined,
      onReady: function(selectedDates, dateStr, instance) {
        // Agregar estilos personalizados al selector de mes y año
        const monthSelect = instance.monthsDropdownContainer;
        const yearInput = instance.currentYearElement;
        
        if (monthSelect) {
          monthSelect.style.cursor = 'pointer';
          monthSelect.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
          monthSelect.style.borderRadius = '6px';
          monthSelect.style.padding = '4px 8px';
          monthSelect.style.border = '1px solid rgba(59, 130, 246, 0.2)';
        }
        
        if (yearInput) {
          yearInput.style.cursor = 'pointer';
          yearInput.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
          yearInput.style.borderRadius = '6px';
          yearInput.style.padding = '4px 8px';
          yearInput.style.border = '1px solid rgba(59, 130, 246, 0.2)';
        }
      },
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, maxDate, minDate, position]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800 cursor-pointer"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
