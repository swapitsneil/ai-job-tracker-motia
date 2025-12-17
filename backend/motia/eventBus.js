/**
 * Simple Event Bus for Motia Workflow Integration
 * Uses basic event dispatching pattern without external dependencies
 */

// Workflow functions (imported below)
let workflows = {};

// Event bus implementation
const eventBus = {
  /**
   * Register workflow functions
   * @param {Object} workflowFunctions - Object containing workflow functions
   */
  registerWorkflows: (workflowFunctions) => {
    workflows = workflowFunctions;
    console.log('✅ Motia Event Bus initialized with workflows');
  },

  /**
   * Emit an event and execute the corresponding workflow
   * @param {string} eventName - Name of the event to emit
   * @param {Object} payload - Data payload for the workflow
   * @returns {Promise<Object>} Result of the workflow execution
   */
  emitEvent: async (eventName, payload) => {
    try {
      // Check if workflow exists for this event
      if (!workflows[eventName]) {
        console.warn(`⚠️ No workflow registered for event: ${eventName}`);
        return { success: false, error: `No workflow for event: ${eventName}` };
      }

      console.log(`📡 Event emitted: ${eventName}`);
      console.log(`📦 Payload:`, payload);

      // Execute the corresponding workflow
      const result = await workflows[eventName](payload);

      console.log(`✅ Workflow completed: ${eventName}`);
      return { success: true, ...result };
    } catch (error) {
      console.error(`❌ Error in workflow ${eventName}:`, error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all registered workflows
   * @returns {Object} Registered workflows
   */
  getWorkflows: () => workflows
};

// Export the event bus
module.exports = eventBus;