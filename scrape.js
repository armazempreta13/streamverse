const fetch = require('node-fetch');

async function scrape() {
  const res = await fetch('https://www.embedmovies.org/documentacao');
  const text = await res.text();
  console.log(text.substring(0, 5000));
}
scrape();
