export function LoadingIndicator({
  label = "Loading",
  size = "medium",
  fullScreen = false,
  className = "",
}) {
  const classes = [
    "portal-loading",
    `portal-loading--${size}`,
    fullScreen ? "portal-loading--screen" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
    >
      <span className="portal-loading__spinner" aria-hidden="true" />
      {label && <span className="portal-loading__label">{label}</span>}
    </div>
  );
}
