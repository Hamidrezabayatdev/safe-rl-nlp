"""Safe-RL NLP: a simplified Safe Reinforcement Learning problem (2D Safe Drone
Navigation) modeled as a constrained Nonlinear Program and solved two ways
(Lagrangian-family methods + SQP), with a numerical comparison.

Public surface:
    - problem.NLProblem      : objective, standardized constraints g(x) <= 0, rollout, metrics
    - scenarios.SCENARIOS    : the registry of preset problem instances
    - solvers                : augmented_lagrangian, penalty, primal_dual, sqp_slsqp
    - kkt.kkt_residuals      : shared KKT residual computation
    - experiment.run         : runs every solver on every scenario -> results.json
"""

__version__ = "0.1.0"
