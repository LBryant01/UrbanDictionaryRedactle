import React, { useEffect, useMemo, useRef, useState } from 'react';
// A self-contained pool of notable articles. Categories here are offline fallbacks;
// the game attempts to retrieve current categories and redirects from Wikipedia.
// Format: title | kind | semicolon-separated category clues | semicolon-separated aliases
const rawArticles = `
Eiffel Tower|place|1889 establishments in France;Buildings and structures in the 7th arrondissement of Paris;Observation towers in France;Tourist attractions in Paris;World's fair architecture in Paris|La Tour Eiffel
Marie Curie|person|1867 births;1934 deaths;French Nobel laureates;Polish chemists;Women physicists;University of Paris faculty|Maria Skłodowska-Curie;Madame Curie
Mount Everest|place|Eight-thousanders of the Himalayas;Mountains of Nepal;Mountains of Tibet;Seven Summits;Highest points of countries|Sagarmatha;Chomolungma
Mona Lisa|thing|1500s paintings;Paintings by Leonardo da Vinci;Paintings in the Louvre;Portraits of women;Stolen works of art|La Gioconda;La Joconde
The Beatles|thing|1960s music groups;British Invasion artists;English rock music groups;Grammy Award winners;Musical groups from Liverpool|Beatles
Cleopatra|person|1st-century BC Egyptian people;Ptolemaic pharaohs;Queens regnant in Africa;Suicides in Ancient Egypt;Women in ancient warfare|Cleopatra VII;Cleopatra VII Philopator
Great Wall of China|place|Ancient fortifications;Buildings and structures in China;Fortifications in Asia;World Heritage Sites in China;National symbols of China;Ming dynasty;Military history of East Asia;Historic defensive barriers|Great Wall
Albert Einstein|person|1879 births;1955 deaths;German Nobel laureates;Jewish physicists;Patent examiners;Princeton University faculty|Einstein
Titanic|thing|1912 ships;Maritime incidents in 1912;Ocean liners;Shipwrecks in the Atlantic Ocean;Ships built in Belfast|RMS Titanic
Serena Williams|person|1981 births;American female tennis players;Olympic gold medalists for the United States in tennis;Australian Open champions;Wimbledon champions|
Saturn|thing|Gas giants;Outer planets of the Solar System;Planets of the Solar System;Ringed planets;Roman deities in astronomy|
Taj Mahal|place|1640s establishments in India;Mausoleums in India;Mughal architecture;Tourist attractions in Agra;World Heritage Sites in India|
Nelson Mandela|person|1918 births;2013 deaths;Anti-apartheid activists;Nobel Peace Prize laureates;Presidents of South Africa;Prisoners on Robben Island|Madiba
Giza pyramid complex|place|Ancient Egyptian funerary practices;Buildings and structures in Giza;Egyptian pyramids;World Heritage Sites in Egypt;Ancient Seven Wonders of the World|Pyramids of Giza;Giza Necropolis
Leonardo da Vinci|person|1452 births;1519 deaths;Italian Renaissance painters;Italian inventors;Italian anatomists;Renaissance humanists|Leonardo
Harry Potter|thing|British children's novels;Fantasy book series;Fictional wizards;Literary characters introduced in 1997;Novels adapted into films|Harry Potter series
Tokyo|place|Capitals in Asia;Cities in Japan;Host cities of the Summer Olympic Games;Populated places established in the 15th century;Special wards of Japan|Edo
Amelia Earhart|person|1897 births;1930s missing person cases;American aviation pioneers;Female aviators;People lost at sea|Amelia Mary Earhart
Black hole|thing|Astrophysical phenomena;General relativity;Gravitational singularities;Stellar evolution;Space science|
Frida Kahlo|person|1907 births;1954 deaths;Mexican women painters;Portrait artists;Surrealist artists;People from Coyoacán|Magdalena Carmen Frida Kahlo y Calderón
Sydney Opera House|place|1973 establishments in Australia;Buildings and structures in Sydney;Expressionist architecture;Performing arts centers;World Heritage Sites in Australia|
Charles Darwin|person|1809 births;1882 deaths;English naturalists;Evolutionary biologists;Fellows of the Royal Society;People educated at Shrewsbury School|Darwin
The Starry Night|thing|1889 paintings;Collection of the Museum of Modern Art;Night in art;Paintings by Vincent van Gogh;Post-Impressionist paintings|Starry Night
Amazon River|place|International rivers of South America;Rivers of Brazil;Rivers of Colombia;Rivers of Peru;Rivers of the Amazon basin|
Ada Lovelace|person|1815 births;1852 deaths;British women mathematicians;History of computing;English computer programmers;Daughters of peers|Augusta Ada King;Augusta Ada Byron
Penicillin|thing|Beta-lactam antibiotics;British inventions;Medical discoveries;World Health Organization essential medicines;Microbiology|
Machu Picchu|place|15th-century establishments in the Inca civilization;Archaeological sites in Peru;Inca sites;Tourist attractions in Peru;World Heritage Sites in Peru|
Isaac Newton|person|1642 births;1727 deaths;English physicists;Masters of the Mint;Presidents of the Royal Society;Alumni of Trinity College Cambridge|Sir Isaac Newton;Newton
Minecraft|thing|2011 video games;Microsoft acquisitions;Open-world video games;Sandbox games;Swedish video games;Video games with user-generated gameplay|MC
Sahara|place|Deserts of Africa;Ecoregions of Africa;Geography of North Africa;Hot deserts;Natural regions of Africa|Sahara Desert
Rosa Parks|person|1913 births;2005 deaths;African-American civil rights activists;American women activists;Montgomery bus boycott;Presidential Medal of Freedom recipients|
The Great Gatsby|thing|1925 American novels;American novels adapted into films;Novels by F. Scott Fitzgerald;Novels set in New York;Modernist novels|Great Gatsby
Niagara Falls|place|Border waterfalls;Canada–United States border;Tourist attractions in Ontario;Tourist attractions in New York state;Waterfalls of North America|
Nikola Tesla|person|1856 births;1943 deaths;Electrical engineers;Serbian inventors;People associated with electricity;American inventors|
Chernobyl disaster|thing|1986 in the Soviet Union;Civilian nuclear power accidents;Environmental disasters in Ukraine;Industrial accidents;Nuclear reactor accidents|Chernobyl accident
Grand Canyon|place|Canyons and gorges of Arizona;Colorado River;National parks of Arizona;Tourist attractions in Arizona;World Heritage Sites in the United States|
Jane Austen|person|1775 births;1817 deaths;18th-century English novelists;19th-century women writers;English romantic fiction writers;Women of the Regency era|Austen
Pac-Man|thing|1980 video games;Arcade video games;Japanese video games;Maze games;Namco games|Pacman
Antarctica|place|Continents;Geographical regions of the Southern Ocean;Polar regions of Earth;Uninhabited regions;Cold deserts|
William Shakespeare|person|1564 births;1616 deaths;English dramatists and playwrights;English poets;People from Stratford-upon-Avon;Sonneteers|Shakespeare
Hubble Space Telescope|thing|1990 in spaceflight;NASA space telescopes;Optical telescopes;Space Shuttle payloads;Space telescopes;Astronomical observatories in space;Great Observatories program;Astronomical instruments;Astronomy in the United States|Hubble;HST
Stonehenge|place|Archaeological sites in Wiltshire;Bronze Age sites in England;Megalithic monuments in England;Neolithic sites in England;World Heritage Sites in England|
Wolfgang Amadeus Mozart|person|1756 births;1791 deaths;Austrian classical composers;Child prodigies;Classical-period composers;Opera composers|Mozart
Great Barrier Reef|place|Coral reefs of Australia;Marine parks of Queensland;Natural wonders of the world;Protected areas of Queensland;World Heritage Sites in Australia|
Internet|thing|American inventions;Computer networking;Global communication;Information technology;Telecommunications infrastructure|The Internet
Florence Nightingale|person|1820 births;1910 deaths;British nurses;Female statisticians;Nursing pioneers;Women in the Crimean War;Hospital reformers|The Lady with the Lamp
Angkor Wat|place|12th-century religious buildings;Angkorian sites;Buddhist temples in Cambodia;Hindu temples in Cambodia;World Heritage Sites in Cambodia|
Olympic Games|thing|Ancient Greek sports;International multi-sport events;Recurring sporting events established in 1896;Sporting competitions;Sports festivals|Olympics
Galileo Galilei|person|1564 births;1642 deaths;Italian astronomers;Italian physicists;Scientific Revolution;University of Padua faculty|Galileo
Venice|place|Car-free zones;Cities and towns in Veneto;Islands of the Venetian Lagoon;Maritime republics;World Heritage Sites in Italy|
Vincent van Gogh|person|1853 births;1890 deaths;Dutch Post-Impressionist painters;Dutch expatriates in France;Artists who died by suicide;Modern artists|Van Gogh
DNA|thing|Biopolymers;Genetics;Molecular biology;Nucleic acids;Biological information storage|Deoxyribonucleic acid
Petra|place|Archaeological sites in Jordan;Former capitals;Nabataean architecture;Rock-cut architecture;World Heritage Sites in Jordan|
Martin Luther King Jr.|person|1929 births;1968 deaths;African-American Baptist ministers;American civil rights leaders;Nobel Peace Prize laureates;Assassinated activists|Martin Luther King;MLK
Nintendo|thing|1889 establishments in Japan;Japanese video game companies;Kyoto-based companies;Toy companies;Video game publishers|Nintendo Co Ltd
Northern lights|thing|Atmospheric optical phenomena;Geomagnetic storms;Polar regions of Earth;Space weather;Upper atmosphere|Aurora borealis;Aurora
Malala Yousafzai|person|1997 births;Children's rights activists;Nobel Peace Prize laureates;Pakistani women activists;Survivors of shootings|Malala
The Lord of the Rings|thing|1950s fantasy novels;British fantasy novels;Epic fantasy;High fantasy;Novels by J. R. R. Tolkien|LOTR
Pompeii|place|Ancient Roman towns;Archaeological sites in Campania;Cities destroyed by volcanic eruptions;Roman sites in Italy;World Heritage Sites in Italy|
Michael Jackson|person|1958 births;2009 deaths;American male pop singers;American dancers;Grammy Award winners;Motown artists|King of Pop
Jupiter|thing|Gas giants;Outer planets of the Solar System;Planets of the Solar System;Roman deities in astronomy;Astronomical objects known since antiquity|
Bermuda Triangle|place|Atlantic Ocean;Geography of Bermuda;Geography of Florida;Maritime folklore;Urban legends|Devil's Triangle
Alexander Fleming|person|1881 births;1955 deaths;British microbiologists;Nobel laureates in Physiology or Medicine;Scottish physicians;Discoverers of antibiotics|
The Matrix|thing|1999 science fiction films;American action films;Cyberpunk films;Films about simulated reality;Films directed by the Wachowskis|Matrix
Burj Khalifa|place|2010 establishments in the United Arab Emirates;Buildings and structures in Dubai;Skyscrapers over 350 meters;Tourist attractions in Dubai;World's tallest buildings|
Alan Turing|person|1912 births;1954 deaths;British cryptographers;English computer scientists;LGBTQ mathematicians;People associated with Bletchley Park|Alan Mathison Turing;Turing
Giant panda|thing|Bears;Endemic fauna of China;Mammals of Asia;Vulnerable animals;Wildlife conservation in China|Panda
Colosseum|place|1st-century Roman architecture;Amphitheatres in Rome;Ancient Roman buildings and structures;Tourist attractions in Rome;World Heritage Sites in Italy|Flavian Amphitheatre
Yuri Gagarin|person|1934 births;1968 deaths;Cosmonauts;Heroes of the Soviet Union;Human spaceflight pioneers;Soviet Air Force officers|
French Revolution|thing|1789 in France;18th-century revolutions;European political history;History of republicanism;Social revolutions|
Mount Fuji|place|Active volcanoes;Mountains of Japan;Sacred mountains;Stratovolcanoes;World Heritage Sites in Japan|Fujisan;Fuji
Taylor Swift|person|1989 births;American country singer-songwriters;American pop singers;Grammy Album of the Year winners;Musicians from Pennsylvania|
Periodic table|thing|Chemical element classification;Chemistry education;History of chemistry;Russian inventions;Scientific charts|Periodic table of elements
Victoria Falls|place|Border waterfalls;Ramsar sites in Africa;Tourist attractions in Zambia;Waterfalls of Zimbabwe;World Heritage Sites in Africa|Mosi-oa-Tunya
Mahatma Gandhi|person|1869 births;1948 deaths;Indian independence activists;Indian pacifists;Nonviolence advocates;Assassinated Indian politicians|Mohandas Gandhi;Mohandas Karamchand Gandhi;Gandhi
Pride and Prejudice|thing|1813 British novels;British romance novels;Novels by Jane Austen;Novels set in England;Novels adapted into television programs|
International Space Station|thing|1998 in spaceflight;Crewed spacecraft;Low Earth orbit;Orbital laboratories;Space stations;International scientific cooperation|ISS
Beyoncé|person|1981 births;American female pop singers;American R&B singers;Grammy Award winners;Musicians from Houston|Beyonce;Beyoncé Knowles;Beyonce Knowles
Krakatoa|place|Active volcanoes of Indonesia;Calderas;Geography of the Sunda Strait;Volcanic islands;Volcanoes of Lampung|Krakatau
The Scream|thing|1890s paintings;Artworks by Edvard Munch;Expressionist paintings;National Gallery Oslo;Paintings depicting emotion|
Steve Jobs|person|1955 births;2011 deaths;American technology chief executives;Apple Inc. people;Personal computing pioneers;American inventors|Steven Paul Jobs
Python (programming language)|thing|1991 software;Dutch inventions;High-level programming languages;Object-oriented programming languages;Open-source software;Programming languages|Python;Python programming language
Amazon rainforest|place|Ecoregions of South America;Rainforests;Tropical and subtropical moist broadleaf forests;Biodiversity hotspots;South American geography|Amazon jungle;Amazonia
Muhammad Ali|person|1942 births;2016 deaths;African-American boxers;American anti-war activists;Olympic gold medalists in boxing;World heavyweight boxing champions|Cassius Clay;Cassius Marcellus Clay Jr
Suez Canal|place|1869 establishments in Egypt;Artificial waterways;Canals in Egypt;International waterways;Mediterranean Sea;Red Sea|
Rubik's Cube|thing|1974 introductions;3D combination puzzles;Hungarian inventions;Mechanical puzzles;Toys of the 1970s|Rubiks Cube;Magic Cube
Audrey Hepburn|person|1929 births;1993 deaths;Academy Award winners;British actresses;Dutch people of British descent;UNICEF goodwill ambassadors|
Aurora|thing|Atmospheric optical phenomena;Geomagnetic storms;Ionosphere;Polar regions of Earth;Solar phenomena|Polar lights
Louvre|place|Art museums and galleries in Paris;Former royal residences;Historic monuments in France;Museums established in the 18th century;Tourist attractions in Paris|Louvre Museum;Musée du Louvre
Edvard Munch|person|1863 births;1944 deaths;Expressionist artists;Norwegian painters;Printmakers;Symbolist artists|
Wimbledon Championships|thing|1877 establishments in England;Annual sporting events in London;Grass court tennis tournaments;Grand Slam tennis tournaments;Tennis tournaments in England|Wimbledon
Isaac Asimov|person|1920 births;1992 deaths;American science fiction writers;Biochemistry academics;Hugo Award-winning writers;Russian emigrants to the United States|
Dead Sea|place|Endorheic lakes of Asia;Geography of Jordan;Lakes of Israel;Lowest points of countries;Saline lakes|
Apollo 11|thing|1969 in spaceflight;Apollo program missions;Crewed missions to the Moon;Lunar landing missions;NASA space missions|
Katherine Johnson|person|1918 births;2020 deaths;African-American mathematicians;American women mathematicians;NASA people;Women in computing|Katherine Coleman Goble Johnson
Big Ben|place|1859 establishments in England;Bell towers;Clock towers in London;Grade I listed buildings in Westminster;Tourist attractions in London|Elizabeth Tower
Jazz|thing|African-American music;American music genres;Improvisation in music;Music of New Orleans;20th-century music genres|
Pablo Picasso|person|1881 births;1973 deaths;Cubist artists;Spanish expatriates in France;Spanish modern painters;Sculptors|Picasso
Statue of Liberty|place|1886 establishments in New York;Colossal statues;French-American history;National monuments of the United States;World Heritage Sites in the United States|Liberty Enlightening the World
Black Panther (film)|thing|2018 superhero films;Afrofuturist films;American action films;Marvel Cinematic Universe films;Films set in fictional countries|Black Panther
Rosalind Franklin|person|1920 births;1958 deaths;British crystallographers;English chemists;King's College London people;Women molecular biologists|
Pluto|thing|Dwarf planets;Kuiper belt objects;Minor planets;Trans-Neptunian objects;Astronomical objects discovered in 1930|
Sagrada Família|place|Art Nouveau architecture in Spain;Churches in Barcelona;Roman Catholic basilicas;Unfinished buildings and structures;Works by Antoni Gaudí|Sagrada Familia;Basílica de la Sagrada Família
Nefertiti|person|14th-century BC Egyptian women;Ancient Egyptian queens consort;Amarna Period;Eighteenth Dynasty of Egypt;People of the New Kingdom|
The Great Wave off Kanagawa|thing|1830s works;Japanese woodblock prints;Maritime art;Works by Hokusai;19th-century Japanese art|Great Wave;The Great Wave
Hagia Sophia|place|6th-century churches;Byzantine architecture;Historic mosques in Istanbul;Religious buildings and structures in Istanbul;World Heritage Sites in Turkey|Ayasofya
Stephen Hawking|person|1942 births;2018 deaths;British cosmologists;English theoretical physicists;Fellows of the Royal Society;University of Cambridge academics|Stephen William Hawking
The Lion King|thing|1994 animated films;American animated musical films;Disney animated films;Films about lions;Films set in Africa|Lion King
Aconcagua|place|Andes mountain range;Highest points of countries;Mountains of Argentina;Seven Summits;Six-thousanders|
Hayao Miyazaki|person|1941 births;Anime directors;Japanese animators;Japanese film directors;Studio Ghibli people|
Volcano|thing|Geological landforms;Igneous geology;Natural hazards;Plate tectonics;Volcanology|Volcanoes
Salvador Dalí|person|1904 births;1989 deaths;Spanish surrealist artists;Spanish painters;Artists from Catalonia;20th-century artists|Salvador Dali
Bali|place|Islands of Indonesia;Lesser Sunda Islands;Provinces of Indonesia;Tourist attractions in Indonesia;Hinduism in Indonesia|
Voyager 1|thing|1977 in spaceflight;NASA space probes;Interstellar missions;Space probes launched in the 1970s;Uncrewed spacecraft|
Dolly the sheep|thing|1996 animal births;2003 animal deaths;Animal cloning;Famous sheep;Genetic engineering|Dolly
Simone Biles|person|1997 births;American female artistic gymnasts;Olympic gold medalists for the United States in gymnastics;World champion gymnasts;Presidential Medal of Freedom recipients|
Shinkansen|thing|1964 establishments in Japan;High-speed rail in Asia;Japanese inventions;Passenger rail transport in Japan;Railway services introduced in 1964|Bullet train
Fibonacci sequence|thing|Integer sequences;Mathematical patterns;Number theory;Recurrence relations;Recreational mathematics|Fibonacci numbers
Fela Kuti|person|1938 births;1997 deaths;Nigerian musicians;Afrobeat musicians;Political activists;Saxophonists|
Kilimanjaro|place|Seven Summits;Mountains of Tanzania;Stratovolcanoes of Africa;National parks of Tanzania;Volcanoes of Tanzania|Mount Kilimanjaro
The Simpsons|thing|1989 American television series debuts;American animated sitcoms;Fox Broadcasting Company original programming;Satirical television series;Television families|Simpsons
Johann Sebastian Bach|person|1685 births;1750 deaths;Baroque composers;German organists;German Lutheran musicians;Composers for keyboard|Bach;J S Bach;J.S. Bach
`.trim();

const ARTICLES = rawArticles.split('\n').map((line, index) => {
  const [title, kind, categories, aliases = ''] = line.split('|');
  return {
    id: index + 1,
    title: title.trim(),
    kind,
    categories: categories.split(';').map((c) => c.trim()).sort((a, b) => a.localeCompare(b)),
    aliases: aliases.split(';').map((a) => a.trim()).filter(Boolean),
  };
});
import './UrbanRedactle.css';

const STORAGE_KEY = 'category-fishing-unlimited-v1';
const MAX_GUESSES = 3;
const categoryBlocklist = /^(?:articles? (?:with|containing|needing|lacking)|all (?:articles|stub articles)|cs1 |webarchive|wikipedia |pages? (?:with|using)|short description|use (?:mdy|dmy) dates|commons category|wikidata|coordinates on wikidata|good articles$|featured articles$|births$|deaths$)/i;
const irrelevantWords = new Set(['a', 'an', 'the', 'and', 'of', 'in', 'on', 'at', 'to', 'for', 'from', 'by', 'with', 'or', 'as']);
const ambiguousSurnames = new Set(['williams', 'jackson', 'king', 'bach']);

const count = { played: 0, correct: 0, close: 0, missed: 0, skipped: 0, score: 0, currentStreak: 0, bestStreak: 0 };
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

function cleanTitle(s) {
  return String(s ?? '').replace(/\s*\([^)]*\)/g, '').trim();
}

function normalize(s) {
  return cleanTitle(s)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:the|an|a)\s+/, '');
}

function allowedAnswers(article, liveAliases = []) {
  const options = [article.title, ...article.aliases, ...liveAliases];
  if (article.kind === 'person') {
    const surname = cleanTitle(article.title).split(/\s+/).at(-1);
    if (surname && !ambiguousSurnames.has(normalize(surname))) options.push(surname);
  }
  return [...new Set(options.map(normalize).filter(Boolean))];
}

function romanNumeralsAndDigits(str) {
  const digits = String(str).match(/\d+/g) || [];
  const roman = String(str).match(/\b(?:[IVXLCDM]{2,}|[IVX])\b/g) || [];
  return [...digits, ...roman].sort().join('|');
}

// Optimal string alignment distance: insert, delete, substitute or swap neighbours.
function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[a.length][b.length];
}

function isNearAnswer(guess, article, aliases) {
  const normalized = normalize(guess);
  const limit = normalized.length < 4 ? 0 : normalized.length < 8 ? 1 : normalized.length < 12 ? 2 : normalized.length < 18 ? 3 : 4;
  if (!limit) return false;
  return allowedAnswers(article, aliases).some((answer) =>
    // Numerals must be exactly right, even if an edit distance is small.
    romanNumeralsAndDigits(guess) === romanNumeralsAndDigits(article.title) &&
    Math.abs(normalized.length - answer.length) <= limit && editDistance(normalized, answer) <= limit
  );
}

function filterCategories(categories, title) {
  const titleWords = new Set(normalize(title).split(' ').filter((w) => w.length > 2 && !irrelevantWords.has(w)));
  const deduped = new Set();
  return categories
    .map((category) => category.replace(/^Category:/, '').trim())
    .filter((category) => {
      if (!category || categoryBlocklist.test(category)) return false;
      const text = normalize(category);
      if (!text || [...titleWords].some((word) => text.split(' ').includes(word))) return false;
      if (text === normalize(title) || text === `${normalize(title)}s`) return false;
      const key = category.toLowerCase();
      if (deduped.has(key)) return false;
      deduped.add(key);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));
}

function firstPartyState() {
  return {
    view: 'home',
    current: null,
    queue: shuffle(ARTICLES.map((a) => a.id)),
    session: { ...count },
    lifetime: { ...count },
    history: [],
    sessionOutcomes: [],
    questionNumber: 0,
  };
}

function loadState() {
  const defaults = firstPartyState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return defaults;
    const ids = new Set(ARTICLES.map((a) => a.id));
    return {
      ...defaults,
      view: 'home',
      current: ids.has(saved.current?.id) ? saved.current : null,
      queue: Array.isArray(saved.queue) ? saved.queue.filter((id) => ids.has(id)) : defaults.queue,
      lifetime: { ...count, ...saved.lifetime },
      history: Array.isArray(saved.history) ? saved.history.slice(-250) : [],
      // Session count is deliberately reset on full browser reload; overall stats stay saved.
    };
  } catch {
    return defaults;
  }
}

function takeQuestion(previous) {
  let queue = [...previous.queue];
  if (queue.length === 0) {
    queue = shuffle(ARTICLES.map((a) => a.id));
    if (queue.length > 1 && queue[0] === previous.current?.id) {
      [queue[0], queue[1]] = [queue[1], queue[0]];
    }
  }
  const id = queue.shift();
  return {
    ...previous,
    view: 'game',
    queue,
    questionNumber: previous.questionNumber + 1,
    current: { id, guesses: [], status: 'playing', score: 0, pendingDym: false },
  };
}

function scoreRound(prev, status, guesses, points) {
  const key = status === 'correct' ? 'correct' : status === 'skipped' ? 'skipped' : status === 'close' ? 'close' : 'missed';
  const tally = (base) => {
    const streak = status === 'correct' ? base.currentStreak + 1 : 0;
    return {
      ...base,
      played: base.played + 1,
      [key]: base[key] + 1,
      score: base.score + points,
      currentStreak: streak,
      bestStreak: Math.max(base.bestStreak, streak),
    };
  };
  const record = {
    id: prev.current.id,
    status,
    score: points,
    attempts: guesses.length,
    date: new Date().toISOString(),
  };
  return {
    ...prev,
    current: { ...prev.current, status, guesses, score: points, pendingDym: false },
    session: tally(prev.session),
    lifetime: tally(prev.lifetime),
    history: [...prev.history, record].slice(-250),
    sessionOutcomes: [...prev.sessionOutcomes, status],
  };
}

function adjustClose(prev) {
  if (!prev.current || !['missed', 'close'].includes(prev.current.status)) return prev;
  const setting = prev.current.status === 'missed';
  const newStatus = setting ? 'close' : 'missed';
  const fromStatus = setting ? 'missed' : 'close';
  const shift = setting ? 0.5 : -0.5;
  const updateTally = (t) => ({ ...t, [fromStatus]: Math.max(0, t[fromStatus] - 1), [newStatus]: t[newStatus] + 1, score: t.score + shift });
  return {
    ...prev,
    current: { ...prev.current, status: newStatus, score: setting ? 0.5 : 0 },
    session: updateTally(prev.session),
    lifetime: updateTally(prev.lifetime),
    history: prev.history.map((entry, i) => i === prev.history.length - 1 ? { ...entry, status: newStatus, score: setting ? 0.5 : 0 } : entry),
    sessionOutcomes: prev.sessionOutcomes.map((s, i) => i === prev.sessionOutcomes.length - 1 ? newStatus : s),
  };
}

async function fetchWikipediaExtras(article, signal) {
  const pageUrl = new URL('https://en.wikipedia.org/w/api.php');
  Object.entries({ action: 'query', format: 'json', origin: '*', prop: 'categories|redirects', cllimit: 'max', rdlimit: 'max', titles: article.title }).forEach(([key, val]) => pageUrl.searchParams.set(key, val));
  const result = await fetch(pageUrl.toString(), { signal });
  if (!result.ok) throw new Error(`Wikipedia API returned ${result.status}`);
  const json = await result.json();
  const page = Object.values(json.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) throw new Error('Article not found');
  const categories = filterCategories((page.categories ?? []).map((c) => c.title), article.title);
  const aliases = (page.redirects ?? []).map((r) => r.title);
  return { categories: categories.length >= 4 ? categories.slice(0, 12) : null, aliases };
}

async function fetchWikidataAliases(article, signal) {
  const url = new URL('https://www.wikidata.org/w/api.php');
  Object.entries({ action: 'wbgetentities', format: 'json', origin: '*', sites: 'enwiki', titles: article.title, props: 'aliases', languages: 'en' })
    .forEach(([key, value]) => url.searchParams.set(key, value));
  const result = await fetch(url.toString(), { signal });
  if (!result.ok) throw new Error('Wikidata aliases unavailable');
  const json = await result.json();
  const entity = Object.values(json.entities ?? {})[0];
  return (entity?.aliases?.en ?? []).map((a) => a.value).filter(Boolean);
}

const formatScore = (n) => Number(n ?? 0).toFixed(1).replace(/\.0$/, '');
const wikipediaUrl = (article) => `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replace(/ /g, '_'))}`;
const roundIcon = (s) => s === 'correct' ? '🟩' : s === 'close' ? '🟨' : s === 'skipped' ? '⬜' : '🟥';

export default function App() {
  const [state, setState] = useState(loadState);
  const [input, setInput] = useState('');
  const [live, setLive] = useState({ id: null, categories: null, aliases: [], loading: false, error: false });
  const [hintOpen, setHintOpen] = useState(false);
  const [toast, setToast] = useState('');
  const inputRef = useRef(null);
  const roundRef = useRef({ id: null, guesses: 0 });
  const activeArticle = ARTICLES.find((a) => a.id === state.current?.id);
  const currentStatus = state.current?.status;
  const attempts = state.current?.guesses.length ?? 0;
  const gameDone = Boolean(currentStatus && currentStatus !== 'playing');
  roundRef.current = { id: activeArticle?.id, guesses: attempts };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* Storage disabled/full: play still works. */ }
  }, [state]);

  useEffect(() => {
    if (!activeArticle) return;
    const controller = new AbortController();
    setLive({ id: activeArticle.id, categories: null, aliases: [], loading: true, error: false });
    const timeout = setTimeout(() => controller.abort(), 4500);
    Promise.allSettled([
      fetchWikipediaExtras(activeArticle, controller.signal),
      fetchWikidataAliases(activeArticle, controller.signal),
    ]).then(([wikipedia, wikidata]) => {
      if (controller.signal.aborted) return;
      const fetched = wikipedia.status === 'fulfilled' ? wikipedia.value : { categories: null, aliases: [] };
      const wikiAliases = wikidata.status === 'fulfilled' ? wikidata.value : [];
      const canReplaceClues = roundRef.current.id === activeArticle.id && roundRef.current.guesses === 0;
      setLive({
        id: activeArticle.id,
        categories: canReplaceClues ? fetched.categories : null,
        aliases: [...fetched.aliases, ...wikiAliases],
        loading: false,
        error: wikipedia.status !== 'fulfilled',
      });
    }).finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [activeArticle?.id]);

  useEffect(() => {
    if (state.view === 'game' && !gameDone && !state.current?.pendingDym) inputRef.current?.focus();
  }, [state.view, state.current?.id, gameDone, state.current?.pendingDym]);

  const categories = useMemo(() => {
    if (!activeArticle) return [];
    return live.id === activeArticle.id && live.categories
      ? live.categories : filterCategories(activeArticle.categories, activeArticle.title);
  }, [activeArticle, live]);

  function navigate(view) { setState((s) => ({ ...s, view })); window.scrollTo?.({ top: 0, behavior: 'smooth' }); }

  function startGame() {
    setInput(''); setHintOpen(false);
    setState((s) => s.current?.status === 'playing' ? { ...s, view: 'game' } : takeQuestion(s));
  }

  function nextQuestion() {
    setInput(''); setHintOpen(false);
    setState((s) => takeQuestion(s));
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }

  function guess(event) {
    event?.preventDefault();
    const value = input.trim();
    if (!value || !activeArticle || currentStatus !== 'playing' || state.current.pendingDym) return;
    const cleaned = normalize(value);
    if (!cleaned) return;
    const aliases = live.id === activeArticle.id ? live.aliases : [];
    const validAnswers = allowedAnswers(activeArticle, aliases);
    const correct = validAnswers.includes(cleaned);
    const near = !correct && isNearAnswer(value, activeArticle, aliases);
    const guesses = [...state.current.guesses, { text: value, result: correct ? 'correct' : near ? 'near' : 'wrong' }];
    setState((s) => {
      if (s.current?.status !== 'playing' || s.current.pendingDym) return s;
      if (correct) return scoreRound(s, 'correct', guesses, 1);
      if (near) return { ...s, current: { ...s.current, guesses, pendingDym: true } };
      if (guesses.length >= MAX_GUESSES) return scoreRound(s, 'missed', guesses, 0);
      return { ...s, current: { ...s.current, guesses } };
    });
    setInput('');
  }

  function confirmDidYouMean(yes) {
    setState((s) => {
      if (!s.current?.pendingDym || s.current?.status !== 'playing') return s;
      const revised = s.current.guesses.map((g, i) => i === s.current.guesses.length - 1 ? { ...g, result: yes ? 'correct' : 'wrong' } : g);
      if (yes) return scoreRound(s, 'correct', revised, 1);
      if (revised.length >= MAX_GUESSES) return scoreRound(s, 'missed', revised, 0);
      return { ...s, current: { ...s.current, guesses: revised, pendingDym: false } };
    });
  }

  function skipQuestion() {
    setState((s) => s.current?.status === 'playing' ? scoreRound(s, 'skipped', s.current.guesses, 0) : s);
    setInput('');
  }

  async function copy(text, label = 'Copied!') {
    try { await navigator.clipboard.writeText(text); setToast(label); }
    catch { setToast('Clipboard unavailable. Try a browser with HTTPS.'); }
    setTimeout(() => setToast(''), 3500);
  }

  function shareResult() {
    const last = state.sessionOutcomes.slice(-40).map(roundIcon).join('');
    copy(`Category Fishing 🐈🐟\n${formatScore(state.session.score)} / ${state.session.played} points · unlimited mode\n${last}\n${window.location.origin}`, 'Score copied!');
  }

  function copyReport() {
    if (!activeArticle) return;
    copy(`Question report — ${activeArticle.title}\n${wikipediaUrl(activeArticle)}\nCategories:\n${categories.join('\n')}\nReason: [describe the issue]`, 'Question details copied. Add your feedback and send it to the game maintainer.');
  }

  const guessesLeft = MAX_GUESSES - attempts;

  return (
    <div className="site-shell">
      <header className="site-header">
        <button type="button" className="brand" onClick={() => navigate('home')} aria-label="Category Fishing home">
          <span className="brand-symbol" aria-hidden="true">🐈<span>🐟</span></span>
          <span>category<span className="brand-accent">fishing</span></span>
        </button>
        <nav className="main-nav" aria-label="Primary">
          <button className={state.view === 'home' ? 'active' : ''} onClick={() => navigate('home')}>Home</button>
          <button className={state.view === 'help' ? 'active' : ''} onClick={() => navigate('help')}>How to play</button>
          <button className={state.view === 'history' ? 'active' : ''} onClick={() => navigate('history')}>History</button>
          <button className={state.view === 'stats' ? 'active' : ''} onClick={() => navigate('stats')}>Stats</button>
        </nav>
      </header>

      <main className="main-wrap">
        {state.view === 'home' && (
          <div className="home-view">
            <section className="hero">
              <div className="hero-eyebrow">THE WIKIPEDIA CATEGORY GUESSING GAME</div>
              <div className="hero-art" aria-hidden="true"><span>🐈</span><span>🐟</span><i>✦</i></div>
              <h1>Can you guess the <em>article?</em></h1>
              <p className="hero-subtitle">Every Wikipedia article belongs to categories. Follow the clues and fish for the answer.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={startGame}>{state.current?.status === 'playing' ? 'Continue playing' : 'Start playing'} <span aria-hidden="true">→</span></button>
                <button className="secondary-button" onClick={() => navigate('help')}>How to play</button>
              </div>
              <p className="hero-note"><strong>3 guesses per question.</strong> No daily limit. Keep playing as long as you like.</p>
            </section>
            <div className="feature-grid">
              <div className="feature"><span>📚</span><h3>Think in categories</h3><p>Uncover people, places, and things from Wikipedia-style category clues.</p></div>
              <div className="feature"><span>🎯</span><h3>Three tries to win</h3><p>Get it right in any of three guesses, or reveal the article and learn something new.</p></div>
              <div className="feature"><span>♾️</span><h3>Play without limits</h3><p>Questions reshuffle automatically. Track your score across as many games as you want.</p></div>
            </div>
            <div className="home-bottom">{state.lifetime.played > 0 ? <>You've played <b>{state.lifetime.played}</b> articles and scored <b>{formatScore(state.lifetime.score)}</b> points so far.</> : 'Ready for a new discovery?'}</div>
          </div>
        )}

        {state.view === 'game' && activeArticle && (
          <div className="game-view">
            <div className="game-topline"><button className="back-link" onClick={() => navigate('home')}>← Home</button><span className="unlimited-pill">∞ Unlimited play</span></div>
            <section className="score-strip" aria-label="Game progress">
              <div><small>YOUR SESSION</small><strong>{formatScore(state.session.score)} <span>/ {state.session.played} pts</span></strong></div>
              <div><small>ARTICLES PLAYED</small><strong>{state.session.played}</strong></div>
              <div><small>CURRENT STREAK</small><strong>{state.session.currentStreak} <span>🔥</span></strong></div>
              <button className="small-link" onClick={() => navigate('stats')}>View stats →</button>
            </section>

            <section className="question-card">
              <div className="question-heading">
                <div><span className="kicker">WIKIPEDIA ARTICLE <span>#{state.questionNumber || state.lifetime.played + 1}</span></span><h1>What article is this?</h1></div>
                <div className="attempt-box"><div className="attempt-dots" aria-label={`${attempts} of 3 guesses used`}>{[0, 1, 2].map((n) => <span key={n} className={n < attempts ? 'spent' : ''} />)}</div><span>{gameDone ? 'Question complete' : `${guessesLeft} ${guessesLeft === 1 ? 'guess' : 'guesses'} left`}</span></div>
              </div>

              <div className="clues-area"><div className="clues-title"><span className="clues-icon">≡</span><h2>Wikipedia categories</h2><span className="clues-count">{categories.length} clues</span></div><p className="clues-intro">This article appears in the following categories:</p><ul className="category-list">{categories.map((cat) => <li key={cat}><span className="category-bullet">›</span>{cat}</li>)}</ul><p className="source-note">{live.id === activeArticle.id && live.categories ? 'Live categories retrieved from Wikipedia.' : live.loading ? 'Showing curated clues; checking Wikipedia for live categories…' : 'Curated offline clues. Live Wikipedia categories are used when available.'}</p></div>

              {!gameDone ? (
                <>
                  {state.current.pendingDym ? (
                    <div className="dym-panel" role="alert"><span className="dym-tag">DID YOU MEAN?</span><h3>{cleanTitle(activeArticle.title)}?</h3><p>Was this the answer you were trying to enter? This guess already counts toward your three attempts.</p><div className="button-row"><button className="primary-button" onClick={() => confirmDidYouMean(true)}>Yes, that's it</button><button className="secondary-button" onClick={() => confirmDidYouMean(false)}>No, keep playing</button></div></div>
                  ) : (
                    <form className="guess-form" onSubmit={guess}><label htmlFor="answer-input">Your guess</label><div className="input-row"><input ref={inputRef} id="answer-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter the Wikipedia article title…" type="text" maxLength={160} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-describedby="answer-hint" /><button className="primary-button" type="submit" disabled={!input.trim()}>Guess <span aria-hidden="true">→</span></button></div><div className="input-foot"><span id="answer-hint">Capitalisation, accents, and punctuation don't matter.</span><button type="button" className="link-button" onClick={() => setHintOpen((v) => !v)}>{hintOpen ? 'Hide title length' : 'Show title length'}</button></div>{hintOpen && <div className="length-hint">Title length: {cleanTitle(activeArticle.title).split(/\s+/).map((w) => `${w.length} letters`).join(' · ')}</div>}</form>
                  )}
                  <div className="guesses-list" aria-label="Previous guesses">{state.current.guesses.length > 0 && <h3>Previous guesses</h3>}{state.current.guesses.map((g, i) => <div className="guess-item" key={`${g.text}-${i}`}><span>#{i + 1}</span><strong>{g.text}</strong><span className="guess-icon">{g.result === 'correct' ? '✓' : g.result === 'near' ? '?' : '×'}</span></div>)}</div>
                  {!state.current.pendingDym && <button className="skip-button" onClick={skipQuestion}>Skip question and reveal answer →</button>}
                </>
              ) : (
                <div className={`result-panel ${currentStatus === 'correct' ? 'result-correct' : currentStatus === 'close' ? 'result-close' : 'result-missed'}`} role="status"><div className="result-label">{currentStatus === 'correct' ? '🎉 CORRECT!' : currentStatus === 'close' ? '🟨 CLOSE ENOUGH!' : currentStatus === 'skipped' ? '↪ QUESTION SKIPPED' : '🐟 OUT OF GUESSES'}</div><h2>{cleanTitle(activeArticle.title)}</h2><p>{currentStatus === 'correct' ? `You got it in ${attempts} ${attempts === 1 ? 'guess' : 'guesses'}! +1 point.` : currentStatus === 'close' ? 'You awarded yourself half a point.' : "There's always something new to discover."}</p><div className="result-actions"><a href={wikipediaUrl(activeArticle)} target="_blank" rel="noopener noreferrer" className="wiki-button">Read on Wikipedia ↗</a>{['missed', 'close'].includes(currentStatus) && <button className="close-enough-button" onClick={() => setState(adjustClose)}>{currentStatus === 'close' ? 'Undo close enough' : 'Close enough (+½ point)'}</button>}</div><button className="primary-button next-button" onClick={nextQuestion}>Next question <span aria-hidden="true">→</span></button></div>
              )}
            </section>
            <div className="game-footer-row"><button className="link-button" onClick={copyReport}>Report this question</button><button className="link-button" onClick={shareResult}>Copy session score 🐈🐟</button></div>
          </div>
        )}

        {state.view === 'help' && (
          <section className="content-page"><div className="page-eyebrow">THE RULES</div><h1>How to play</h1><p className="lead">On Wikipedia, each article belongs to categories. Your job is to guess the article's title from those categories.</p><div className="step-list"><div><b>01</b><section><h2>Read the clues</h2><p>Each question shows categories associated with a notable person, place, or thing. Categories are listed alphabetically and obvious title-matching category names are filtered out.</p></section></div><div><b>02</b><section><h2>Make up to three guesses</h2><p>Enter the article title. The game ignores capitalisation, accents, punctuation, and anything in brackets. Common aliases, redirects where available, and unambiguous surnames can count.</p></section></div><div><b>03</b><section><h2>Reveal and move on</h2><p>A correct answer awards one point. After your third incorrect guess the answer is revealed automatically. You can skip early or mark a failed guess “Close enough” for half a point.</p></section></div><div><b>04</b><section><h2>Play as long as you like</h2><p>Unlike the original 10-article daily game, this version has no daily limit. The included curated question pool reshuffles once you have seen all its articles.</p></section></div></div><div className="rule-callout"><strong>Did You Mean?</strong><p>If your guess is a few letters away from the answer, you'll be asked to confirm what you meant. Numbers must match exactly. That original guess counts as one of your three attempts.</p></div><button className="primary-button" onClick={startGame}>Let's play →</button></section>
        )}

        {state.view === 'stats' && (
          <section className="content-page"><div className="page-eyebrow">YOUR PROGRESS</div><h1>Stats</h1><p className="lead">Your lifetime results are saved in this browser. There is no daily question limit.</p><div className="stats-grid"><div><span>Articles played</span><strong>{state.lifetime.played}</strong></div><div><span>Total points</span><strong>{formatScore(state.lifetime.score)}</strong></div><div><span>Correct answers</span><strong>{state.lifetime.correct}</strong></div><div><span>Longest streak</span><strong>{state.lifetime.bestStreak}</strong></div></div><div className="stats-details"><h2>Results breakdown</h2><div><span>🟩 Correct</span><b>{state.lifetime.correct}</b></div><div><span>🟨 Close enough</span><b>{state.lifetime.close}</b></div><div><span>🟥 Revealed after 3 guesses</span><b>{state.lifetime.missed}</b></div><div><span>⬜ Skipped</span><b>{state.lifetime.skipped}</b></div></div><div className="button-row stats-buttons"><button className="primary-button" onClick={startGame}>Play more →</button><button className="secondary-button" onClick={shareResult}>Copy session score</button></div></section>
        )}

        {state.view === 'history' && (
          <section className="content-page"><div className="page-eyebrow">YOUR PLAYED ARTICLES</div><h1>History</h1><p className="lead">The 250 most recently completed questions are kept in this browser so you can revisit discoveries.</p>{state.history.length === 0 ? <div className="empty-state">No articles yet. Start playing to build your history.<div><button className="primary-button" onClick={startGame}>Start playing →</button></div></div> : <div className="history-list">{[...state.history].reverse().map((entry, i) => { const article = ARTICLES.find((a) => a.id === entry.id); if (!article) return null; return <div className="history-entry" key={`${entry.id}-${entry.date}-${i}`}><span className="history-icon">{roundIcon(entry.status)}</span><div><strong>{cleanTitle(article.title)}</strong><small>{entry.attempts} {entry.attempts === 1 ? 'guess' : 'guesses'} · {formatScore(entry.score)} pt</small></div><a href={wikipediaUrl(article)} target="_blank" rel="noopener noreferrer" aria-label={`Read ${article.title} on Wikipedia`}>Wikipedia ↗</a></div>; })}</div>}<button className="secondary-button history-play" onClick={startGame}>Play more →</button></section>
        )}
      </main>
      <footer className="site-footer"><div><b>🐈🐟 Category Fishing</b> · a Wikipedia-inspired guessing game</div><div>Article content and categories: <a href="https://en.wikipedia.org/" target="_blank" rel="noopener noreferrer">Wikipedia</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a> · Not affiliated with catfishing.net</div></footer>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
