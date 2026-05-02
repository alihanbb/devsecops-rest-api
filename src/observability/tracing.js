const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { resourceFromAttributes } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { env } = require("../config/env");
const { logger } = require("../config/logger");

let sdk;

const startTracing = async () => {
  if (!env.OTEL_ENABLED) {
    return;
  }

  if (sdk) {
    return;
  }

  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
    resource: resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: env.APP_NAME,
      [SemanticResourceAttributes.SERVICE_VERSION]: env.APP_VERSION,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.NODE_ENV,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  await sdk.start();
  logger.info({ endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT }, "OpenTelemetry tracing started");
};

const shutdownTracing = async () => {
  if (!sdk) {
    return;
  }

  await sdk.shutdown();
  sdk = null;
  logger.info("OpenTelemetry tracing stopped");
};

module.exports = {
  startTracing,
  shutdownTracing,
};
