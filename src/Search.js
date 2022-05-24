import { useState, useCallback } from "react";
import "./App.css";
import debounce from "lodash.debounce";

function Search() {
  const [words, setWords] = useState([]);

  const onInputChange = async (e) => {
    const value = e.target.value;
    if (value) {
      const strTexrt = await fetchData(value);
      setTextToRankList(strTexrt);
    } else {
      setWords([]);
    }
  };

  const setTextToRankList = (strTexrt) => {
    const wordsMap = {};
    const sortedWords = [];
    let numOfTimesArray = []; // get all numbers one time
    let highestNumOfTimes = 0;
    let lowestNumOfTimes = 0;
    let middle;
    const textWithoutSpecialCharts = strTexrt.replace(/[^a-zA-Z]/g, " ");
    const textWithoutSpaces = textWithoutSpecialCharts.trim().split(/\s+/);
    textWithoutSpaces.forEach((word) => {
      wordsMap[word] = wordsMap[word] + 1 || 1;
    });
    for (let word in wordsMap) {
      sortedWords.push([word, wordsMap[word]]);
      if (!numOfTimesArray.includes(wordsMap[word]))
        numOfTimesArray.push(wordsMap[word]);
    }
    sortedWords.sort(function (a, b) {
      return a[1] - b[1];
    });
    numOfTimesArray.sort(function (a, b) {
      return a - b;
    });
    const sortWordsReverse = sortedWords.reverse();
    highestNumOfTimes = numOfTimesArray[numOfTimesArray.length - 1];
    lowestNumOfTimes = numOfTimesArray[0];
    middle = numOfTimesArray[Math.floor(numOfTimesArray.length / 2)];
    const sortedWithRank = sortWordsReverse.map((word) => {
      let rank = 0;
      if (word[1] === highestNumOfTimes) rank = 5;
      else if (word[1] === lowestNumOfTimes) rank = 1;
      else if (word[1] === middle) rank = 3;
      else if (word[1] > middle && word[1] < highestNumOfTimes) rank = 4;
      else if (word[1] < middle && word[1] > lowestNumOfTimes) rank = 2;
      const wordObj = { val: word[0], rank };
      return wordObj;
    });
    setWords(sortedWithRank);
  };

  const fetchData = async (SearchVal) => {
    const api = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=${SearchVal}&origin=*`;
    const response = await fetch(api);
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const htmlStr = pages[pageId].extract;
    return htmlStr;
  };

  const getRankStars = (rank) => {
    let stars = "";
    for (let i = 0; i < rank; i++) {
      stars += "*";
    }
    return stars;
  };

  const debouncedChangeHandler = useCallback(debounce(onInputChange, 500), []);

  return (
    <div className="search-wrraper">
      <h1>Search for a subject:</h1>
      <input onChange={(e) => debouncedChangeHandler(e)} type="text" />
      <div className="words">
        {words.map((word, idx) => (
          <div key={idx} className="word">
            <div>{word.val}</div>
            <div className="rank">
              (<span className="rank-stars">{getRankStars(word.rank)}</span>)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
