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
        key={['sep', direction, x, y].join('_')}
        width={width}
        height={constants.cellSize}
      />
    );
  } if (direction === 'down') {
    const height = 1;
    return (
      <rect
        x={left}
        y={top - borderWidth - height}
        key={['sep', direction, x, y].join('_')}
        width={constants.cellSize}
        height={height}
      />
    );
  }
};

// Position in-between this and previous cells
const createHyphenSeparator = (x, y, direction) => {
  const top = gridSize(y);
  const left = gridSize(x);
  const borderWidth = 1;
  let width;
  let height;

  if (direction === 'across') {
    width = constants.cellSize / 4;
    height = 1;
    return (
      <rect
        x={left - borderWidth / 2 - width / 2}
        y={top + constants.cellSize / 2 + height / 2}
        key={['sep', direction, x, y].join('_')}
        width={width}
        height={height}
      />
    );
  } if (direction === 'down') {
    width = 1;
    height = constants.cellSize / 4;
    return (
      <rect
        x={left + constants.cellSize / 2 + width / 2}
        y={top - borderWidth / 2 - height / 2}
        key={['sep', direction, x, y].join('_')}
        width={width}
        height={height}
      />
    );
  }
};

const createSeparator = (x, y, separatorDescription) => {
  if (separatorDescription) {
    if (separatorDescription.separator === ',') {
      return createWordSeparator(x, y, separatorDescription.direction);
    } if (separatorDescription.separator === '-') {
      return createHyphenSeparator(x, y, separatorDescription.direction);
    }
  }
};


export const Grid = (props) => {
  const getSeparators = (x, y) => props.separators[clueMapKey(x, y)];

  const handleSelect = (x, y) => props.crossword.onSelect(x, y);

  const width = gridSize(props.columns);
  const height = gridSize(props.rows);
  const cells = [];
  let separators = [];

  const range = n => Array.from({ length: n }, (value, key) => key);

  // This is needed to appease ESLint (https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md#false-positives-sfc)
  const cellsIn = props.cells;

  range(props.rows).forEach(y => range(props.columns).forEach((x) => {
    const cellProps = cellsIn[x][y];

    console.log(`🔍 cellProps[${x}][${y}]:`, cellProps);

    if (cellProps.isEditable) {
      console.log('📦 props.crossword:', props.crossword);
      console.log('📦 typeof isHighlighted:', typeof props.crossword?.isHighlighted);
      const isHighlighted = props.crossword.isHighlighted(x, y);
      cells.push(
        <GridCell
          key={`cell_${x}_${y}`}
          {...Object.assign(
            {},
            cellProps,
            {
              handleSelect,
              x,
              y,
              isHighlighted,
              isFocussed:
                                    props.focussedCell
                                    && x === props.focussedCell.x
                                    && y === props.focussedCell.y,
            },
            this,
          )}
        />,
      );

      separators = separators.concat(
        createSeparator(x, y, getSeparators(x, y)),
      );
    }
  }));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={classNames({
        crossword__grid: true,
        'crossword__grid--focussed': !!props.focussedCell,
      })}
    >
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        className="crossword__grid-background"
      />
      {cells}
      <g className="crossword__grid__separators">{separators}</g>
    </svg>
  );
};
