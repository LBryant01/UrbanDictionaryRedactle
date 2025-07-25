import React, { useState, useEffect } from "react";
import "./UrbanRedactle.css";

const API_URL = "https://unofficialurbandictionaryapi.com/api";

// Redacts and reveals meaning text with individual word support
const RedactMeaningText = (
  text,
  guessedWords,
  targetWord,
  revealEvery = 6,
  revealAll = false
) => {
  const targetWords = targetWord.toLowerCase().split(" ");

  return text.split(" ").map((word, i) => {
    const cleaned = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const isTarget = targetWords.includes(cleaned);
    // Reveal if guessed, forced, or revealEvery-th word
    const isRevealed =
      revealAll || guessedWords.includes(cleaned) || i % revealEvery === 0;

    const redactedLength = cleaned.length;

    return (
      <span
        key={i}
        className={isRevealed ? "revealed" : "redacted"}
        style={{ marginRight: "4px", display: "inline-block" }}
      >
        {isRevealed ? word : "█".repeat(redactedLength || 4)}
      </span>
    );
  });
};

// Redacts and reveals example text with individual word support
const RedactExampleText = (
  text,
  targetWord,
  revealAll = false,
  guessedWords = []
) => {
  const targetWords = targetWord.toLowerCase().split(" ");

  return text.split(" ").map((word, i) => {
    const cleaned = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const isTarget = targetWords.includes(cleaned);
    // Reveal if not target OR (if target and guessed/revealAll)
    const isRevealed = revealAll || !isTarget || guessedWords.includes(cleaned);

    const redactedLength = cleaned.length;

    return (
      <span
        key={i}
        className={isRevealed ? "revealed" : "redacted"}
        style={{ marginRight: "4px", display: "inline-block" }}
      >
        {isRevealed ? word : "█".repeat(redactedLength || 4)}
      </span>
    );
  });
};

const countOccurrences = (text, guessedWords) => {
  const words = text.toLowerCase().match(/\b[a-zA-Z]+\b/g) || [];
  const freq = {};
  guessedWords.forEach((guess) => {
    freq[guess] = words.filter((w) => w === guess).length;
  });
  return freq;
};

// Hit count helper function
function getHitCount(guessedWords, definitions) {
  const text = definitions
    .map((def) => `${def.meaning} ${def.example}`)
    .join(" ")
    .toLowerCase();

  let hits = 0;
  guessedWords.forEach((guess) => {
    const regex = new RegExp(`\\b${guess}\\b`, "i");
    if (regex.test(text)) {
      hits += 1;
    }
  });
  return hits;
}

const UrbanRedactle = () => {
  const [term, setTerm] = useState("");
  const [definitions, setDefinitions] = useState([]);
  const [guessedWords, setGuessedWords] = useState([]);
  const [input, setInput] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [highlightLength, setHighlightLength] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  const fetchWordAndDefinitions = async () => {
    setLoading(true);
    try {
      const randomRes = await fetch(
        `${API_URL}/random?limit=1&page=1&multiPage=false`
      );
      const randomData = await randomRes.json();
      const randomTerm = randomData?.data?.[0]?.word;
      if (!randomTerm) throw new Error("No valid term from /random");
      setTerm(randomTerm.toLowerCase());

      const searchRes = await fetch(
        `${API_URL}/search?term=${encodeURIComponent(
          randomTerm
        )}&strict=true&limit=6&page=1&matchCase=false`
      );
      const searchData = await searchRes.json();
      const entries = searchData?.data || [];
      if (entries.length === 0)
        throw new Error("No definitions found for term");

      setDefinitions(entries);
      setHasWon(false);
      setGaveUp(false);
      setGuessedWords([]);
      setGuessCount(0);
      setShowConfirm(false);
    } catch (err) {
      console.error("Failed to fetch definitions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWordAndDefinitions();
    const handleMouseUp = () => {
      const selection = window.getSelection().toString().trim();
      setHighlightLength(selection.length > 0 ? selection.length : 0);
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleGuess = () => {
    const cleaned = input.trim().toLowerCase();
    if (!cleaned || guessedWords.includes(cleaned)) {
      setInput("");
      return;
    }

    setGuessedWords((prev) => [...prev, cleaned]);
    setGuessCount((prev) => prev + 1);

    const allWordsGuessed = term
      .split(" ")
      .every(
        (w) =>
          guessedWords.includes(w.toLowerCase()) || w.toLowerCase() === cleaned
      );

    if (allWordsGuessed) setHasWon(true);

    setInput("");
  };

  const giveUp = () => {
    setGaveUp(true);
    setHasWon(false);
    setShowConfirm(false);
  };

  const isRevealMode = hasWon || gaveUp;

  const wordFrequency = definitions
    .map((d) => `${d.meaning} ${d.example}`)
    .join(" ");
  const frequencyMap = countOccurrences(wordFrequency, guessedWords);

  // Hit count and hit rate calculation
  const hitCount = getHitCount(guessedWords, definitions);
  const totalGuesses = guessedWords.length;
  const hitRate =
    totalGuesses === 0 ? 0 : Math.round((hitCount / totalGuesses) * 100);

  return (
    <div className="layout">
      <div className="sidebar">
        <h2>🧠 Your Guesses</h2>
        <p className="hit-rate">
          Guess Percentage: {hitCount}/{totalGuesses} ({hitRate}%)
        </p>
        <ul>
          {guessedWords.map((word, index) => (
            <li key={index}>
              {word} ({frequencyMap[word] || 0})
            </li>
          ))}
        </ul>
        <p className="counter">Guesses: {guessCount}</p>
      </div>

      <div className="main">
        <h1>Urban Dictionary Redactle</h1>
        <p className="hidden-word">
          🔒 Hidden Word:{" "}
          {term.split(" ").map((w, i) => {
            // Reveal each word if guessed, or if won/gave up
            const isRevealed = isRevealMode || guessedWords.includes(w);
            return (
              <span
                key={i}
                className={isRevealed ? "revealed" : "redacted"}
                style={{ marginRight: "4px", display: "inline-block" }}
              >
                {isRevealed ? w : "█".repeat(w.length)}
              </span>
            );
          })}
        </p>
        {highlightLength > 0 && (
          <p className="highlight-info">
            🔍 Highlighted word has {highlightLength} characters
          </p>
        )}

        {(hasWon || gaveUp) && (
          <div className="win-message">
            <h2>
              {hasWon
                ? `🎉 You guessed the word: ${term.toUpperCase()}!`
                : `😅 The word was: ${term.toUpperCase()}`}
            </h2>
            <p>Total guesses: {guessCount}</p>
            <button onClick={fetchWordAndDefinitions}>Play Again</button>
          </div>
        )}

        {loading ? (
          <p>Loading definitions...</p>
        ) : (
          <div className="definition-box">
            {definitions.map((def, index) => (
              <div key={index} className="entry">
                <p>
                  <strong>Meaning:</strong>{" "}
                  {RedactMeaningText(
                    def.meaning,
                    guessedWords,
                    term,
                    6,
                    isRevealMode
                  )}
                </p>
                <p>
                  <strong>Example:</strong>{" "}
                  {RedactExampleText(
                    def.example,
                    term,
                    isRevealMode,
                    guessedWords
                  )}
                </p>
                <hr />
              </div>
            ))}
          </div>
        )}

        {!isRevealMode &&
          (showConfirm ? (
            <div className="confirm-box">
              <p>Are you sure you want to give up?</p>
              <button onClick={giveUp}>Yes, reveal answer</button>
              <button onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          ) : (
            <button className="give-up" onClick={() => setShowConfirm(true)}>
              Give Up
            </button>
          ))}

        <div className="input-box">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Guess a word..."
            onKeyDown={(e) => e.key === "Enter" && handleGuess()}
            disabled={isRevealMode}
          />
          <button onClick={handleGuess} disabled={isRevealMode}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrbanRedactle;
