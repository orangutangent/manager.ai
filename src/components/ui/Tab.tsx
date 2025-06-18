import React from "react";
import { Tab as HeadlessTab } from "@headlessui/react";
import clsx from "clsx";

export interface TabProps {
  tabs: string[];
  selectedIndex: number;
  onChange: (idx: number) => void;
}

export const Tab: React.FC<TabProps> = ({ tabs, selectedIndex, onChange }) => (
  <HeadlessTab.Group selectedIndex={selectedIndex} onChange={onChange}>
    <HeadlessTab.List className="flex gap-2 mb-4">
      {tabs.map((tab) => (
        <HeadlessTab
          key={tab}
          className={({ selected }) =>
            clsx(
              "px-4 py-2 rounded-t-lg font-semibold",
              selected ? "bg-white shadow" : "bg-gray-200"
            )
          }
        >
          {tab}
        </HeadlessTab>
      ))}
    </HeadlessTab.List>
  </HeadlessTab.Group>
);
