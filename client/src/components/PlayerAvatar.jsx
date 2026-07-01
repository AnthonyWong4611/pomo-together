export function PlayerAvatar({ compact = false, player }) {
  const sizeClass = compact ? "avatar compact-avatar" : "avatar";
  const style = compact
    ? { backgroundColor: player.color }
    : {
        backgroundColor: player.color,
        transform: `translate(${player.position.x}px, ${player.position.y}px)`
      };

  return (
    <div className={sizeClass} style={style}>
      {player.avatarUrl ? (
        <img alt="" src={player.avatarUrl} />
      ) : (
        <span>{player.displayName.slice(0, 1).toUpperCase()}</span>
      )}
      {!compact ? <strong>{player.displayName}</strong> : null}
    </div>
  );
}
