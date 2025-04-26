import React, { Component } from 'react';
import { ConfirmButton } from './confirm-button';

const buttonClassName = 'button button--primary';
const buttonCurrentClassName = 'button--crossword--current';
const buttonGenericClassName = 'button--secondary';

class Controls extends Component {
  render() {
    // Safely access crossword methods
    const cw = this.props.crossword || {};
    const hasSolutions = this.props.hasSolutions;
    const hasFocus = this.props.clueInFocus;

    const controls = {
      clue: [],
      grid: [],
    };

    // GRID CONTROLS
    controls.grid.unshift(
      <ConfirmButton
        className={`${buttonClassName} ${buttonGenericClassName}`}
        disabled={!cw.onClearAll}
        onClick={cw.onClearAll ? cw.onClearAll.bind(cw) : undefined}
        key="clear"
        data-link-name="Clear all"
        text="Clear all"
      />
    );

    if (hasSolutions) {
      controls.grid.unshift(
        <ConfirmButton
          className={`${buttonClassName} ${buttonGenericClassName}`}
          disabled={!cw.onSolution}
          onClick={cw.onSolution ? cw.onSolution.bind(cw) : undefined}
          key="solution"
          data-link-name="Reveal all"
          text="Reveal all"
        />
      );
      controls.grid.unshift(
        <ConfirmButton
          className={`${buttonClassName} ${buttonGenericClassName}`}
          disabled={!cw.onCheckAll}
          onClick={cw.onCheckAll ? cw.onCheckAll.bind(cw) : undefined}
          key="checkAll"
          data-link-name="Check all"
          text="Check all"
        />
      );
    }

    // HIGHLIGHTED CLUE CONTROLS
    if (hasFocus) {
      controls.clue.unshift(
        <button
          className={`${buttonClassName} ${buttonCurrentClassName}`}
          disabled={!cw.onClearSingle}
          onClick={cw.onClearSingle ? cw.onClearSingle.bind(cw) : undefined}
          key="clear-single"
          data-link-name="Clear this"
        >
          Clear this
        </button>
      );

      controls.clue.push(
        <button
          className={`${buttonClassName} ${buttonCurrentClassName}`}
          disabled={!cw.onToggleAnagramHelper}
          onClick={cw.onToggleAnagramHelper ? cw.onToggleAnagramHelper.bind(cw) : undefined}
          key="anagram"
          data-link-name="Show anagram helper"
        >
          Anagram helper
        </button>
      );

      if (hasSolutions) {
        controls.clue.unshift(
          <button
            className={`${buttonClassName} ${buttonCurrentClassName}`}
            disabled={!cw.onCheat}
            onClick={cw.onCheat ? cw.onCheat.bind(cw) : undefined}
            key="cheat"
            data-link-name="Reveal this"
          >
            Reveal this
          </button>
        );
        controls.clue.unshift(
          <button
            className={`${buttonClassName} ${buttonCurrentClassName}`}
            disabled={!cw.onCheck}
            onClick={cw.onCheck ? cw.onCheck.bind(cw) : undefined}
            key="check"
            data-link-name="Check this"
          >
            Check this
          </button>
        );
      }
    }

    return (
      <div className="crossword__controls">
        <div className="crossword__controls__clue">{controls.clue}</div>
        <div className="crossword__controls__grid">{controls.grid}</div>
      </div>
    );
  }
}

export { Controls };
