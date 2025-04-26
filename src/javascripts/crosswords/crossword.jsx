import '../../stylesheets/main.scss';
import React, { Component, createRef } from 'react';
import $ from '../lib/$';
import debounce from 'lodash/debounce';
import mediator from '../lib/mediator';
import { isBreakpoint } from '../lib/detect';
import { addEventListener } from '../lib/events';
import { Clues } from './clues';
import { Controls } from './controls';
import { HiddenInput } from './hidden-input';
import { Grid } from './grid';
import {
  buildClueMap,
  buildGrid,
  otherDirection,
  cluesFor,
  entryHasCell,
  mapGrid,
  cellsForEntry,
  gridSize,
  checkClueHasBeenAnswered,
  buildSeparatorMap,
} from './helpers';
import { saveGridState, loadGridState } from './persistence';
import { constants } from './constants';

class Crossword extends Component {
  // Initialize state up front to avoid setState before mount
  state = (() => {
    const { cols, rows } = this.props.data.dimensions;
    return {
      grid: buildGrid(
        rows,
        cols,
        this.props.data.entries,
        this.props.loadGrid(this.props.id)
      ),
      cellInFocus: null,
      directionOfEntry: null,
      showAnagramHelper: false,
    };
  })();

  stickyClueWrapperRef = createRef();
  gameRef = createRef();
  gridWrapperRef = createRef();
  hiddenInputRef = createRef();

  constructor(props) {
    super(props);
    const { cols, rows } = props.data.dimensions;
    this.columns = cols;
    this.rows = rows;
    this.clueMap = buildClueMap(props.data.entries);
    // Note: state is already initialized above, no need for this.state here
  }

  componentDidMount() {
    mediator.on('window:resize', debounce(this.setGridHeight, 200));
    mediator.on('window:orientationchange', debounce(this.setGridHeight, 200));
    this.setGridHeight();
    addEventListener(window, 'scroll', this.handleScroll);

    const entryId = window.location.hash.replace('#', '');
    if (entryId) {
      this.focusFirstCellInClueById(entryId);
    }
  }

  setGridHeight = () => {
    const wrapper = $(this.gridWrapperRef.current);
    if (isBreakpoint({ max: 'tablet' })) {
      wrapper.css('height', `${wrapper.offset().width}px`);
    } else {
      wrapper.attr('style', '');
    }
  };

  handleScroll = () => {
    const sticky = $(this.stickyClueWrapperRef.current);
    const game = $(this.gameRef.current);
    const scrollY = window.scrollY;
    const past = scrollY - game.offset().top;

    if (past >= 0) {
      const bottom = game.offset().top + game.offset().height;
      if (scrollY > bottom - sticky.offset().height) {
        sticky.css({ top: 'auto', bottom: 0 });
      } else {
        sticky.css({ top: past, bottom: '' });
      }
    } else {
      sticky.css({ top: '', bottom: '' });
    }
  };

  /**
   * Move & focus the hidden input over the clicked cell
   */
  focusHiddenInput = (x, y) => {
    const node = this.hiddenInputRef.current;
    if (!node) return;

    const top = gridSize(y);
    const left = gridSize(x);
    const size = constants.cellSize;

    node.wrapper.style.top = `${top}px`;
    node.wrapper.style.left = `${left}px`;
    node.wrapper.style.width = `${size}px`;
    node.wrapper.style.height = `${size}px`;

    node.input.focus();
  };

  /**
   * Handler for click on hidden input area
   */
  onClickHiddenInput = (event) => {
    const { cellInFocus } = this.state;
    if (cellInFocus) {
      this.focusHiddenInput(cellInFocus.x, cellInFocus.y);
    }
  };

  /**
   * Insert a character into current focused cell
   */
  insertCharacter = (char) => {
    const { cellInFocus } = this.state;
    if (!cellInFocus) return;
    this.onMove({ x: cellInFocus.x, y: cellInFocus.y, value: char });
  };

  /**
   * Handle keyboard events (letters, backspace, arrows)
   */
  onKeyDown = (event) => {
    const key = event.key;
    if (/^[a-zA-Z]$/.test(key)) {
      this.insertCharacter(key.toUpperCase());
    } else if (key === 'Backspace') {
      this.insertCharacter('');
    } else {
      const { x, y } = this.state.cellInFocus || {};
      if (key === 'ArrowLeft' && x > 0) {
        this.focusHiddenInput(x - 1, y);
      } else if (key === 'ArrowRight' && x < this.columns - 1) {
        this.focusHiddenInput(x + 1, y);
      } else if (key === 'ArrowUp' && y > 0) {
        this.focusHiddenInput(x, y - 1);
      } else if (key === 'ArrowDown' && y < this.rows - 1) {
        this.focusHiddenInput(x, y + 1);
      }
    }
    if (key.startsWith('Arrow') || key === 'Backspace') {
      event.preventDefault();
    }
  };

  focusClue = (x, y, direction) => {
    const clue = cluesFor(this.clueMap, x, y)[direction];
    if (!clue) return;
    this.focusHiddenInput(x, y);
    this.setState({ cellInFocus: { x, y }, directionOfEntry: direction });
    window.history.replaceState(undefined, document.title, `#${clue.id}`);
    this.props.onFocusClue({ x, y, clueId: clue.id });
  };

  focusFirstCellInClueById = (clueId) => {
    const entry = this.props.data.entries.find((e) => e.id === clueId);
    if (entry) {
      const firstCell = cellsForEntry(entry)[0];
      this.focusClue(firstCell.x, firstCell.y, entry.direction);
    }
  };

  onSelect = (x, y) => {
    const clues = cluesFor(this.clueMap, x, y);
    const focussed = this.clueInFocus();
    let newDirection;

    if (
      this.state.cellInFocus?.x === x &&
      this.state.cellInFocus?.y === y
    ) {
      newDirection = otherDirection(this.state.directionOfEntry);
      if (clues[newDirection]) this.focusClue(x, y, newDirection);
    } else if (focussed && entryHasCell(focussed, x, y)) {
      this.focusClue(x, y, this.state.directionOfEntry);
    } else {
      if (clues.across) this.focusClue(x, y, 'across');
      else if (clues.down) this.focusClue(x, y, 'down');
    }
  };

  clueInFocus = () => {
    const cell = this.state.cellInFocus;
    if (!cell) return null;
    const clues = cluesFor(this.clueMap, cell.x, cell.y);
    return this.state.directionOfEntry ? clues[this.state.directionOfEntry] : null;
  };

  onMove = ({ x, y, value }) => {
    const prevValue = this.state.grid[x][y].value;
    const newGrid = mapGrid(this.state.grid, (cell, cx, cy) => {
      if (cx === x && cy === y) {
        cell.value = value;
      }
      return cell;
    });
    this.setState({ grid: newGrid });
    this.props.onMove({ x, y, value, previousValue: prevValue });
    this.focusHiddenInput(x, y);
  };

  goToReturnPosition = () => {
    const { cellInFocus } = this.state;
    if (cellInFocus) {
      this.focusHiddenInput(cellInFocus.x, cellInFocus.y);
    }
  };

  render() {
    const focused = this.clueInFocus();
    const gridProps = {
      rows: this.rows,
      columns: this.columns,
      cells: this.state.grid,
      separators: buildSeparatorMap(this.props.data.entries),
      crossword: this,
      focussedCell: this.state.cellInFocus,
    };

    return (
      <div className={`crossword__container crossword__container--${this.props.data.crosswordType}`}>
        <div className="crossword__container__game" ref={this.gameRef}>
          <div className="crossword__sticky-clue-wrapper" ref={this.stickyClueWrapperRef}></div>
          <div className="crossword__container__grid-wrapper" ref={this.gridWrapperRef}>
            <Grid {...gridProps} onSelect={this.onSelect} />
            <HiddenInput
              ref={this.hiddenInputRef}
              crossword={this}
              value=""
              onClickHiddenInput={this.onClickHiddenInput}
              onKeyDown={this.onKeyDown}
              insertCharacter={this.insertCharacter}
            />
          </div>
        </div>
        <Controls
          hasSolutions={!!this.props.data.entries.find((e) => e.solution)}
          clueInFocus={focused}
          crossword={this}
        />
        <Clues
          clues={this.props.data.entries.map((entry) => ({
            entry,
            hasAnswered: checkClueHasBeenAnswered(this.state.grid, entry),
            isSelected: focused?.group.includes(entry.id),
          }))}
          focussed={focused}
          focusFirstCellInClueById={() => {}}
        />
      </div>
    );
  }
}

Crossword.defaultProps = {
  onMove: () => {},
  onFocusClue: () => {},
  loadGrid: (id) => loadGridState(id),
  saveGrid: (id, grid) => saveGridState(id, grid),
};

export default Crossword;
