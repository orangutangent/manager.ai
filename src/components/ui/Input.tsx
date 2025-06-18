import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = (props) => (
  <input
    className="w-full border text-black rounded px-3 py-2 focus:outline-none focus:ring"
    {...props}
  />
);
