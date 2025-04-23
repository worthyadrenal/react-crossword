import React, { useEffect, useState } from 'react';
import Crossword from 'react-crossword';

const CrosswordViewer = ({ puzzleId = 'cryptic/29675' }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchCrossword = async () => {
      try {
        const res = await fetch(`/api/crossword/${puzzleId}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error loading crossword:', err);
      }
    };

    fetchCrossword();
  }, [puzzleId]);

  if (!data) return <p>Loading crossword...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>{data.name}</h2>
      <Crossword data={data} />
    </div>
  );
};

export default CrosswordViewer;
