/**
 * In-Memory Datastore
 * Stores all application data in memory (resets on server restart)
 */

const datastore = {
  investors: [],              // 50 investors (same as Portfolio customers)
  riskProfiles: [],           // Calculated risk profiles per investor
  riskAssessments: [],        // Questionnaire responses and results
  riskScores: [],             // Point-in-time risk score snapshots
  scenarios: [],              // Predefined stress test scenarios
  recommendations: [],        // Generated investment recommendations
  riskFactors: [],            // Risk factor definitions and weights
  benchmarks: []              // Market benchmarks for comparison
};

// Counter for generating IDs
const counters = {
  investor: 1,
  assessment: 1,
  profile: 1,
  score: 1,
  scenario: 1,
  recommendation: 1,
  factor: 1,
  benchmark: 1
};

/**
 * Generate next ID for a given type
 */
function generateId(type) {
  const id = counters[type]++;
  const prefix = {
    investor: 'INV',
    assessment: 'ASM',
    profile: 'PRF',
    score: 'SCR',
    scenario: 'SCN',
    recommendation: 'REC',
    factor: 'FAC',
    benchmark: 'BM'
  };
  return `${prefix[type]}-${String(id).padStart(3, '0')}`;
}

/**
 * Get all items from a collection
 */
function getAll(collection) {
  return [...datastore[collection]];
}

/**
 * Get item by ID from a collection
 */
function getById(collection, idField, id) {
  return datastore[collection].find(item => item[idField] === id);
}

/**
 * Get items matching a filter
 */
function getWhere(collection, filter) {
  return datastore[collection].filter(filter);
}

/**
 * Add item to a collection
 */
function add(collection, item) {
  datastore[collection].push(item);
  return item;
}

/**
 * Update item in a collection
 */
function update(collection, idField, id, updates) {
  const index = datastore[collection].findIndex(item => item[idField] === id);
  if (index === -1) return null;
  
  datastore[collection][index] = {
    ...datastore[collection][index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return datastore[collection][index];
}

/**
 * Delete item from a collection
 */
function remove(collection, idField, id) {
  const index = datastore[collection].findIndex(item => item[idField] === id);
  if (index === -1) return false;
  
  datastore[collection].splice(index, 1);
  return true;
}

/**
 * Reset all data (useful for testing)
 */
function reset() {
  datastore.investors = [];
  datastore.riskProfiles = [];
  datastore.riskAssessments = [];
  datastore.riskScores = [];
  datastore.scenarios = [];
  datastore.recommendations = [];
  datastore.riskFactors = [];
  datastore.benchmarks = [];
  
  // Reset counters
  Object.keys(counters).forEach(key => counters[key] = 1);
}

module.exports = {
  datastore,
  generateId,
  getAll,
  getById,
  getWhere,
  add,
  update,
  remove,
  reset
};

