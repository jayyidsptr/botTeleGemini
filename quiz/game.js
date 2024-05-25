const gameData = require('./databasegame.json');

let currentIndex = 0;

const getNextQuestion = () => {
  return gameData[currentIndex++];
};

const getRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * gameData.length);
  return gameData[randomIndex];
};

const checkAnswer = (jawaban, currentQuestion) => {
  return jawaban.toLowerCase() === currentQuestion.jawaban.toLowerCase();
};

module.exports = { getNextQuestion, getRandomQuestion, checkAnswer };