import React from 'react';
import { gridSize, clueMapKey } from './helpers';
import { constants } from './constants';
import GridCell from './cell';
import { classNames } from './classNames';

// Position at end of previous cell
const createWordSeparator = (x, y, direction) => {
  const top = gridSize(y);
  const left = gridSize(x);
  const borderWidth = 1;

  if (direction === 'across') {
    const width = 1;
    return (
      <rect
        x={left - borderWidth - width}
        y={top}
        key={`sep_${direction}_${x}_${y}`}
        width={width}
        height={constants.cellSize}
      />
    );
  } else if (direction === 'down') {
    const height = 1;
    return (
      <rect
        x={left}
        y={top - borderWidth - height}
        key={`sep_${direction}_${x}_${y}`}
        width={constants.cellSize}
        height={height}
      />
    );
  }
};

// Position between cells for hyphens
const createHyphenSeparator = (x, y, direction) => {
  const top = gridSize(y);
  const left = gridSize(x);
  const borderWidth = 1;

  if (direction === 'across') {
    return (
      <rect
        x={left - borderWidth / 2 - constants.cellSize / 8}
        y={top + constants.cellSize / 2}
        key={`sep_${direction}_${x}_${y}`}
        width={constants.cellSize / 4}
        height={1}
      />
    );
  } else if (direction === 'down') {
    return (
      <rect
        x={left + constants.cellSize / 2}
        y={top - borderWidth / 2 - constants.cellSize / 8}
        key={`sep_${direction}_${x}_${y}`}
        width={1}
        height={constants.cellSize / 4}
      />
    );
  }
};

const createSeparator = (x, y, separatorDescription) => {
  if (!separatorDescription) return null;
  if (separatorDescription.separator === ',') {
    return createWordSeparator(x, y, separatorDescription.direction);
  } else if (separatorDescription.separator === '-') {
    return createHyphenSeparator(x, y, separatorDescription.direction);
  }
};

export const Grid = ({ rows, columns, cells, separators, crossword, focussedCell }) => {
  console.log('🔍 Grid props: rows=', rows, 'columns=', columns, 'cells=', cells);
  const width = gridSize(columns);
  const height = gridSize(rows);

  const cellElements = [];
  const separatorElements = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const cellProps = cells[x]?.[y];  // <--- should be fixed this way.

      if (!cellProps || !cellProps.isEditable) continue;

      const isHighlighted = crossword?.isCellHighlighted
        ? crossword.isCellHighlighted(x, y)
        : false;

      const isFocussed =
        focussedCell &&
        focussedCell.x === x &&
        focussedCell.y === y;

      cellElements.push(
        <GridCell
          key={`cell_${x}_${y}`}
          {...cellProps}
          handleSelect={(x, y) => crossword?.onSelect(x, y)}
          x={x}
          y={y}
          isHighlighted={isHighlighted}
          isFocussed={isFocussed}
        />
      );

      const sep = createSeparator(x, y, separators[clueMapKey(x, y)]);
      if (sep) separatorElements.push(sep);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={classNames({
        crossword__grid: true,
        'crossword__grid--focussed': !!focussedCell,
      })}
    >
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        className="crossword__grid-background"
      />
      {cellElements}
      <g className="crossword__grid__separators">{separatorElements}</g>
    </svg>
  );
};
