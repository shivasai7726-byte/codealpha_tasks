const expressionEl = document.getElementById('expression');
const previewEl = document.getElementById('preview');
const buttons = document.querySelectorAll('button');

let expression = '';

const sanitizeExpression = (value) => value.replace(/[^0-9.+\-*/() ]/g, '');

const formatPreview = (result) => {
  if (result === '' || result === undefined || result === null || Number.isNaN(result)) {
    previewEl.textContent = '0';
    return;
  }
  previewEl.textContent = String(result);
};

const trimTrailingOperators = (expr) => expr.replace(/[+\-*/.]+$/g, '');

const updateDisplay = () => {
  expressionEl.textContent = expression || '0';
  if (!expression || expression === '0') {
    previewEl.textContent = '0';
    return;
  }
  const sanitized = sanitizeExpression(expression);
  const previewExpression = trimTrailingOperators(sanitized);

  if (!previewExpression) {
    previewEl.textContent = '0';
    return;
  }

  try {
    const result = Function(`"use strict"; return (${previewExpression})`)();
    formatPreview(result);
  } catch {
    previewEl.textContent = '0';
  }
};

const appendValue = (value) => {
  if (expression === '0' && /[0-9.]/.test(value)) {
    expression = value;
  } else {
    if (expression.length >= 24) return;
    expression += value;
  }
  updateDisplay();
};

const deleteLast = () => {
  expression = expression.slice(0, -1);
  updateDisplay();
};

const clearAll = () => {
  expression = '';
  updateDisplay();
};

const evaluateExpression = () => {
  if (!expression) return;
  const sanitized = sanitizeExpression(expression);
  const expressionToEvaluate = trimTrailingOperators(sanitized);
  if (!expressionToEvaluate) {
    clearAll();
    return;
  }
  try {
    const result = Function(`"use strict"; return (${expressionToEvaluate})`)();
    expression = String(result);
    updateDisplay();
  } catch {
    clearAll();
  }
};

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (action === 'clear') {
      clearAll();
      return;
    }
    if (action === 'delete') {
      deleteLast();
      return;
    }
    if (action === 'equals') {
      evaluateExpression();
      return;
    }
    if (value) {
      appendValue(value);
    }
  });
});

window.addEventListener('keydown', (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key) || key === '.') {
    event.preventDefault();
    appendValue(key);
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluateExpression();
    return;
  }

  if (key === 'Backspace') {
    event.preventDefault();
    deleteLast();
    return;
  }

  if (key === 'Escape' || key.toLowerCase() === 'c') {
    event.preventDefault();
    clearAll();
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    event.preventDefault();
    appendValue(key);
    return;
  }
});

updateDisplay();
