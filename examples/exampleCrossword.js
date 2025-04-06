import React from 'react';
import ReactDOM from 'react-dom';
import Crossword from '../src/javascripts/crosswords/Crossword';

const crosswordData = {
  id: 'simple/1',
  number: 1,
  name: 'Simple Crossword 1',
  date: 1542326400000,
  entries: [
    {
      id: '1-across',
      number: 1,
      humanNumber: '1',
      clue: 'Toy on a string (2-2)',
      direction: 'across',
      length: 4,
      group: ['1-across'],
      position: { x: 0, y: 0 },
      separatorLocations: { '-': [2] },
      solution: 'YOYO'
    },
    // ... other entries
  ],
  solutionAvailable: true,
  dateSolutionAvailable: 1542326400000,
  dimensions: { cols: 13, rows: 13 },
  crosswordType: 'quick'
};

const container = document.getElementById('root');
ReactDOM.render(
<Crossword data={crosswordData} />, <Crossword data={crosswordData} />);

