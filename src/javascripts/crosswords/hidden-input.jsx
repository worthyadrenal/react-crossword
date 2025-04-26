import React, { Component } from 'react';

class HiddenInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
    };
  }

  onClick(event) {
    const cw = this.props.crossword || {};
    if (typeof cw.onClickHiddenInput === 'function') {
      cw.onClickHiddenInput(event);
    }
  }

  onKeyDown(event) {
    const cw = this.props.crossword || {};
    if (typeof cw.onKeyDown === 'function') {
      cw.onKeyDown(event);
    }
  }

  onBlur(event) {
    const cw = this.props.crossword || {};
    if (typeof cw.goToReturnPosition === 'function') {
      cw.goToReturnPosition(event);
    }
  }

  onFocusPrevious() {
    const cw = this.props.crossword || {};
    if (typeof cw.focusPreviousClue === 'function') {
      cw.focusPreviousClue();
    }
  }

  onFocusNext() {
    const cw = this.props.crossword || {};
    if (typeof cw.focusNextClue === 'function') {
      cw.focusNextClue();
    }
  }

  touchStart(event) {
    const cw = this.props.crossword || {};
    if (typeof cw.onClickHiddenInput === 'function') {
      cw.onClickHiddenInput(event);
    }
  }

  handleChange(event) {
    const cw = this.props.crossword || {};
    if (typeof cw.insertCharacter === 'function') {
      cw.insertCharacter(event.target.value);
    }
    this.setState({
      value: '',
    });
  }

  focusHiddenInput(x, y) {
    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    return (
      <div
        className="crossword__hidden-input-wrapper"
        ref={(wrapper) => {
          this.wrapper = wrapper;
        }}
      >
        <input
          key="1"
          type="text"
          className="crossword__hidden-input-prev-next"
          onFocus={this.onFocusPrevious.bind(this)}
        />
        <input
          key="2"
          type="text"
          className="crossword__hidden-input"
          maxLength="1"
          onClick={this.onClick.bind(this)}
          onChange={this.handleChange.bind(this)}
          onTouchStart={this.touchStart.bind(this)}
          onKeyDown={this.onKeyDown.bind(this)}
          onBlur={this.onBlur.bind(this)}
          value={this.state.value}
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          ref={(input) => { this.input = input; }}
        />
        <input
          key="3"
          type="text"
          className="crossword__hidden-input-prev-next"
          onFocus={this.onFocusNext.bind(this)}
        />
      </div>
    );
  }
}

export { HiddenInput };
