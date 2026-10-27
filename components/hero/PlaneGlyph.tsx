/**
 * Small isometric three-layer mark for the mobile cards. The highlighted
 * layer tells you which plane the card is about without reading the label.
 */
export default function PlaneGlyph({ index }: { index: number }) {
  const ys = [14, 28, 42];
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false">
      {ys.map((y, i) => (
        <polygon
          key={y}
          points={`28,${y - 9} 50,${y} 28,${y + 9} 6,${y}`}
          className={i === index ? "glyph-on" : "glyph-off"}
        />
      ))}
    </svg>
  );
}
