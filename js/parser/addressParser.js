export function extractAddresses(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 10 && l.length < 150);
  const candidates = lines.filter(l => /(?:^|\b\d+\s+.*\b)(st|street|road|rd|ave|avenue|lane|ln|drive|dr|boulevard|blvd|square|sq|tower|building|apt|floor)\b/i.test(l));
  return [...new Set(candidates)].slice(0,3).map(value => ({ type:'note', title:'Possible address', locationLabel:value, confidence:.56, status:'needs_check', reason:'Address-like words found; stored conservatively for user verification.' }));
}
