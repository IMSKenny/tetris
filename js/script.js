import increaseScore from "./score.js";

// Определяем размер блока
const blockSize = 20;
// Определение игрового поля
const ROWS = 30;
const COLS = 15;
let lastTime = 0;
// Интервал времени между падениями фигур в миллисекундах
let dropInterval = 1000;

// Счет
let score = 0;
// Переменные для отслеживания состояния клавиш
let keyState = {};
let isKeyPressed = false;

// Создание двумерного массива, представляющего игровое поле
const grid = [];
for (let row = 0; row < ROWS; row++) {
  grid[row] = new Array(COLS).fill(0);
}

// Отрисованное поле
let alreadyGrid = [];
for (let row = 0; row < ROWS; row++) {
  alreadyGrid[row] = new Array(COLS).fill(999);
}

// Массив с базовыми цветами
const colors = [
  null,
  "#FF0D72",
  "#0DC2FF",
  "#0DFF72",
  "#F538FF",
  "#FF8E0D",
  "#FFE138",
  "#3877FF",
];

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowDown: false,
};

// Массив с матрицами фигур
const tetrominoX = [
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],

  [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 2, 2, 0],
    [2, 0, 0, 0],
  ],

  [
    [0, 0, 0, 0],
    [3, 3, 3, 3],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],

  [
    [0, 0, 0, 0],
    [4, 4, 4, 0],
    [0, 4, 0, 0],
    [0, 0, 0, 0],
  ],

  [
    [0, 5, 0, 0],
    [0, 5, 5, 0],
    [0, 0, 5, 0],
    [0, 0, 0, 0],
  ],

  // [
  //   [6, 0, 0, 6],
  //   [6, 0, 0, 6],
  //   [6, 0, 0, 6],
  //   [6, 6, 6, 6],
  // ],

  // [
  //   [0, 7, 0, 0],
  //   [0, 7, 0, 0],
  //   [7, 7, 7, 0],
  //   [7, 7, 7, 0],
  // ],
];

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
// Случайная фигура
let tetrominoRandom;
context.fillStyle = "#000";
context.strokeStyle = "gray";

// Выбор случайной фигуры
function createTetromino() {
  tetrominoRandom = tetrominoX[Math.floor(Math.random() * tetrominoX.length)];
}

// Отрисовка фигуры
function drawTetromino(tetromino, x, y, context) {
  tetromino.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value > 0) {
        context.fillStyle = colors[value];
        context.strokeStyle = colors[value] + 100;

        // Определяем координаты блока на холсте
        const xPos = (x + colIndex) * blockSize;
        const yPos = (y + rowIndex) * blockSize;
        // Отображаем блок на холсте
        context.fillRect(xPos, yPos, blockSize, blockSize);
        context.strokeRect(xPos, yPos, blockSize, blockSize);
      }
    });
  });
}

// Отрисовка поля
function drawGrid() {
  context.strokeStyle = "red";
  context.strokeRect(0, 0, canvas.width, blockSize * 4);
  context.strokeStyle = "gray";
  context.strokeRect(0, canvas.height - 400, 150, 200);
  context.strokeRect(150, canvas.height - 400, 150, 200);
  context.strokeRect(0, 0, 300, 200);
  context.strokeRect(0, canvas.height - 200, 300, 200);
  context.fillStyle = "gray";
  context.font = "24px Ariel";
  context.fillText("Left", 60, 300);
  context.fillText("Right", 210, 300);
  context.fillText("Down", 125, 500);
  context.fillText("Rotate", 125, 100);

  context.fillText(`${score}`, 20, 50);

  if (grid !== alreadyGrid) {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        let color = grid[row][col];
        
        
        if (color !== 0 ) {
          console.log("111111111111111111111111111111111111111");

          context.fillStyle = colors[color];
          // context.strokeStyle = colors[value]+100;
          context.fillRect(
            col * blockSize,
            row * blockSize,
            blockSize,
            blockSize
          );

          context.strokeStyle = "gray";
          context.strokeRect(
            col * blockSize,
            row * blockSize,
            blockSize,
            blockSize
          );
          //alreadyGrid[row][col] = grid[row][col];
        }
      }
    }
  }
   //alreadyGrid = grid;
}

function clearRows() {
  const filledRows = [];

  // Проверяем каждую строку на заполненность
  for (let row = ROWS - 1; row >= 0; row--) {
    let isRowFilled = true;
    for (let col = 0; col < COLS; col++) {
      if (!grid[row][col]) {
        isRowFilled = false;
        break;
      }
    }
    if (isRowFilled) {
      filledRows.push(row);
    }
  }

  let i = 0;
  // Удаляем все заполненные строки
  for (const row of filledRows) {
    // Удаление заполненной строки из массива
    grid.splice(row + i, 1);
    score = increaseScore();
    // Добавление новой пустой строки в начало массива
    grid.unshift(Array(COLS).fill(0));
    i++;
  }
}

class Tetromino {
  constructor(shape) {
    this.shape = shape;
    this.x = 6;
    this.y = 0;
    this.grid = grid;
  }

  draw() {
    drawTetromino(this.shape, this.x, this.y, context);
  }

  moveDown() {
    this.y++;
  }

  rotate() {
    // Получаем размеры матрицы фигуры
    const size = this.shape.length;

    // Создаем новую пустую матрицу для новой формы после поворота
    const newShape = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));

    // Проходим по элементам матрицы фигуры и копируем их в новую матрицу с поворотом
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        newShape[i][j] = this.shape[size - j - 1][i];
      }
    }

    // Устанавливаем новую форму фигуры
    this.shape = newShape;
  }

  move(dir) {
    let newX = this.x + dir;
    let newY = this.y;

    // проверка на выход за пределы поля
    let correctRightX;
    doneRight: for (let col = this.shape.length; col > 0; col--) {
      for (let row = 0; row < this.shape.length; row++) {
        if (!this.shape[row][col]) {
          correctRightX = col - 1;
        } else {
          correctRightX = col;
          break doneRight;
        }
      }
    }

    let correctLeftX;
    doneLeft: for (let col = 0; col < this.shape.length; col++) {
      for (let row = 0; row < this.shape.length; row++) {
        if (!this.shape[row][col]) {
          correctLeftX = col - 1;
        } else {
          correctLeftX = col;
          break doneLeft;
        }
      }
    }

    if (
      newX < 0 - correctLeftX ||
      newX >= COLS - correctRightX ||
      newY >= ROWS
    ) {
      return false;
    }

    for (let col = this.shape.length - 1; col > 0; col--) {
      for (let row = 0; row < this.shape.length - 1; row++) {
        if (
          this.shape[row][col] &&
          this.grid[this.y + row][this.x + col + dir]
        ) {
          return false;
        }
      }
    }

    for (let col = 0; col < this.shape.length; col++) {
      for (let row = this.shape.length - 1; row > 0; row--) {
        if (
          this.shape[row][col] &&
          this.grid[this.y + row][this.x + col + dir]
        ) {
          return false;
        }
      }
    }

    // // проверка на столкновение с другой фигурой
    // if (this.collides()) {
    //   return false;
    // }

    // обновление координат фигуры
    this.x = newX;
    this.y = newY;

    return true;
  }

  collides() {
    // let correctY;
    // doneLeft: for (let row = this.shape.length-1; row > 0; row--) {
    //   for (let col = 0; col < this.shape.length-1; col++) {
    //     if (!this.shape[row][col]) {
    //       correctY = row - 1;
    //     } else {
    //       correctY = row;
    //       break doneLeft;
    //     }
    //   }
    // }

    for (let row = this.shape.length - 1; row > 0; row--) {
      for (let col = this.shape[row - 1].length - 1; col >= 0; col--) {
        // Проверка, находится ли текущий элемент фигуры в пределах игрового поля
        if (this.shape[row][col] && this.y + row >= this.grid.length - 1) {
          return true;
        }
        // Проверка на столкновение с другой фигурой
        if (this.shape[row][col] && this.grid[this.y + row + 1][this.x + col]) {
          return true;
        }
      }
    }
    for (let col = 0; col < this.shape.length; col++) {
      for (let row = 0; row < this.shape.length - 1; row++) {
        if (this.shape[row][col] && this.grid[this.y + row + 1][this.x + col]) {
          return true;
        }
      }
    }

    return false;
  }

  lock() {
    for (let row = 0; row < this.shape.length; row++) {
      for (let col = 0; col < this.shape[row].length; col++) {
        if (this.shape[row][col]) {
          if (this.grid[this.y + row][this.x + col] < this.grid.length) {
            this.grid[this.y + row][this.x + col] = this.shape[row][col];
          }
        }
      }
    }

    clearRows();

    // Добавление очков
    // ...

    for (let col = 0; col <= COLS; col++) {
      if (this.grid[2][col]) {
        return false;
      }
    }
    return true;
  }
}

/*************************************************************************** */
/*************************************************************************** */
/*Управление                                                                 */
/*************************************************************************** */
/*************************************************************************** */

// Функция для обработки нажатия клавиши
function handleKeyDown(event) {
  // Проверяем, что клавиша еще не нажата
  if (!keyState[event.key]) {
    keyState[event.key] = true;

    isKeyPressed = true;

    // Здесь можно обновить позицию фигуры, например:
    // tetromino.moveLeft(); // Перемещение фигуры влево
  }
}

// Функция для обработки отпускания клавиши
function handleKeyUp(event) {
  keyState[event.key] = false;
  isKeyPressed = false;
}

// Добавляем обработчики событий нажатия и отпускания клавиш
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// Определение областей для управления на смартфоне
const leftButton = { x: 0, y: canvas.height - 400, width: 150, height: 200 };
const rightButton = { x: 150, y: canvas.height - 400, width: 150, height: 200 };
const rotateButton = { x: 0, y: 0, width: 300, height: 200 };
const downButton = { x: 0, y: canvas.height - 200, width: 300, height: 200 };
// Переменные для отслеживания долгого нажатия
let isTouching = false;
let intervalId = null;

// Обработчик события касания
canvas.addEventListener("touchstart", function (event) {
  const touch = event.touches[0];
  const touchX = touch.pageX - canvas.offsetLeft;
  const touchY = touch.pageY - canvas.offsetTop;

  // Проверка, в какую область коснулся пользователь
  if (isInside(touchX, touchY, leftButton)) {
    // Выполните необходимое действие при касании на кнопку "Влево"
    tetromino.move(-1);
    isTouching = true;
    // Выполнение действия при начале долгого нажатия
    intervalId = setInterval(function () {
      // Выполните необходимое действие при долгом нажатии вниз
      tetromino.move(-1);
    }, 100); // Измените интервал, чтобы управлять скоростью падения
  } else if (isInside(touchX, touchY, rightButton)) {
    // Выполните необходимое действие при касании на кнопку "Вправо"
    tetromino.move(1);
    isTouching = true;
    // Выполнение действия при начале долгого нажатия
    intervalId = setInterval(function () {
      // Выполните необходимое действие при долгом нажатии вниз
      tetromino.move(1);
    }, 100); // Измените интервал, чтобы управлять скоростью падения
  } else if (isInside(touchX, touchY, rotateButton)) {
    // Выполните необходимое действие при касании на кнопку "Поворот"
    tetromino.rotate();
  } else if (isInside(touchX, touchY, downButton)) {
    // Выполните необходимое действие при касании на кнопку "вниз"
    tetromino.moveDown();
    isTouching = true;
    // Выполнение действия при начале долгого нажатия
    intervalId = setInterval(function () {
      // Выполните необходимое действие при долгом нажатии вниз
      tetromino.moveDown();
    }, 100); // Измените интервал, чтобы управлять скоростью падения
  }
});

canvas.addEventListener("touchend", function (event) {
  // Сброс флага нажатия и очистка интервала
  isTouching = false;
  clearInterval(intervalId);
});

// Функция для проверки, находится ли точка внутри прямоугольной области
function isInside(x, y, rect) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

/*********************************************************************************** */
/*************************************************************************************/
/*цикл игры                                                                          */
/*********************************************************************************** */
/*********************************************************************************** */

function moveDown() {
  // двигаем текущую фигурку вниз
  tetromino.y++;
  // обновляем поле
  update();
}

function update(time = 0) {
  // Проверяем состояние клавиши и обновляем позицию фигуры только один раз при каждом нажатии
  if (isKeyPressed) {
    // Обновление позиции фигуры:
    if (keyState.ArrowLeft) {
      tetromino.move(-1);
      context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
    }

    if (keyState.ArrowRight) {
      tetromino.move(+1);
      context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
    }
    if (keyState.ArrowUp) {
      tetromino.rotate();
      context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
    }
    if (keyState.ArrowDown) {
      tetromino.moveDown();
      context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
      if (tetromino.collides()) {
        isKeyPressed = false;
      }
    } else {
      isKeyPressed = false;
    }
  }
  if (tetromino.collides()) {
    
    if (tetromino.lock()) {
      
      createTetromino();
      tetromino = new Tetromino(tetrominoRandom);
      
    } else {
      console.log(tetromino.grid);
      console.log("999999999999999999999999999999999999999999999999999999999");

      return false;
    }
  }

  const deltaTime = time - lastTime;

  // Проверяем, прошло ли достаточно времени для падения фигуры
  if (deltaTime > dropInterval) {
    moveDown(); // Функция для падения фигуры
    context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
    lastTime = time;
  }
  // interval = setInterval(moveDown, 1000);

  // Очистка фигуры на предыдущей позиции
  // context.fillStyle = "#000";
  // context.fillRect(0, 0, canvas.width, canvas.height);
  //drawGrid();

  // Обновление и отрисовка фигуры на новой позиции
  tetromino.draw();

  //Запрос следующего кадра анимации
  requestAnimationFrame(update);
}

// Очистка холста при инициализации игры
// context.fillStyle = '#000';
// context.fillRect(0, 0, canvas.width, canvas.height);
// Начало игры
// drawGrid();
createTetromino();
let tetromino = new Tetromino(tetrominoRandom);

update();
