import * as React from "react";

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="#000000"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.92749 6.82V17.18C6.92749 17.97 7.79749 18.45 8.46749 18.02L16.6075 12.84C17.2275 12.45 17.2275 11.55 16.6075 11.15L8.46749 5.98C7.79749 5.55 6.92749 6.03 6.92749 6.82Z"
        fill="black"
      />
    </svg>
  );
}

export default Play;
