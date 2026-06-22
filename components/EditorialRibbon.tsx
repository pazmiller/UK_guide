interface EditorialRibbonProps
{
  className?: string;
}

export default function EditorialRibbon( { className = '' }: EditorialRibbonProps )
{
  return (
    <svg
      viewBox="0 0 1200 90"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M-40 49C155 8 321 75 513 42C733 4 911 69 1240 26"
        fill="none"
        stroke="#1D3557"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path
        d="M-40 64C158 23 325 90 517 57C737 19 916 84 1240 41"
        fill="none"
        stroke="#E63946"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M-40 57C157 16 323 83 515 50C735 12 913 77 1240 34"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
