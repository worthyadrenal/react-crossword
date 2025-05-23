import React, { Component } from 'react';
import closeCentralIcon from '../../../svgs/close.svg';
import { cellsForClue, getAnagramClueData } from '../helpers';
import shuffle from 'lodash/shuffle';
import { ClueInput } from './clue-input';
import { CluePreview } from './clue-preview';
import { Ring } from './ring';

class AnagramHelper extends Component {
  constructor() {
    super();
    this.state = {
      letters: [],
      clueInput: '',
      showInput: true,
    };
  }

  onClueInput(text) {
    if (!/\s|\d/g.test(text)) {
      this.setState({
        clueInput: text,
      });
    }
  }

  /**
     * Shuffle the letters in the user's input.
     *
     * First, create an array of input characters that have already been entered
     * into the grid. Then build a new collection of letters, using the first
     * array to flag letters that are already entered in the puzzle, and
     * shuffle it.
     *
     */
  // eslint-disable-next-line class-methods-use-this
  shuffleWord(word, entries) {
    const wordEntries = entries
      .map(entry => entry.value.toLowerCase())
      .filter(entry => word.includes(entry))
      .filter(Boolean)
      .sort();

    return shuffle(
      word
        .trim()
        .split('')
        .sort()
        .reduce(
          (acc, letter) => {
            const [head, ...tail] = acc.entries;
            const entered = head === letter.toLowerCase();

            return {
              letters: acc.letters.concat({
                value: letter,
                entered,
              }),
              entries: entered ? tail : acc.entries,
            };
          },
          {
            letters: [],
            entries: wordEntries,
          },
        ).letters,
    );
  }

  shuffle() {
    if (this.canShuffle()) {
      this.setState({
        letters: this.shuffleWord(this.state.clueInput, this.entries()),
        showInput: false,
      });
    }
  }

  reset() {
    if (this.state.clueInput) {
      this.setState({
        clueInput: '',
        showInput: true,
      });
    }
  }

  canShuffle() {
    return !!this.state.clueInput && this.state.clueInput.length > 0;
  }

  entries() {
    const cells = cellsForClue(
      this.props.entries,
      this.props.focussedEntry,
    );
    return cells.map(coords => Object.assign({}, this.props.grid[coords.x][coords.y], {
      key: `${coords.x},${coords.y}`,
    }));
  }

  render() {
    const closeIcon = {
      __html: closeCentralIcon,
    };
    const clue = getAnagramClueData(
      this.props.entries,
      this.props.focussedEntry,
    );

    const inner = this.state.showInput ? (
      <ClueInput
        value={this.state.clueInput}
        clue={clue}
        onChange={this.onClueInput.bind(this)}
        onEnter={this.shuffle.bind(this)}
      />
    ) : (
      <Ring letters={this.state.letters} />
    );

    return (
      <div
        className="crossword__anagram-helper-outer"
        data-link-name="Anagram Helper"
      >
        <div className="crossword__anagram-helper-inner">{inner}</div>
        <button
          className="button button--large button--tertiary crossword__anagram-helper-close"
          onClick={this.props.close.bind(this.props.crossword)}
          dangerouslySetInnerHTML={closeIcon}
          data-link-name="Close"
        />
        <button
          className={`button button--large ${
            !this.state.clueInput ? 'button--tertiary' : ''
          }`}
          onClick={this.reset.bind(this)}
          data-link-name="Start Again"
        >
          start again
        </button>
        <button
          className={`button button--large ${
            this.canShuffle() ? '' : 'button--tertiary'
          }`}
          onClick={this.shuffle.bind(this)}
          data-link-name="Shuffle"
        >
          shuffle
        </button>
        <CluePreview
          clue={clue}
          entries={this.entries()}
          letters={this.state.letters}
          hasShuffled={!this.state.showInput}
        />
      </div>
    );
  }
}

export { AnagramHelper };
