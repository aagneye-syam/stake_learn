import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  onClick,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href?: string;
  cta?: string;
  onClick?: () => void;
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  return (
    <div
      key={name}
      onClick={handleClick}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl cursor-pointer",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        className,
      )}
    >
      <div>{background}</div>
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-black transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-black">
          {name}
        </h3>
        <p className="max-w-lg text-gray-600">{description}</p>
      </div>

      {cta && (
        <div
          className={cn(
            "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          <button className="pointer-events-auto inline-flex items-center justify-center rounded-md text-sm font-medium text-black hover:bg-gray-100 h-9 px-3">
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03]" />
    </div>
  );
};

export { BentoCard, BentoGrid };
