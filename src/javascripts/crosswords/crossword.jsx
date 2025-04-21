import '../../stylesheets/main.scss';
import React, { Component, createRef } from 'react';
import * as fastdom from 'fastdom';
import $ from '../lib/$';
import mediator from '../lib/mediator';
import { isBreakpoint } from '../lib/detect';
import { scrollTo } from '../lib/scroller';
import { addEventListener } from '../lib/events';
import { AnagramHelper } from './anagram-helper/main';
import debounce from 'lodash/debounce';
import zip from 'lodash/zip';
import { Clues } from './clues';
import { Controls } from './controls';
import { HiddenInput } from './hidden-input';
import { Grid } from './grid';
import {
  buildClueMap,
  buildGrid,
  otherDirection,
  entryHasCell,
  cluesFor,
  mapGrid,
  getClearableCellsForClue,
  getLastCellInClue,
  getPreviousClueInGroup,
  isFirstCellInClue,
  getNextClueInGroup,
  isLastCellInClue,
  gridSize,
  checkClueHasBeenAnswered,
  buildSeparatorMap,
  cellsForEntry,
} from './helpers';
import { keycodes } from './keycodes';
import { saveGridState, loadGridState } from './persistence';
import { classNames } from './classNames';

class Crossword extends Component {
  // Refs
  stickyClueWrapperRef = createRef();
  gameRef = createRef();
  gridWrapperRef = createRef();
  hiddenInputComponent = {};

  constructor(props) {
    super(props);
    const { cols: columns, rows } = props.data.dimensions;
    this.columns = columns;
    this.rows = rows;
    this.clueMap = buildClueMap(props.data.entries);
    this.state = {
      grid: buildGrid(
        props.data.dimensions.rows,
        props.data.dimensions.cols,
        props.data.entries,
        props.loadGrid(props.id),
      ),
      cellInFocus: null,
      directionOfEntry: null,
      showAnagramHelper: false,
    };
  }

  componentDidMount = () => {
    const $sticky = $(this.stickyClueWrapperRef.current);
    const $game = $(this.gameRef.current);
    mediator.on('window:resize', debounce(this.setGridHeight, 200));
    mediator.on('window:orientationchange', debounce(this.setGridHeight, 200));
    this.setGridHeight();
    addEventListener(window, 'scroll', this.handleScroll);
    const entryId = window.location.hash.replace('#', '');
    this.focusFirstCellInClueById(entryId);
  };

  handleScroll = () => {
    const $sticky = $(this.stickyClueWrapperRef.current);
    const $game = $(this.gameRef.current);
    const gameOffset = $game.offset();
    const stickyOffset = $sticky.offset();
    const scrollY = window.scrollY;
    const past = scrollY - gameOffset.top;
    if (past >= 0) {
      const bottom = gameOffset.top + gameOffset.height;
      if (scrollY > bottom - stickyOffset.height) {
        $sticky.css({ top: 'auto', bottom: 0 });
      } else {
        $sticky.css({ top: past, bottom: '' });
      }
    } else {
      $sticky.css({ top: '', bottom: '' });
    }
  };

  setGridHeight = () => {
    if (!this.$gridWrapper) {
      this.$gridWrapper = $(this.gridWrapperRef.current);
    }
    if (isBreakpoint({ max: 'tablet' })) {
      fastdom.read(() => {
        fastdom.write(() => {
          this.$gridWrapper.css(
            'height',
            `${this.$gridWrapper.offset().width}px`,
          );
        });
        this.gridHeightIsSet = true;
      });
    } else if (this.gridHeightIsSet) {
      this.$gridWrapper.attr('style', '');
    }
  };

  onKeyDown = (event) => {
    const cell = this.state.cellInFocus;
    if (!event.metaKey && !event.ctrlKey && !event.altKey) {
      const { keyCode } = event;
      if (keyCode === keycodes.backspace || keyCode === keycodes.delete) {
        event.preventDefault();
        if (cell) {
          if (this.cellIsEmpty(cell.x, cell.y)) {
            this.focusPrevious();
          } else {
            this.setCellValue(cell.x, cell.y, '');
            this.saveGrid();
          }
        }
      } else if ([keycodes.left, keycodes.up, keycodes.right, keycodes.down].includes(keyCode)) {
        event.preventDefault();
        const moves = {
          [keycodes.left]: [-1, 0],
          [keycodes.up]: [0, -1],
          [keycodes.right]: [1, 0],
          [keycodes.down]: [0, 1],
        };
        const [dx, dy] = moves[keyCode];
        this.moveFocus(dx, dy);
      }
    }
  };

  onSelect = (x, y) => {
    const cell = this.state.cellInFocus;
    const clue = cluesFor(this.clueMap, x, y);
    const focussed = this.clueInFocus();
    let newDirection;
    const isInClue = focussed ? entryHasCell(focussed, x, y) : false;
    if (cell && cell.x === x && cell.y === y && this.state.directionOfEntry) {
      newDirection = otherDirection(this.state.directionOfEntry);
      if (clue[newDirection]) this.focusClue(x, y, newDirection);
    } else if (isInClue && this.state.directionOfEntry) {
      this.focusClue(x, y, this.state.directionOfEntry);
    } else {
      this.setState({ cellInFocus: { x, y } });
      const isStart = (c) => c && c.position.x === x && c.position.y === y;
      if (!isStart(clue.across) && isStart(clue.down)) newDirection = 'down';
      else if (clue.across) newDirection = 'across';
      else newDirection = 'down';
      this.focusClue(x, y, newDirection);
    }
  };

  onCheat = () => { this.allHighlightedClues().forEach(this.cheat); this.saveGrid(); };
  onCheck = () => { this.allHighlightedClues().forEach(this.check); this.saveGrid(); };
  onSolution = () => { this.props.data.entries.forEach(this.cheat); this.saveGrid(); };
  onCheckAll = () => { this.props.data.entries.forEach(this.check); this.saveGrid(); };
  onClearAll = () => {
    this.setState({ grid: mapGrid(this.state.grid, (cell, x, y) => { cell.value = ''; this.props.onMove({ x, y, value: '', previousValue: cell.value }); return cell; }) });
    this.saveGrid();
  };
  onClearSingle = () => {
    const clue = this.clueInFocus();
    if (!clue) return;
    const cells = getClearableCellsForClue(this.state.grid, this.clueMap, this.props.data.entries, clue);
    this.setState({ grid: mapGrid(this.state.grid, (c, x, y) => { if (cells.some(other => other.x === x && other.y === y)) { c.value = ''; this.props.onMove({ x, y, value: '', previousValue: c.value }); } return c; }) });
    this.saveGrid();
  };
  onToggleAnagramHelper = () => { this.setState((s) => ({ showAnagramHelper: !s.showAnagramHelper })); };
  onClickHiddenInput = (e) => { if (this.state.cellInFocus) this.onSelect(this.state.cellInFocus.x, this.state.cellInFocus.y); if (e.type === 'touchstart') e.preventDefault(); };

  clueInFocus = () => {
    const cell = this.state.cellInFocus;
    if (!cell) return null;
    const clues = cluesFor(this.clueMap, cell.x, cell.y);
    return this.state.directionOfEntry ? clues[this.state.directionOfEntry] : null;
  };

  focusClue = (x, y, direction) => {
    const clues = cluesFor(this.clueMap, x, y)[direction];
    if (!clues) return;
    this.focusHiddenInput(x, y);
    this.setState({ cellInFocus: { x, y }, directionOfEntry: direction });
    window.history.replaceState(undefined, document.title, `#${clues.id}`);
    this.props.onFocusClue({ x, y, clueId: clues.id });
  };

  focusFirstCellInClueById = (id) => {
    const entry = this.props.data.entries.find((e) => e.id === id);
    if (entry) this.focusClue(entry.position.x, entry.position.y, entry.direction);
  };
  focusCurrentCell = () => { const cell = this.state.cellInFocus; if (cell) this.focusHiddenInput(cell.x, cell.y); };

  findNextEditableCell = (dx, dy) => {
    const cell = this.state.cellInFocus;
    if (!cell) return null;
    let { x, y } = cell;
    while (true) {
      if (dy) y = (y + dy + this.rows) % this.rows;
      if (dx) x = (x + dx + this.columns) % this.columns;
      if (this.state.grid[x][y]?.isEditable) return { x, y };
    }
  };
  isHighlighted(x, y) {
    return false;
    };
    
  moveFocus = (dx, dy) => { const cell = this.findNextEditableCell(dx, dy); if (cell) { const dir = dx ? 'across' : 'down'; this.focusClue(cell.x, cell.y, dir); } };
  focusPrevious = () => { /* similar logic */ };
  focusNext = () => { /* similar logic */ };

  asPercentage = (x, y) => ({ x: (100 * x) / gridSize(this.columns), y: (100 * y) / gridSize(this.rows) });
  hiddenInputValue = () => { const c = this.state.cellInFocus; return c ? this.state.grid[c.x][c.y].value || '' : ''; };
  hasSolutions = () => 'solution' in this.props.data.entries[0];
  cluesData = () => this.props.data.entries.map((entry) => ({ entry, hasAnswered: checkClueHasBeenAnswered(this.state.grid, entry), isSelected: this.clueInFocus()?.group.includes(entry.id) }));
  allHighlightedClues = () => this.props.data.entries.filter((e) => this.clueInFocus()?.group.includes(e.id));

  cheat = (entry) => { const cells = cellsForEntry(entry); this.setState({ grid: mapGrid(this.state.grid, (c, x, y) => { if (cells.some((v) => v.x === x && v.y === y)) { c.value = entry.solution[(entry.direction === 'across') ? x - entry.position.x : y - entry.position.y]; this.props.onMove({ x, y, value: c.value, previousValue: c.value }); } return c; }) }); };
  check = (entry) => { const bad = zip(cellsForEntry(entry), entry.solution.split('')).filter(([c, sol]) => /^[A-Za-z]$/.test(this.state.grid[c.x][c.y].value) && this.state.grid[c.x][c.y].value !== sol).map(([c]) => c);
    this.setState({ grid: mapGrid(this.state.grid, (c, x, y) => { if (bad.some((b) => b.x === x && b.y === y)) { c.value = ''; this.props.onMove({ x, y, value: '', previousValue: c.value }); } return c; }) }); };

  saveGrid = () => { this.props.saveGrid(this.props.id, this.state.grid.map((row) => row.map((c) => c.value))); };

  render() {
    const focused = this.clueInFocus();
    const anagramHelper = this.state.showAnagramHelper && (
      <AnagramHelper
        key={focused?.id}
        crossword={this}
        focussedEntry={focused}
        entries={this.props.data.entries}
        grid={this.state.grid}
        close={this.onToggleAnagramHelper}
      />
    );

    const gridProps = {
      rows: this.rows,
      columns: this.columns,
      cells: this.state.grid,
      separators: buildSeparatorMap(this.props.data.entries),
      crossword: this,
      focussedCell: this.state.cellInFocus,
      ref: (grid) => { this.grid = grid; },
    };

    return (
      <div
        className={`crossword__container crossword__container--${this.props.data.crosswordType} crossword__container--react`}
        data-link-name="Crosswords"
      >
        {/* sticky clue wrapper */}
        <div className="crossword__container__game" ref={this.gameRef}>
          <div className="crossword__sticky-clue-wrapper" ref={this.stickyClueWrapperRef}>
            {/* … */}
          </div>
          <div className="crossword__container__grid-wrapper" ref={this.gridWrapperRef}>
            {Grid(gridProps)}
            <HiddenInput
              crossword={this}
              value={this.hiddenInputValue()}
              ref={(comp) => { this.hiddenInputComponent = comp; }}
            />
            {anagramHelper}
          </div>
        </div>

        <Controls
          hasSolutions={this.hasSolutions()}
          clueInFocus={focused}
          crossword={this}
        />

        <Clues
          clues={this.cluesData()}
          focussed={focused}
          focusFirstCellInClueById={this.focusFirstCellInClueById}
          setReturnPosition={this.setReturnPosition}
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
