// Utilitarios compartilhados.

// Cria um elemento com classe e texto (textContent: nunca interpreta HTML).
export function el(tag, className, text) {
  var e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

export function escapeHtml(s) {
  var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML;
}

export function debounce(fn, ms) {
  var t;
  return function() {
    var a = arguments, c = this;
    clearTimeout(t);
    t = setTimeout(function() { fn.apply(c, a); }, ms);
  };
}

export function fmt(n) {
  if (n == null || isNaN(n)) return '0';
  return n.toLocaleString('pt-BR', {maximumFractionDigits: 0, minimumFractionDigits: 0});
}

export function parseNum(v) {
  if (typeof v === 'string') v = v.replace(',', '.');
  var n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}
