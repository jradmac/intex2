import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPath = './Movies.db'; // adjust path if needed
const baseUrl = 'https://intexphotostorage.blob.core.windows.net/intexistheworstok/Movie%20Posters/';

const titleOverrides = {
    'Naruto Shippuden the Movie Bonds': 'Naruto Shippûden the Movie Bonds',
    'InuYasha the Movie 2 The Castle Beyond the Looking Glass': 'InuYasha The Movie 2 The Castle Beyond the Looking Glass',
    // add more here if needed
};


function sanitizeTitleForBlob(title) {
    return title
      .normalize('NFD')                             // remove accents
      .replace(/[\u0300-\u036f]/g, '')              // still remove leftover accents
      .replace(/\((.*?)\)/g, '$1')                  // remove parentheses but keep inside
      .replace(/\s*-\s*/g, '  ')                    // hyphen → double space
      .replace(/[:!.,'"&]/g, '')                    // remove punctuation
      // ⛔ intentionally NOT removing anything else — let Azure match exact titles
      .trim();                                      // keep original casing!
}




async function updatePosterUrls() {
const db = await open({
filename: dbPath,
driver: sqlite3.Database,
});

const movies = await db.all('SELECT show_id, title FROM movies_titles');

for (const movie of movies) {
if (!movie.title || movie.title.trim() === '') continue;

const rawTitle = movie.title;
const correctedTitle = titleOverrides[rawTitle] || rawTitle;
const cleanedTitle = sanitizeTitleForBlob(correctedTitle);

const encodedTitle = encodeURIComponent(cleanedTitle) + '.jpg';
const fullUrl = `${baseUrl}${encodedTitle}`;

await db.run(
    'UPDATE movies_titles SET posterUrl = ? WHERE show_id = ?',
    [fullUrl, movie.show_id]
);

console.log(`✅ ${movie.title} → ${fullUrl}`);
}

console.log('🎉 Poster URLs restored from Azure!');
await db.close();
}

updatePosterUrls().catch(err => {
console.error('❌ Error updating poster URLs:', err);
});