// Инициализация переменной с очками
let score = 0;
// Очки за линию
let points = 10;

// Подсчет очков
function increaseScore() {
  return (score += points);
}

export default increaseScore;
