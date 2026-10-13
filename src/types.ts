export type PageId =
  | 'dashboard'
  | 'profile'
  | 'add-profile'
  | 'advisor'
  | 'opportunities'
  | 'recommendations'
  | 'financial-planner'
  | 'simulator'
  | 'schemes'
  | 'explainability'
  | 'action-plan'
  | 'settings';

export interface UserProfile {
  id: string;
  name: string;
  location?: string;
  village: string;
  block: string;
  district: string;
  state: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  education: string;
  availableCapital: number; // in INR
  monthlyExpenses: number; // in INR
  landAsset: string;
  powerReliabilityHours: number;
  shgMember: boolean;
  shgName?: string;
  casteCategory: 'General' | 'OBC' | 'SC' | 'ST' | 'Minority';
  skills: string[];
  experience: string; // e.g. "0-1 Years (Beginner)", "2-5 Years", etc.
  businessType: string; // e.g. "Agri-Processing & Cold Press"
  businessStage: string; // e.g. "Idea / Planning Stage", "Ready to Launch"
  resources: string[]; // e.g. ["Owned Land / Shed", "3-Phase Power"]
  businessGoal: string; // e.g. "Generate ₹35,000-₹50,000 monthly income"
  riskAppetite: 'Conservative' | 'Balanced' | 'Growth-oriented';
  preferredLanguage: string;
  selectedBusinessId: string;
}

export interface LocalOpportunity {
  id: string;
  title: string;
  sector: 'Agri-Processing' | 'Livestock & Feed' | 'Renewable Energy' | 'Crafts & Textiles' | 'Services & Trade' | 'Bio-Inputs' | string;
  district: string;
  state: string;
  rawMaterialSurplus: string;
  demandGap: string;
  estimatedMarketSizePerMonth: number;
  marginPotentialPercent: number;
  competition: 'Low' | 'Medium' | 'High' | string;
  buyerTypes: string[];
  keySeasonality: string;
  feasibilityScore: number; // 0-100
  recommendedBusinessIds: string[];
  demand?: string;
  market_gap?: string;
  seasonality?: string;
  resources?: string[];
  opportunity_score?: number;
  is_demo?: boolean;
}

export interface BusinessModel {
  id: string;
  name: string;
  hindiName: string;
  category: 'Agri-Processing' | 'Livestock & Feed' | 'Renewable Energy' | 'Rural Services' | 'Bio-Inputs' | string;
  tagline: string;
  minCapital: number;
  maxCapital: number;
  monthlyRevenueEstimate: number;
  monthlyProfitEstimate: number;
  grossMarginPercent: number;
  paybackPeriodMonths: number;
  operationalComplexity: 'Beginner' | 'Moderate' | 'Advanced' | string;
  powerRequirement: string;
  keyEquipment: string[];
  targetBuyers: string[];
  overallViabilityScore: number; // 0-100
  schemeMatchCount: number;
  explainabilitySummary: string;
  weights?: {
    rawMaterialSurplus: number;
    capitalFeasibility: number;
    localDemandStrength: number;
    skillAndAssetFit: number;
    governmentSubsidyBoost: number;
  };
  schemes?: string[];
}

export interface BusinessRecommendationItem {
  business: BusinessModel;
  investment: {
    min: number;
    max: number;
    recommended: number;
    equipment: number;
    working_capital: number;
    licensing_and_packaging: number;
    capital_gap: number;
    coverage_status: string;
    formatted: string;
    detailed_formatted?: string;
  };
  demand: string;
  competition: string;
  risk: string;
  risk_level?: string;
  opportunity_score: number;
  reason: string;
}

export interface RecommendationsApiResponse {
  status: string;
  recommendations: BusinessRecommendationItem[];
  top_3: BusinessRecommendationItem[];
  profile_considered?: {
    name?: string;
    location?: string;
    capital?: number;
    skills?: string[];
  };
  is_demo?: boolean;
  data_notice?: string;
}

export interface FinancialModelData {
  businessId: string;
  capitalExpenditure: {
    machinery: number;
    shedCivilWorks: number;
    electricalConnections: number;
    licensesAndRegistration: number;
  };
  operationalMonthly: {
    rawMaterials: number;
    laborWages: number;
    electricityFuel: number;
    packagingTransportation: number;
    rentMisc: number;
  };
  pricingAndVolume: {
    unitName: string;
    sellingPricePerUnit: number;
    variableCostPerUnit: number;
    expectedMonthlyVolume: number;
  };
  workingCapitalBufferMonths: number;
}

export interface WhatIfSimulation {
  rawMaterialPriceChangePercent: number; // -30 to +50
  sellingPriceChangePercent: number;     // -30 to +50
  volumeChangePercent: number;           // -50 to +100
  powerCostChangePercent: number;        // -20 to +50
  monsoonImpact: 'Normal' | 'Deficit (-25%)' | 'Bumper Crop (+20%)';
}

export interface GovernmentScheme {
  id: string;
  name: string;
  nodalAgency: string;
  type: 'Subsidy' | 'Collateral-Free Loan' | 'Capital Grant' | 'SHG Credit Linkage';
  maxLoanAmount: number;
  subsidyPercent: number;
  specialCategorySubsidy: number;
  eligibleSectors: string[];
  eligibilityConditions: string[];
  requiredDocuments: string[];
  portalUrl: string;
  processingTimeDays: number;
  interestSubvention?: string;
  matchScoreForUser: number;
}

export interface MatchedSchemeItem {
  scheme: {
    id: string;
    code: string;
    name: string;
    short_name?: string;
    type: string;
    category?: string;
    nodal_agency: string;
    ministry: string;
    max_loan_amount: number;
    eligible_sectors: string[];
    processing_time_days: number;
  };
  eligibility: {
    is_eligible: boolean;
    match_score: number;
    eligibility_status: string;
    matched_criteria: string[];
    unmet_criteria: string[];
    key_conditions: string[];
    reasons: string[];
    semantic_similarity?: number;
  };
  benefits: {
    subsidy_percent: number;
    subsidy_amount: number;
    special_category_subsidy_percent?: number;
    max_loan_amount: number;
    interest_subvention: string;
    collateral_required: string;
    moratorium_period: string;
    repayment_tenure: string;
    summary: string;
  };
  documents: string[];
  source: {
    portal_url: string;
    nodal_agency: string;
    ministry: string;
    guideline_reference: string;
    application_mode: string;
    helpline?: string;
  };
  verification_status: {
    status: string;
    scheme_code: string;
    is_official: boolean;
    fiscal_year_validity: string;
    nodal_authority: string;
    direct_apply_available: boolean;
  };
}

export interface SchemeMatchResponse {
  status: string;
  total_schemes_evaluated: number;
  total_matched: number;
  total_eligible: number;
  entrepreneur_summary: Record<string, any>;
  matches: MatchedSchemeItem[];
  rag_metadata?: {
    rag_ready: boolean;
    is_faiss_native: boolean;
    index_type: string;
    vector_dimension: number;
    embedding_model_compatible: string;
    documents_indexed_count: number;
    similarity_metric: string;
  };
}

export interface ActionPlanTask {
  id: string;
  title: string;
  description: string;
  officialEntity: string;
  durationDays: number;
  estimatedCost: number;
  isCompleted: boolean;
  mandatoryDocuments: string[];
  practicalTips: string;
  timeEstimate?: string;
  documentsNeeded?: string[];
}

export interface ActionPlanPhase {
  id: string;
  phaseNumber: number;
  name: string;
  timeframe: string;
  goal: string;
  keyMilestone?: string;
  tasks: ActionPlanTask[];
  title?: string;
  timelineDays?: string;
}

export interface ActionPlanApiResponse {
  status: string;
  business_id: string;
  business_name: string;
  generated_at: string;
  model_used: string;
  roadmap_summary: string;
  total_estimated_budget: number;
  total_tasks_count: number;
  phases: ActionPlanPhase[];
}

export interface TargetBuyerDetail {
  buyer: string;
  reason: string;
}

export interface IdentifiedRisk {
  risk_title: string;
  explanation: string;
  mitigation: string;
  severity: 'Low' | 'Medium' | 'High' | string;
}

export interface EntrepreneurFitData {
  score: number;
  rating: string;
  summary: string;
  key_points: string[];
  strengths: string[];
  growth_areas: string[];
}

export interface MarketFitData {
  score: number;
  rating: string;
  summary: string;
  key_points: string[];
  target_buyers: TargetBuyerDetail[];
  competition_analysis: string;
}

export interface FinancialFitData {
  score: number;
  rating: string;
  summary: string;
  key_points: string[];
  capital_coverage_percent: number;
  estimated_payback_months: number;
  estimated_break_even_months: number;
  monthly_net_profit_estimate: number;
  buffer_recommendation: string;
}

export interface ResourceFitData {
  score: number;
  rating: string;
  summary: string;
  key_points: string[];
  critical_resources_verified: string[];
  infrastructure_notes: string;
}

export interface RisksData {
  risk_level: string;
  summary: string;
  identified_risks: IdentifiedRisk[];
  overall_downside_protection: string;
}

export interface AssumptionsData {
  summary: string;
  key_assumptions: string[];
  operating_parameters?: {
    working_days_per_month: number;
    shift_hours_per_day: number;
    starting_capacity_utilization_percent: number;
    target_capacity_utilization_percent: number;
    average_collection_days: number;
  };
}

export interface DataLimitationsData {
  summary: string;
  limitations: string[];
  field_action_checklist: string[];
}

export interface ExplainApiResponse {
  status: string;
  business_id: string;
  business_name: string;
  overall_match_score: number;
  summary: string;
  entrepreneur_fit: EntrepreneurFitData;
  market_fit: MarketFitData;
  financial_fit: FinancialFitData;
  resource_fit: ResourceFitData;
  risks: RisksData;
  assumptions: AssumptionsData;
  data_limitations: DataLimitationsData;
}

