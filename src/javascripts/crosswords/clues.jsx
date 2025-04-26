import React, { useEffect, useRef, useState } from 'react';
import { classNames } from './classNames';
import { isBreakpoint } from '../lib/detect';
import { scrollTo } from '../lib/scroller';

const Clue = ({ id, number, humanNumber, clue, hasAnswered, isSelected, focusFirstCellInClueById, setReturnPosition }) => {
  const ref = useRef();

  const handleClick = (e) => {
    e.preventDefault();
    setReturnPosition(window.scrollY);
    focusFirstCellInClueById(id);
  };

  return (
    <li ref={ref}>
      <a
        href={`#${id}`}
        onClick={handleClick}
        className={classNames({
          crossword__clue: true,
          'crossword__clue--answered': hasAnswered,
          'crossword__clue--selected': isSelected,
          'crossword__clue--display-group-order': JSON.stringify(number) !== humanNumber,
        })}
      >
        <div className="crossword__clue__number">{humanNumber}</div>
        <div
          className="crossword__clue__text"
          dangerouslySetInnerHTML={{ __html: clue }}
        />
      </a>
    </li>
  );
};

export const Clues = ({ clues, focussed, focusFirstCellInClueById, setReturnPosition }) => {
  const cluesRef = useRef();
  const clueRefs = useRef({});
  const [showGradient, setShowGradient] = useState(true);

  useEffect(() => {
    const cluesNode = cluesRef.current;
    const updateGradient = () => {
      const height = cluesNode.scrollHeight - cluesNode.clientHeight;
      const show = height - cluesNode.scrollTop > 25;
      setShowGradient(show);
    };

    cluesNode.addEventListener('scroll', updateGradient);
    return () => cluesNode.removeEventListener('scroll', updateGradient);
  }, []);

  useEffect(() => {
    if (
      isBreakpoint({ min: 'tablet', max: 'leftCol' }) &&
      focussed
    ) {
      const node = clueRefs.current[focussed.id];
      if (node) {
        const cluesNode = cluesRef.current;
        const buffer = 100;
        const visible =
          node.offsetTop - buffer > cluesNode.scrollTop &&
          node.offsetTop + buffer < cluesNode.scrollTop + cluesNode.clientHeight;

        if (!visible) {
          const offset = node.offsetTop - cluesNode.clientHeight / 2;
          scrollTo(offset, 250, 'easeOutQuad', cluesNode);
        }
      }
    }
  }, [focussed]);

  const cluesByDirection = (direction) =>
    clues
      .filter((clue) => clue.entry.direction === direction)
      .map((clue) => {
        const refCallback = (node) => {
          if (node) {
            clueRefs.current[clue.entry.id] = node;
          }
        };

        return (
          <Clue
            key={clue.entry.id}
            id={clue.entry.id}
            number={clue.entry.number}
            humanNumber={clue.entry.humanNumber}
            clue={clue.entry.clue}
            hasAnswered={clue.hasAnswered}
            isSelected={clue.isSelected}
            focusFirstCellInClueById={focusFirstCellInClueById}
            setReturnPosition={setReturnPosition}
            ref={refCallback}
          />
        );
      });

  return (
    <div
      className={`crossword__clues--wrapper ${showGradient ? '' : 'hide-gradient'}`}
    >
      <div className="crossword__clues" ref={cluesRef}>
        <div className="crossword__clues--across">
          <h3 className="crossword__clues-header">Across</h3>
          <ol className="crossword__clues-list">{cluesByDirection('across')}</ol>
        </div>
        <div className="crossword__clues--down">
          <h3 className="crossword__clues-header">Down</h3>
          <ol className="crossword__clues-list">{cluesByDirection('down')}</ol>
        </div>
      </div>
      <div className="crossword__clues__gradient" />
    </div>
  );
};
