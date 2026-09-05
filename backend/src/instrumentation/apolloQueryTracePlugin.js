import { summarizeQueryTrace } from "./queryTrace.js";

export const apolloQueryTracePlugin = {
  async requestDidStart() {
    return {
      async willSendResponse({ contextValue, response }) {
        const trace = contextValue?.queryTrace;
        if (!trace?.enabled || response.body.kind !== "single") return;

        response.body.singleResult.extensions = {
          ...response.body.singleResult.extensions,
          queryTrace: summarizeQueryTrace(trace),
        };
      },
    };
  },
};
