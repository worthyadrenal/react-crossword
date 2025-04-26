import React, { Component } from 'react';

class HiddenInput extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  onClick = (event) => {
    this.props.crossword.onClickHiddenInput(event);
  };

  onKeyDown = (event) => {
    const { cellInFocus, directionOfEntry } = this.props.crossword.state;
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      if (cellInFocus && directionOfEntry) {
        const { x, y } = cellInFocus;
        const dx = directionOfEntry === 'across' ? -1 : 0;
        const dy = directionOfEntry === 'down' ? -1 : 0;
        const prevX = x + dx;
        const prevY = y + dy;
        // Clear previous cell
        this.props.crossword.onMove({ x: prevX, y: prevY, value: '' });
        // Focus that cell
        this.props.crossword.focusClue(prevX, prevY, directionOfEntry);
      }
    } else {
      this.props.crossword.onKeyDown(event);
    }
  };

  onBlur = (event) => {
    this.props.crossword.goToReturnPosition(event);
  };

  onFocusPrevious = () => {
    this.props.crossword.focusPreviousClue();
  };

  onFocusNext = () => {
    this.props.crossword.focusNextClue();
  };

  touchStart = (event) => {
    this.props.crossword.onClickHiddenInput(event);
  };

  handleChange = (event) => {
    // Transform to uppercase
    const char = event.target.value.toUpperCase();
    // Insert into crossword
    this.props.crossword.insertCharacter(char);
    // Reset input
    this.setState({ value: '' });
    // Move to next cell automatically
    const { cellInFocus, directionOfEntry } = this.props.crossword.state;
    if (cellInFocus && directionOfEntry) {
      const { x, y } = cellInFocus;
      const dx = directionOfEntry === 'across' ? 1 : 0;
      const dy = directionOfEntry === 'down' ? 1 : 0;
      this.props.crossword.focusClue(x + dx, y + dy, directionOfEntry);
    }
  };

  render() {
    return (
      <div
        className="crossword__hidden-input-wrapper"
        ref={(wrapper) => { this.wrapper = wrapper; }}
      >
        <input
          key="prev"
          type="text"
          className="crossword__hidden-input-prev-next"
          onFocus={this.onFocusPrevious}
        />
        <input
          key="main"
          type="text"
          className="crossword__hidden-input"
          maxLength="1"
          onClick={this.onClick}
          onChange={this.handleChange}
          onTouchStart={this.touchStart}
          onKeyDown={this.onKeyDown}
          onBlur={this.onBlur}
          value={this.state.value}
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          ref={(input) => { this.input = input; }}
        />
        <input
          key="next"
          type="text"
          className="crossword__hidden-input-prev-next"
          onFocus={this.onFocusNext}
        />
      </div>
    );
  }
}

export { HiddenInput };
