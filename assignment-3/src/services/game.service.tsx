import axios from "axios";
import { getAuthHeader } from "../utils/auth-header"

export type Generator<T> = { next: () => T };

export type Position = {
  row: number;
  col: number;
};

export enum DIRECTION {
  UP = `UP`,
  DOWN = `Down`,
  LEFT = `Left`,
  RIGHT = `Right`,
}

export type Match<T> = {
  matched: T;
  positions: Position[];
};

export type TilePiece<T> = {
  value: T;
  position: Position;
};

export type Board<T> = {
  width: number;
  height: number;
  tilePieces: TilePiece<T>[];
};

export type Effect<T> = {
  kind: string;
  board?: Board<T>;
  match?: Match<T>;
};

export type MatchResult<T> = {
  effects: Effect<T>[];
  matches: TilePiece<T>[];
};

export type MoveResult<T> = {
  board: Board<T>;
  effects: Effect<T>[];
};

const API_URL = "http://localhost:9090/";


/* ---------------------------- API COMMUNICATION --------------------------- */

export function getGames() {
    return axios.get(API_URL + "games", {
      params: {
        ...getAuthHeader()
      }
    });
  };

export async function createGame(userId: number) {
  return axios.post(API_URL + "games", {
      user: {
        id: userId,
      }
  }, {
    params: {
      ...getAuthHeader()
    }
  }).then((response: any) => {
    if(response.data.id)
    {
      localStorage.setItem(`currentGameId`, response.data.id);
    }
    return response.data;
  })
}


export function updateGame(id: number, body: any) {
  axios.patch(API_URL + `games/${id}`, {
    ...body
  }, {
    params: {
      ...getAuthHeader()
    }
  })
}

export function emptyCurrent() {
  localStorage.removeItem("currentGameId");
}

export async function getGame(id: number) {
  return axios.get(API_URL + `games/${id}`, {
    params: {
      ...getAuthHeader()
    }
  }).then((response) => {
    return response.data;
  })
}

/* ----------------------------- GIVEN FUNCTIONS ---------------------------- */

export function create<T>(
  boardGenerator: Generator<T>,
  width: number,
  height: number
): Board<T> {
  return {
    width,
    height,
    tilePieces: firstFillingOfBoard(boardGenerator, height, width),
  };
}

export function tilePiece<T>(board: Board<T>, position: Position): T | undefined {
  if (!isPositionOutsideBoard(board, position)) {
    return undefined;
  }
  return findTilePieceOnPosition(board, position)?.value;
}

export function canMove<T>(
  board: Board<T>,
  original: Position,
  neww: Position
): boolean {
  return isMoveLegal(board, original, neww);
}

export function firstCheck<T>(boardGenerator: Generator<T>, board: Board<T>) {
  const effects: any = [];
  checkBoard(board, boardGenerator, effects);

  return {
    board,
    effects,
  };
}

export function move<T>(
  boardGenerator: Generator<T>,
  board: Board<T>,
  original: Position,
  neww: Position
): MoveResult<T> {
  if (isMoveLegal(board, original, neww)) {
    swapTilePieces(board, original, neww);
    const effects: any = [];
    checkBoard(board, boardGenerator, effects);

    return {
      board,
      effects,
    };
  }

  return {
    board,
    effects: [],
  };
}

/* -------------------------------------------------------------------------- */
/*                          MOVING AND REFILING PART                          */
/* -------------------------------------------------------------------------- */

/* ----------------------- COLUMN MATCHES WITH RECURSTION ---------------------- */

/**
 * Searchs for matches in all rows of the board.
 * @param board the given board
 * @returns matches with all occured effects
 */
function getAllMatchesInCol<T>(board: Board<T>): MatchResult<T> {
  let matches: TilePiece<T>[] = [];
  let effects: Effect<T>[] = [];
  for (let i = board.width; i >= 0; i--) {
    const checkedValues: T[] = [];
    const elementsInColumn = getAllTilePiecesInCol(board, i);
    for (const element of elementsInColumn) {
      if (!checkedValues.includes(element.value)) {
        checkedValues.push(element.value);
        const result = checkNeighboursInCol(board, element);
        matches = matches.concat(result.matches);
        effects = effects.concat(result.effects);
      }
    }
  }
  return {
    matches,
    effects,
  };
}
/**
 * Searches for matches on the top and bottom of the given element. And fires event when enabled.
 * @param board
 * @param originalTilePiece the given start element
 * @returns matches with effects
 */
function checkNeighboursInCol<T>(
  board: Board<T>,
  originalTilePiece: TilePiece<T>
): MatchResult<T> {
  const nextTilePieceUpPosition = findPositionOfNextTilePiece(
    originalTilePiece,
    DIRECTION.UP
  );
  const tilePieceOnNextTilePieceUpPosition = findTilePieceOnPosition(board, nextTilePieceUpPosition);
  const upElements = checkNeighbour(
    board,
    tilePieceOnNextTilePieceUpPosition,
    [],
    originalTilePiece.value,
    DIRECTION.UP
  );
  const downElements = checkNeighbour(
    board,
    findTilePieceOnPosition(
      board,
      findPositionOfNextTilePiece(originalTilePiece, DIRECTION.DOWN)
    ),
    [],
    originalTilePiece.value,
    DIRECTION.DOWN
  );

  if (upElements.length + downElements.length + 1 >= 3) {
    const tilePiecesMatched = [...upElements, originalTilePiece, ...downElements];
    return generateMatchEffect(tilePiecesMatched);
  }

  return {
    effects: [],
    matches: [],
  };
}

function fillBoard<T>(
  board: Board<T>,
  boardGenerator: Generator<T>,
  effects: Effect<T>[]
) {
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      const tilePieceFound = findTilePieceOnPosition(board, { row, col });
      if (!tilePieceFound) {
        return;
      }
      if (tilePieceFound?.value === undefined) {
        shiftTilePiecesInCol(
          board,
          tilePieceFound.position.row,
          tilePieceFound.position.col
        );
        const result = findTilePieceOnPosition(board, {
          row: 0,
          col: tilePieceFound.position.col,
        })

        if(result) {
          result.value = boardGenerator.next();
        }
      }
    }
  }
  effects.push({
    kind: `Refill`,
    board,
  });

  checkBoard(board, boardGenerator, effects);
}

function shiftTilePiecesInCol<T>(
  board: Board<T>,
  fromRow: number,
  col: number
): void {
  for (let row = fromRow; row > 0; row--) {
    swapTilePieces(board, { row, col }, { row: row - 1, col });
  }
}

/**
 * Return the position of the next element based on the given direction and given tilePiece
 * @param currentTilePiece the tilePiece to compare with
 * @param direction the direction to find next tilePiece
 * @returns the postion of the found next tilePiece
 */
function findPositionOfNextTilePiece<T>(
  currentTilePiece: TilePiece<T>,
  direction: DIRECTION
) {
  let position: Position = {
    row: currentTilePiece.position.row,
    col: currentTilePiece.position.col,
  };
  if (direction === DIRECTION.DOWN) {
    position.row += 1;
  }

  if (direction === DIRECTION.UP) {
    position.row -= 1;
  }

  if (direction === DIRECTION.LEFT) {
    position.col -= 1;
  }

  if (direction === DIRECTION.RIGHT) {
    position.col += 1;
  }
  return position;
}

/* ----------------------- ROW MATCHES WITH RECURSTION ---------------------- */

/**
 * Searchs for matches in all rows of the board.
 * @returns the array with all found matches
 */
function getAllMatchesInRow<T>(board: Board<T>): MatchResult<T> {
  let matches: TilePiece<T>[] = [];
  let effects: Effect<T>[] = [];
  for (let i = 0; i < board.height; i++) {
    const checkedValues: T[] = [];
    const tilePiecesInRow = getAllTilePiecesInRow(board, i);
    for (const element of tilePiecesInRow) {
      if (!checkedValues.includes(element.value)) {
        checkedValues.push(element.value);
        const result = checkNeighboursInRow(board, element);
        matches = matches.concat(result.matches);
        effects = effects.concat(result.effects);
      }
    }
  }
  return {
    matches,
    effects,
  };
}

/**
 * Searches for matches on the left and right of the given element. And fires event when enabled.
 * @param originalTilePiece the given start element
 * @returns the empty array or array with all matched elements
 */
function checkNeighboursInRow<T>(
  board: Board<T>,
  originalTilePiece: TilePiece<T>
): MatchResult<T> {
  const tilePiecesOnTheLeft = checkNeighbour(
    board,
    findTilePieceOnPosition(
      board,
      findPositionOfNextTilePiece(originalTilePiece, DIRECTION.LEFT)
    ),
    [],
    originalTilePiece.value,
    DIRECTION.LEFT
  );
  const tilePiecesOnTheRight = checkNeighbour(
    board,
    findTilePieceOnPosition(
      board,
      findPositionOfNextTilePiece(originalTilePiece, DIRECTION.RIGHT)
    ),
    [],
    originalTilePiece.value,
    DIRECTION.RIGHT
  );

  if (tilePiecesOnTheLeft.length + tilePiecesOnTheRight.length + 1 >= 3) {
    const tilePiecesMatched = [
      ...tilePiecesOnTheLeft,
      originalTilePiece,
      ...tilePiecesOnTheRight,
    ];
    return generateMatchEffect(tilePiecesMatched);
  }

  return {
    effects: [],
    matches: [],
  };
}

/**
 * A recursive function that goes to the given direction of the given element and compares its value.
 * When values are the same it is added to the given array and the process repeats until invalid value or end of the board reached.
 * @param currentTilePiece the current checking tilePiece
 * @param tilePiecesMatching the array with all found matches until now
 * @param value the given value to compare with
 * @param Direction the checking process direction
 * @returns the array with all found matches
 */
function checkNeighbour<T>(
  board: Board<T>,
  currentTilePiece: TilePiece<T> | undefined,
  tilePiecesMatching: TilePiece<T>[],
  value: T,
  Direction: DIRECTION
) {
  if (!currentTilePiece) {
    return tilePiecesMatching;
  }
  if (currentTilePiece.value === value) {
    tilePiecesMatching.push(currentTilePiece);
    const nextPiece = findTilePieceOnPosition(
      board,
      findPositionOfNextTilePiece(currentTilePiece, Direction)
    );
    checkNeighbour(board, nextPiece, tilePiecesMatching, value, Direction);
  }
  return tilePiecesMatching;
}

/**
 * Searchs for matches in all rows of the board.
 * @returns the array with all found matches
 */
function getAllTilePiecesInRow<T>(board: Board<T>, rowIndex: number) {
  return board.tilePieces.filter((element) => {
    return element.position.row === rowIndex;
  });
}

/**
 * Returns all elements for the given column
 * @param columnIndex The column index from which elements will be returned
 * @returns All the elements in the given column
 */
function getAllTilePiecesInCol<T>(board: Board<T>, columnIndex: number) {
  return board.tilePieces.filter((element) => {
    return element.position.col === columnIndex;
  });
}

/* -------------------------------------------------------------------------- */
/*                               HELPERS / UTILS                              */
/* -------------------------------------------------------------------------- */

/**
 * Scans the board to find all matches, removes them and calls a recursive refill function
 */
function checkBoard<T>(
  board: Board<T>,
  boardGenerator: Generator<T>,
  effects: Effect<T>[]
): void {
  const matchesInRow = getAllMatchesInRow(board);
  const matchesInCol = getAllMatchesInCol(board);
  effects.push(...matchesInRow.effects);
  effects.push(...matchesInCol.effects);
  if (matchesInRow.matches.length || matchesInCol.matches.length) {
    removedMatchedValues(matchesInRow.matches, matchesInCol.matches);
    fillBoard(board, boardGenerator, effects);
  }
}

/**
 *
 * @param tilePiecesMatched Generates move effect based on given tilePieces
 * @returns Generated effect
 */
function generateMatchEffect<T>(tilePiecesMatched: TilePiece<T>[]) {
  return {
    effects: [
      {
        kind: `Match`,
        match: {
          matched: { ...tilePiecesMatched[0] }.value,
          positions: tilePiecesMatched.map((match) => match.position),
        },
      },
    ],
    matches: tilePiecesMatched,
  };
}

/**
 * For each matched tilePieces sets value as undefined
 * @param tilePieceMatchesInRow matched tilePieces in rows
 * @param tilePieceMatchesInCol matched tilePieces in columns
 */
function removedMatchedValues<T>(
  tilePieceMatchesInRow: TilePiece<T>[],
  tilePieceMatchesInCol: TilePiece<T>[]
): void {
  tilePieceMatchesInRow.forEach((match: any) => {
    match.value = undefined;
  });
  tilePieceMatchesInCol.forEach((match: any) => {
    match.value = undefined;
  });
}

/**
 * Checks if move is legal according to the game rules
 * @param originalPosition the postion of the original element
 * @param newPosition the position of the neww element
 * @returns boolean value based on the move legal state
 */
function isMoveLegal<T>(
  board: Board<T>,
  originalPosition: Position,
  newPosition: Position
): boolean {
  if (
    !isPositionOutsideBoard(board, originalPosition) ||
    !isPositionOutsideBoard(board, newPosition)
  ) {
    return false;
  }
  if (
    originalPosition.col === newPosition.col &&
    originalPosition.row === newPosition.row
  ) {
    return false;
  }

  if (
    originalPosition.col !== newPosition.col &&
    originalPosition.row !== newPosition.row
  ) {
    return false;
  }

  swapTilePieces(board, originalPosition, newPosition);
  const matchesInRows = getAllMatchesInRow(board);
  const matchesInColumns = getAllMatchesInCol(board);
  swapTilePieces(board, originalPosition, newPosition);

  if (!matchesInRows.matches.length && !matchesInColumns.matches.length) {
    return false;
  }
  return true;
}

/**
 * Checks is the given postion is outside of the generated board
 * @param position the given position
 * @returns boolean value based on the check state
 */
function isPositionOutsideBoard<T>(board: Board<T>, position: Position): boolean {
  if (position.col >= board.width || position.col < 0) {
    return false;
  }

  if (position.row >= board.height || position.row < 0) {
    return false;
  }
  return true;
}

/**
 * Finds elements on given position and swaps their values based on the fuction patched to tilePieces array
 * @param original position of the original element
 * @param neww position of th neww element
 */
function swapTilePieces<T>(board: Board<T>, original: Position, neww: Position) {
  const originalTilePiece = findTilePieceOnPosition(board, original);
  const newTilePiece = findTilePieceOnPosition(board, neww);

  if (!originalTilePiece || !newTilePiece) {
    return;
  }

  const originalIndex = board.tilePieces.indexOf(originalTilePiece );
  const newIndex = board.tilePieces.indexOf(newTilePiece);

  if (!(board.tilePieces as any).swapProperties) {
    (board.tilePieces as any).swapProperties = (
      originalIndex: number,
      newIndex: number,
      propertyToSwap: string
    ) => {
      const firstPieceValue = (board.tilePieces as any)[originalIndex][propertyToSwap];
      const secondPieceValue = (board.tilePieces as any)[newIndex][propertyToSwap];
      (board.tilePieces as any)[originalIndex][propertyToSwap] = secondPieceValue;
      (board.tilePieces as any)[newIndex][propertyToSwap] = firstPieceValue;
    };
  }

  (board.tilePieces as any).swapProperties(originalIndex, newIndex, `value`);
}

function findTilePieceOnPosition<T>(board: Board<T>, position: Position) {
  return board.tilePieces.find((element) => {
    return (
      element.position.col === position.col &&
      element.position.row === position.row
    );
  });
}

/**
 * Fills the board with inital values given by the boardGenerator
 */
function firstFillingOfBoard<T>(
  boardGenerator: Generator<T>,
  height: number,
  width: number
): TilePiece<T>[] {
  const tilePieces: TilePiece<T>[] = [];
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      tilePieces.push({
        value: boardGenerator.next(),
        position: {
          row,
          col,
        },
      });
    }
  }

  // Monkey patched function to tilePieces object
  (tilePieces as any).swapProperties = (
    originalIndex: number,
    newIndex: number,
    propertyToSwap: string
  ) => {
    const firstPieceValue = (tilePieces as any)[originalIndex][propertyToSwap];
    const secondPieceValue = (tilePieces as any)[newIndex][propertyToSwap];
    (tilePieces as any)[originalIndex][propertyToSwap] = secondPieceValue;
    (tilePieces as any)[newIndex][propertyToSwap] = firstPieceValue;
  };

  return tilePieces;
}
