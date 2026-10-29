// Worker do Breakthrough: resolve a estrategia otima fora da thread da pagina (leva alguns segundos).
import { solve } from './breakthrough-advisor.js';

self.onmessage = function(e) {
  var sol = solve(e.data.rows, e.data.weights, function(p) { self.postMessage({ progress: p }); });
  var buffers = sol.policy.filter(Boolean).map(function(p) { return p.buffer; });
  self.postMessage({ done: true, sol: sol }, buffers);
};
