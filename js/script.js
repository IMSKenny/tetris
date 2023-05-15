// Определяем размер блока
const blockSize = 20;
// Определение игрового поля
const ROWS = 30;
const COLS = 15;
let lastTime = 0;
let dropInterval = 1000; // интервал времени между падениями фигур в миллисекундах

// Создаем переменные для отслеживания состояния клавиш
let keyState = {};
let isKeyPressed = false;

// Создание двумерного массива, представляющего игровое поле
const grid = [];
for (let row = 0; row < ROWS; row++) {
  grid[row] = new Array(COLS).fill(0);
}
console.log(grid);

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
];
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
let tetrominoFigur;
context.fillStyle = "#000";
context.fillRect(0, 0, canvas.width, canvas.height);

function createTetromino() {
  tetrominoFigur = tetrominoX[Math.floor(Math.random() * tetrominoX.length)];
}

function drawTetromino(tetromino, x, y, context) {
  tetromino.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value > 0) {
        context.fillStyle = colors[value];

        // Определяем координаты блока на холсте
        const xPos = (x + colIndex) * blockSize;
        const yPos = (y + rowIndex) * blockSize;
        // Отображаем блок на холсте
        context.fillRect(xPos, yPos, blockSize, blockSize);
      }
    });
  });
}

function drawGrid() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let color = grid[row][col];
      if (color !== 0) {
        context.fillStyle = colors[color];
        context.fillRect(
          col * blockSize,
          row * blockSize,
          blockSize,
          blockSize
        );
      }
    }
  }
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
    console.log(filledRows);
let i = 0;
    // Удаляем все заполненные строки
    for (const row of filledRows) {
      console.log(filledRows);

      // Удаление заполненной строки из массива
      grid.splice(row+i, 1);
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

// document.addEventListener("keydown", (event) => {
//   if (event.code in keys) {
//     event.preventDefault();
//     keys[event.code] = true;
//   }
// });

// document.addEventListener("keyup", (event) => {
//   if (event.code in keys) {
//     event.preventDefault();
//     keys[event.code] = false;
//   }
// });

function update(time = 0) {
  // Обновление состояния игры

  const deltaTime = time - lastTime;

  // Проверяем, прошло ли достаточно времени для падения фигуры
  if (deltaTime > dropInterval) {
    moveDown(); // Функция для падения фигуры
    lastTime = time;
  }
  // interval = setInterval(moveDown, 1000);
  function moveDown() {
    // двигаем текущую фигурку вниз
    tetromino.y++;
    // обновляем поле
    update();
  }

  if (tetromino.collides()) {
    let gameOver = tetromino.lock();
    if (gameOver) {
      createTetromino();
      tetromino = new Tetromino(tetrominoFigur);
    } else {
      console.log(tetromino.grid);

      return false;
    }
  }
  // Очистка фигуры на предыдущей позиции
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // Обновление и отрисовка фигуры на новой позиции
  // tetromino.update();
  tetromino.draw();

  // Проверяем состояние клавиши и обновляем позицию фигуры только один раз при каждом нажатии
  if (isKeyPressed) {
    // Обновление позиции фигуры, например:
    if (keyState.ArrowLeft) {
      tetromino.move(-1);
    }

    if (keyState.ArrowRight) {
      tetromino.move(+1);
    }
    if (keyState.ArrowUp) {
      tetromino.rotate();
    }
    if (keyState.ArrowDown) {
      tetromino.moveDown();
    }

    isKeyPressed = false;
  }

  //Запрос следующего кадра анимации
  requestAnimationFrame(update);
}

// Очистка холста при инициализации игры
//   context.fillStyle = '#000';
//   context.fillRect(0, 0, canvas.width, canvas.height);
// Начало игры
createTetromino();
let tetromino = new Tetromino(tetrominoFigur);

update();
