import * as React from "react";
import { useRef, useState, useLayoutEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Input } from "@/shared/primitives";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

const setupInputContainerVariants = cva(
  "w-full flex flex-row items-center rounded-3xl bg-surface-secondary gap-2",
  {
    variants: {
      inputSize: {
        sm: "min-h-9 px-3 py-2",
        md: "min-h-11 px-3 py-2.5",
        lg: "min-h-[60px] px-6 py-0",
      },
    },
    defaultVariants: {
      inputSize: "md",
    },
  }
);

type SetupInputProps = Omit<React.ComponentProps<"input">, "size" | "style"> &
  VariantProps<typeof setupInputContainerVariants> & {
    error?: boolean;
    helperText?: string;
    left?: React.ReactNode;
    right?: React.ReactNode;
    containerClassName?: ClassValue;
    shrink?: boolean;
    style?: React.CSSProperties;
  };

export function SetupInput({
  inputSize,
  error = false,
  helperText,
  left,
  right,
  containerClassName,
  className,
  disabled,
  shrink = false,
  style,
  ...props
}: SetupInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fullWidth, setFullWidth] = useState(0);
  const [fitWidth, setFitWidth] = useState(0);

  useLayoutEffect(() => {
    if (measureRef.current && wrapperRef.current) {
      setFitWidth(measureRef.current.offsetWidth + 48);
      const full = wrapperRef.current.parentElement?.offsetWidth ?? 0;
      setFullWidth(full);
    }
  }, [props.value, shrink]);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", containerClassName)}
      style={{
        width: shrink ? `${fitWidth}px` : fullWidth ? `${fullWidth}px` : '100%',
        transition: 'width 500ms ease-in-out',
        ...style,
      }}
    >
      <span
        ref={measureRef}
        className="absolute invisible whitespace-pre typo-body pointer-events-none"
        aria-hidden="true"
      >
        {String(props.value || props.placeholder || '')}
      </span>
      <div
        className={cn(
          setupInputContainerVariants({ inputSize }),
          error && "ring-1 ring-brand-red",
          disabled && "opacity-55"
        )}
      >
        {left && (
          <div className="flex items-center justify-center">{left}</div>
        )}
        <Input
          className={cn(
            "typo-body flex-1 min-w-0 bg-transparent text-content-primary placeholder:text-content-tertiary/50 border-none shadow-none h-auto rounded-none p-0 focus-visible:ring-0",
            className
          )}
          disabled={disabled}
          aria-invalid={error || undefined}
          {...props}
        />
        {right && (
          <div className="flex items-center justify-center">{right}</div>
        )}
      </div>
      {helperText && (
        <p
          className={cn(
            "typo-caption mt-1.5",
            error ? "text-brand-red" : "text-content-tertiary"
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
