export default function Button({
  as: Component = 'button',
  className = '',
  children,
  variant = 'primary',
  ...props
}) {
  const variantClass =
    variant === 'secondary'
      ? 'doc-button doc-button-secondary'
      : variant === 'ghost'
        ? 'doc-button border border-white/10 bg-transparent'
        : variant === 'danger'
          ? 'doc-button border border-red-500/30 bg-red-500/10 text-red-200'
          : 'doc-button doc-button-primary';

  return (
    <Component className={`${variantClass} ${className}`} {...props}>
      {children}
    </Component>
  );
}
