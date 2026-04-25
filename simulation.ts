import { Router } from "express";
import { budgetSimulation, investmentSimulation } from "./simulationService";

const router = Router();

router.post("/budget", (req, res) => {
  const { income, needs, wants, savings } = req.body;
  const result = budgetSimulation(income, needs, wants, savings);
  res.json(result);
});

router.post("/investment", (req, res) => {
  const { monthly, years, risk } = req.body;
  const result = investmentSimulation(monthly, years, risk);
  res.json(result);
});

export default router;
