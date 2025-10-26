const { runBatchScrape, processQueue } = require('./scrapers/common');
(async ()=>{
  await runBatchScrape();
  const processed = await processQueue();
  console.log('Processed', processed);
  process.exit(0);
})();
