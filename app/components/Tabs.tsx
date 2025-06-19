import { useNavigate } from '@remix-run/react';
import type { IconType } from 'react-icons';


export interface Tabs2Props {
  itemsGrow?: boolean;
  tabs: {
    Icon?: IconType;
    ActiveIcon?: IconType;
    label: string;
    href?: string;
    onClick?: () => void;
    isActive?: () => boolean;
  }[];
}

export function Tabs2({ tabs, itemsGrow = true }: Tabs2Props) {
  const navigate = useNavigate();
  return (
    <div
      className={`relative flex items-center gap-0 rounded bg-slate-100 p-1.5`}
    >
      {tabs.map((tab) => {
        const active = !!(tab.isActive && tab.isActive());
        const IconComponent = active ? tab.ActiveIcon ?? tab.Icon : tab.Icon;

        return (
          <div
            key={tab.label}
            className={`relative flex ${itemsGrow ? 'grow' : ''}`}
          >
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                console.log("Navigating to", tab.href);
                navigate(tab.href || '');
              }}
              className={`relative inline-flex grow items-center justify-center rounded border px-4 py-2 text-base font-medium transition-all duration-200 ${
                active
                  ? 'border-blue-500 bg-white text-blue-600'
                  : 'rounded border-transparent text-gray-500 hover:bg-gray-300/70 hover:text-black'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {IconComponent ? <IconComponent className="w-4.5 h-4.5" /> : null}
                {tab.label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
