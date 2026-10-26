import { useEffect, useState } from "react";
import "./CalculatorModal.css";

const keys = [
  { label: "AC", type: "function" }, { label: "DEL", type: "function" },
  { label: "%", type: "operator" }, { label: "/", type: "operator" },
  { label: "7", type: "number" }, { label: "8", type: "number" },
  { label: "9", type: "number" }, { label: "*", type: "operator" },
  { label: "4", type: "number" }, { label: "5", type: "number" },
  { label: "6", type: "number" }, { label: "-", type: "operator" },
  { label: "1", type: "number" }, { label: "2", type: "number" },
  { label: "3", type: "number" }, { label: "+", type: "operator" },
  { label: "0", type: "number", extra: "zero" }, { label: ".", type: "decimal" },
  { label: "=", type: "equal" },
];

function calculate(expression) {
  const tokens = expression.match(/\d+(?:\.\d*)?|\.\d+|[+\-*/%]/g);
  if (!tokens || tokens.join("") !== expression) throw new Error("Operación inválida");
  let position = 0;
  const factor = () => {
    const token = tokens[position];
    if (token === "+" || token === "-") {
      position += 1;
      const value = factor();
      return token === "-" ? -value : value;
    }
    if (!token || !/^\d+(?:\.\d*)?$|^\.\d+$/.test(token)) throw new Error("Operación inválida");
    position += 1;
    return Number(token);
  };
  const term = () => {
    let value = factor();
    while (["*", "/", "%"].includes(tokens[position])) {
      const operator = tokens[position++];
      const next = factor();
      if ((operator === "/" || operator === "%") && next === 0) throw new Error("No se puede dividir por cero");
      if (operator === "*") value *= next;
      if (operator === "/") value /= next;
      if (operator === "%") value %= next;
    }
    return value;
  };
  let value = term();
  while (tokens[position] === "+" || tokens[position] === "-") {
    const operator = tokens[position++];
    const next = term();
    value = operator === "+" ? value + next : value - next;
  }
  if (position !== tokens.length || !Number.isFinite(value)) throw new Error("Operación inválida");
  return Number(value.toPrecision(12)).toString();
}

export default function CalculatorModal({ onClose }) {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [justCalculated, setJustCalculated] = useState(false);
  const display = error || result || expression || "0";

  const clear = () => {
    setExpression("");
    setResult("");
    setError("");
    setJustCalculated(false);
  };

  const pressKey = (key) => {
    if (key === "AC") return clear();
    if (key === "DEL") {
      setExpression((current) => current.slice(0, -1));
      setResult("");
      setError("");
      setJustCalculated(false);
      return;
    }
    if (key === "=") {
      if (!expression) return;
      try {
        setResult(calculate(expression));
        setError("");
        setJustCalculated(true);
      } catch (calculationError) {
        setResult("");
        setError(calculationError.message);
      }
      return;
    }

    setError("");
    if (/^\d$/.test(key)) {
      setExpression((current) => (justCalculated ? key : current + key));
      setResult("");
      setJustCalculated(false);
      return;
    }
    if (key === ".") {
      const currentNumber = expression.split(/[+\-*/%]/).pop();
      if (currentNumber.includes(".")) return;
      setExpression((current) => (justCalculated ? "0." : current + (currentNumber ? "." : "0.")));
      setResult("");
      setJustCalculated(false);
      return;
    }
    setExpression((current) => {
      const base = justCalculated ? result : current;
      if (!base) return key === "-" ? "-" : "";
      if (/[+*/%]$/.test(base) || /-$/.test(base)) {
        if (key === "-" && !/--$/.test(base)) return base + key;
        return base.slice(0, -1) + key;
      }
      return base + key;
    });
    setResult("");
    setJustCalculated(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (/^\d$/.test(event.key) || ["+", "-", "*", "/", "%", "."].includes(event.key)) {
        event.preventDefault();
        pressKey(event.key);
      } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        pressKey("=");
      } else if (event.key === "Backspace") {
        event.preventDefault();
        pressKey("DEL");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  return <div className="calculator-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="calculator-modal" role="dialog" aria-modal="true" aria-labelledby="calculator-title">
      <header className="calculator-modal-heading"><h2 id="calculator-title">Calculadora</h2><button type="button" onClick={onClose} aria-label="Cerrar calculadora">×</button></header>
      <div className="calculator-display" aria-live="polite">{display}</div>
      <div className="calculator-keys">{keys.map(({ label, type, extra }) => <button key={label} type="button" className={["calculator-key", "is-" + type, extra].filter(Boolean).join(" ")} onClick={() => pressKey(label)} aria-label={label === "DEL" ? "Borrar último dígito" : label}>{label}</button>)}</div>
    </section>
  </div>;
}
