import React, { useState, useMemo, useRef, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Input } from "./Input";
import ReactDOM from "react-dom";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select categories...",
  className = "",
  label,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownDirection, setDropdownDirection] = useState<"down" | "up">(
    "down"
  );
  const filtered = useMemo(
    () =>
      query.trim() === ""
        ? options
        : options.filter((opt) =>
            opt.toLowerCase().includes(query.toLowerCase())
          ),
    [options, query]
  );

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownMaxHeight = 240;
      let direction: "down" | "up" = "down";
      if (spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow) {
        direction = "up";
      }
      setDropdownDirection(direction);
    }
  }, [open]);

  return (
    <div className={`relative w-72 ${className}`}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700 select-none">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} multiple>
        {({ open }: { open: boolean }) => (
          <div>
            <Listbox.Button
              as="button"
              ref={buttonRef}
              className="w-full min-h-[40px] bg-white border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-wrap gap-2 items-center text-gray-900"
            >
              {value.length === 0 ? (
                <span className="text-gray-400">{placeholder}</span>
              ) : (
                value.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200 mr-1 mb-1"
                  >
                    {cat}
                    <XMarkIcon
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(value.filter((v) => v !== cat));
                      }}
                    />
                  </span>
                ))
              )}
              <span className="ml-auto">
                <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Transition
              show={open}
              as="div"
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Listbox.Options
                as="div"
                ref={dropdownRef}
                className={`absolute left-0 w-full rounded-lg bg-white py-2 shadow-lg border border-gray-200 focus:outline-none overflow-auto animate-fade-in z-50 ${
                  dropdownDirection === "up"
                    ? "bottom-full mb-2"
                    : "top-full mt-2"
                }`}
                style={{ maxHeight: 240 }}
              >
                <div className="px-2 pb-2">
                  <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full border-gray-300 rounded px-2 py-1 text-sm mb-1"
                  />
                </div>
                {filtered.length === 0 && (
                  <div className="px-4 py-2 text-gray-400 text-sm">
                    No categories found
                  </div>
                )}
                {filtered.map((cat) => (
                  <Listbox.Option
                    key={cat}
                    value={cat}
                    className={({ active }) =>
                      `cursor-pointer select-none relative px-4 py-2 text-sm ${
                        active ? "bg-blue-50 text-blue-700" : "text-gray-900"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <span
                        className={`flex items-center gap-2 ${
                          selected ? "font-semibold" : ""
                        }`}
                      >
                        {cat}
                        {selected && (
                          <CheckIcon className="w-4 h-4 text-blue-500" />
                        )}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
};

interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  className = "",
  disabled = false,
  label,
}) => {
  const selectedOption = options.find((opt) => opt.value === value);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!open) return;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
        zIndex: 9999,
        maxHeight: 240,
      });
    }
    const handleClick = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className={`relative w-16 min-w-[64px] ${className}`}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700 select-none">
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        className={`w-full min-h-[36px] bg-white border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center text-gray-900 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
          disabled ? "opacity-60" : ""
        }`}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
      >
        {selectedOption ? (
          <span>{selectedOption.label}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span className="ml-auto">
          <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
        </span>
      </button>
      {open &&
        typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            className="rounded-lg bg-white py-2 shadow-lg border border-gray-200 focus:outline-none overflow-auto animate-fade-in"
            style={dropdownStyle}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`cursor-pointer select-none relative px-4 py-2 text-sm ${
                  value === opt.value
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-900"
                } hover:bg-blue-100`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  {opt.label}
                  {value === opt.value && (
                    <CheckIcon className="w-4 h-4 text-blue-500" />
                  )}
                </span>
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};
