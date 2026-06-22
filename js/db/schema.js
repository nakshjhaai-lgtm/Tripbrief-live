export const DB_NAME = 'tripbrief-live';
export const DB_VERSION = 1;
export const STORES = {
  trips: [['status'], ['startDate'], ['updatedAt']],
  rawItems: [['tripId'], ['kind'], ['createdAt'], ['ocrStatus'], ['parseStatus'], ['hash']],
  events: [['tripId'], ['type'], ['start'], ['status'], ['confidence']],
  documents: [['tripId'], ['type'], ['sensitive'], ['encrypted']],
  weatherCache: [['tripId'], ['expiresAt'], ['lat','lon']],
  placesCache: [['tripId'], ['expiresAt']],
  destinationGuides: [['tripId'], ['destinationLabel']],
  currencyCache: [['tripId'], ['base'], ['target']],
  offlinePacks: [['tripId'], ['status'], ['generatedAt']],
  settings: [],
  auditLog: [['tripId'], ['entityType'], ['createdAt']]
};
