require('dotenv').config({ path: '.env.local' });

async function findSolo() {
  const fetch = require('node-fetch');
  global.fetch = fetch;
  const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=solo+leveling`);
  const data = await res.json();
  console.log("ID:", data.results[0].id);
}
findSolo();
