export enum IntegrationStatus {
  PREPARING = 'PREPARING', // host preparing the integration data
  ATTACHED = 'ATTACHED', // attached to the parent so we will process this integration data along with the parent data
  PENDING = 'PENDING', // we can process this data, along with any child that attached to it
  INPROCESS = 'INPROCESS', // we are processing the data
  ERROR = 'ERROR', // we have error processing the data
  COMPLETED = 'COMPLETED', // we complete processing the data, long with any child that attached to it.
  SENT = 'SENT',      // We have sent the integration data to some service to process
}
