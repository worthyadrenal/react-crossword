import React, { PureComponent } from 'react';
import { gridSize } from './helpers';
import { constants } from './constants';
import { classNames } from './classNames';

class Cell extends PureComponent {
  handleClick = (event) => {
    event.preventDefault();
    const { handleSelect, x, y } = this.props;
    handleSelect(x, y);
  };

  render() {
    const { x, y, number, value, isFocussed, isHighlighted, isError } = this.props;

    const top = gridSize(y);
    const left = gridSize(x);

    return (
      <g onClick={this.handleClick}>
        <rect
          x={left}
          y={top}
          width={constants.cellSize}
          height={constants.cellSize}
          className={classNames({
            crossword__cell: true,
            'crossword__cell--focussed': isFocussed,
            'crossword__cell--highlighted': isHighlighted,
          })}
        />
        {number !== undefined && (
          <text
            x={left + 1}
            y={top + constants.numberSize}
            className="crossword__cell-number"
          >
            {number}
          </text>
        )}
        {value !== undefined && (
          <text
            x={left + constants.cellSize * 0.5}
            y={top + constants.cellSize * 0.675}
            className={classNames({
              'crossword__cell-text': true,
              'crossword__cell-text--focussed': isFocussed,
              'crossword__cell-text--error': isError,
            })}
            textAnchor="middle"
          >
            {value}
          </text>
        )}
      </g>
    );
  }
}

export default Cell;
