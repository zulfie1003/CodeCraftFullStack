import { useEffect, useRef, useState } from "react";

function AuthRoleSelector({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value) || options[0];

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className={`role-picker${open ? " is-open" : ""}`} ref={wrapperRef}>
      <span className="role-picker-label">{label}</span>

      <button
        type="button"
        className="role-picker-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="role-picker-trigger-copy">
          <strong>{selectedOption.label}</strong>
          <small>{selectedOption.description}</small>
        </span>
        <span className="role-picker-trigger-icon">{open ? "Hide" : "Choose"}</span>
      </button>

      {open && (
        <div className="role-picker-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`role-picker-option${option.value === value ? " active" : ""}`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              <span className="role-picker-option-copy">
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
              {option.value === value && <span className="role-picker-badge">Selected</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuthRoleSelector;
