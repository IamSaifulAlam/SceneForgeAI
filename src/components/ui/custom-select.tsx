
"use client"

import * as React from "react"
import { Check, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "./input"

export interface ComboboxOption {
  value: string
  label: string
}

interface CustomSelectProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  emptyPlaceholder?: string
  className?: string
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  emptyPlaceholder = "No predefined options.",
  className,
  ...props
}: CustomSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedLabel = options.find((option) => option.value === value)?.label || value

  const handleSelect = (newValue: string) => {
    onChange(newValue)
    setOpen(false)
    setSearch("")
  }

  const filteredOptions = search
    ? options.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    : options

  const showAddButton = search && !options.some(option => option.label.toLowerCase() === search.toLowerCase());

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setSearch("")
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal group", className)}
          {...props}
        >
          <span className="flex-1 truncate text-left">{selectedLabel || placeholder}</span>
          <div className="flex items-center">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className="h-4 w-4 shrink-0"
            >
              <path
                d="M2 4l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {value ? (
              <div
                role="button"
                tabIndex={0}
                aria-label="Clear selection"
                className="ml-1 p-1 rounded-full flex items-center justify-center hover:bg-muted/50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange('');
                  }
                }}
              >
                <svg
                    width="8"
                    height="8"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="h-2 w-2"
                >
                    <path d="M8 2 2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 2 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : null }
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
        onOpenAutoFocus={() => inputRef.current?.focus()}
      >
        <div className="p-2 border-b">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-8"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && showAddButton) {
                            e.preventDefault();
                            handleSelect(search);
                        }
                    }}
                />
                {search && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Clear search"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSearch("")
                      inputRef.current?.focus()
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
                )}
            </div>
             {showAddButton && (
                <div className="pt-2">
                    <Button
                        type="button"
                        variant="default"
                        className="w-full justify-center bg-accent hover:bg-accent/90"
                        onClick={() => handleSelect(search)}
                    >
                        Add "{search}"
                    </Button>
                </div>
            )}
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          <div className="p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-normal h-9",
                    "hover:bg-accent hover:text-accent-foreground",
                    value === option.value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </Button>
              ))
            ) : (
               <div className="text-center py-6 text-sm text-muted-foreground">
                {search ? 'No results found.' : emptyPlaceholder}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
