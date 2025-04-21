import React, { Component, createRef } from 'react';
import * as fastdom from 'fastdom';
import { classNames } from './classNames';
import { isBreakpoint } from '../lib/detect';
import { scrollTo } from '../lib/scroller';

class Clue extends Component {
  onClick = (e) => {
    e.preventDefault();
    this.props.setReturnPosition();
    this.props.focusFirstCellInClueById(this.props.id);
  };

  render() {
    return (
      <li>
        <a
          href={`#${this.props.id}`}
          onClick={this.onClick}
          className={classNames({
            crossword__clue: true,
            'crossword__clue--answered': this.props.hasAnswered,
            'crossword__clue--selected': this.props.isSelected,
            'crossword__clue--display-group-order':
              JSON.stringify(this.props.number) !== this.props.humanNumber,
          })}
        >
          <div className="crossword__clue__number">
            {this.props.humanNumber}
          </div>
          <div
            className="crossword__clue__text"
            dangerouslySetInnerHTML={{ __html: this.props.clue }}
          />
        </a>
      </li>
    );
  }
}

class Clues extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showGradient: true,
    };

    this.cluesRef = createRef();
    this.clueRefs = {}; // stores refs by clue ID
  }

  componentDidMount() {
    const cluesNode = this.cluesRef.current;
    const height = cluesNode.scrollHeight - cluesNode.clientHeight;

    cluesNode.addEventListener('scroll', (e) => {
      const showGradient = height - e.currentTarget.scrollTop > 25;
      if (this.state.showGradient !== showGradient) {
        this.setState({ showGradient });
      }
    });
  }

  componentDidUpdate(prev) {
    if (
      isBreakpoint({ min: 'tablet', max: 'leftCol' }) &&
      this.props.focussed &&
      (!prev.focussed || prev.focussed.id !== this.props.focussed.id)
    ) {
      fastdom.read(() => {
        this.scrollIntoView(this.props.focussed);
      });
    }
  }

  scrollIntoView(clue) {
    const buffer = 100;
    const cluesNode = this.cluesRef.current;
    const node = this.clueRefs[clue.id]?.ref?.current;

    if (!node) return;

    const visible =
      node.offsetTop - buffer > cluesNode.scrollTop &&
      node.offsetTop + buffer < cluesNode.scrollTop + cluesNode.clientHeight;

    if (!visible) {
      const offset = node.offsetTop - cluesNode.clientHeight / 2;
      scrollTo(offset, 250, 'easeOutQuad', cluesNode);
    }
  }

  render() {
    const headerClass = 'crossword__clues-header';

    const cluesByDirection = (direction) =>
      this.props.clues
        .filter((clue) => clue.entry.direction === direction)
        .map((clue) => {
          const ref = React.createRef();
          this.clueRefs[clue.entry.id] = { ref };

          return (
            <Clue
              ref={ref}
              id={clue.entry.id}
              key={clue.entry.id}
              number={clue.entry.number}
              humanNumber={clue.entry.humanNumber}
              clue={clue.entry.clue}
              hasAnswered={clue.hasAnswered}
              isSelected={clue.isSelected}
              focusFirstCellInClueById={this.props.focusFirstCellInClueById}
              setReturnPosition={() => {
                this.props.setReturnPosition(window.scrollY);
              }}
            />
          );
        });

    return (
      <div
        className={`crossword__clues--wrapper ${
          this.state.showGradient ? '' : 'hide-gradient'
        }`}
      >
        <div className="crossword__clues" ref={this.cluesRef}>
          <div className="crossword__clues--across">
            <h3 className={headerClass}>Across</h3>
            <ol className="crossword__clues-list">{cluesByDirection('across')}</ol>
          </div>
          <div className="crossword__clues--down">
            <h3 className={headerClass}>Down</h3>
            <ol className="crossword__clues-list">{cluesByDirection('down')}</ol>
          </div>
        </div>
        <div className="crossword__clues__gradient" />
      </div>
    );
  }
}

export { Clues };
