// Central LaTeX strings, shared by both languages (math stays LTR/Latin).
export const FORMULAS = {
  decisionVector: String.raw`x = \big[\,a_{x,0},\,a_{y,0},\,\dots,\,a_{x,T-1},\,a_{y,T-1}\,\big] \in \mathbb{R}^{2T}`,

  dynamics: String.raw`\begin{aligned}
x_{t+1} &= x_t + v_{x,t}\,\Delta t, & v_{x,t+1} &= v_{x,t} + a_{x,t}\,\Delta t,\\
y_{t+1} &= y_t + v_{y,t}\,\Delta t, & v_{y,t+1} &= v_{y,t} + a_{y,t}\,\Delta t.
\end{aligned}`,

  objective: String.raw`J(x) = \sum_{t=0}^{T-1}\Big[(x_t - x_g)^2 + (y_t - y_g)^2 + \alpha\,(a_{x,t}^2 + a_{y,t}^2)\Big]`,

  energy: String.raw`\sum_{t=0}^{T-1}(a_{x,t}^2 + a_{y,t}^2) - E_{\max} \le 0`,
  speed: String.raw`v_{x,t}^2 + v_{y,t}^2 - V_{\max}^2 \le 0,\quad t = 1,\dots,T`,
  hazard: String.raw`R_h^2 - (x_t - x_h)^2 - (y_t - y_h)^2 \le 0,\quad t = 1,\dots,T`,
  bounds: String.raw`a_{\min} \le a_{x,t},\,a_{y,t} \le a_{\max}`,

  standardized: String.raw`\begin{aligned}
\min_{x}\ & J(x)\\
\text{s.t.}\ & g_i(x) \le 0,\quad i = 1,\dots,2T+1,\\
& a_{\min} \le x \le a_{\max}.
\end{aligned}`,

  lagrangian: String.raw`\mathcal{L}(x,\lambda) = J(x) + \sum_{i} \lambda_i\, g_i(x),\qquad \lambda_i \ge 0`,

  kktStationarity: String.raw`\nabla_x J(x^\star) + \sum_i \lambda_i^\star\, \nabla_x g_i(x^\star) = 0`,
  kktPrimal: String.raw`g_i(x^\star) \le 0 \quad \forall i`,
  kktDual: String.raw`\lambda_i^\star \ge 0 \quad \forall i`,
  kktComp: String.raw`\lambda_i^\star\, g_i(x^\star) = 0 \quad \forall i`,

  augmented: String.raw`\mathcal{A}(x;\lambda,\rho) = J(x) + \frac{1}{2\rho}\sum_i\Big[\max(0,\,\lambda_i + \rho\, g_i)^2 - \lambda_i^2\Big]`,
  augmentedUpdate: String.raw`\lambda_i \leftarrow \max\!\big(0,\ \lambda_i + \rho\, g_i(x)\big)`,

  penalty: String.raw`\Phi(x;\mu) = J(x) + \frac{\mu}{2}\sum_i \max(0,\,g_i(x))^2`,

  sqpSubproblem: String.raw`\min_{d}\ \ \nabla J(x_k)^\top d + \tfrac{1}{2} d^\top H_k d \quad\text{s.t.}\quad g_i(x_k) + \nabla g_i(x_k)^\top d \le 0`,
} as const;
