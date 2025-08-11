"use client"

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboBoxOption {
  label: string
  value: string
}

interface ComboBoxProp {
  id?: string
  inputPlaceholder?: string
  open: boolean
  options: ComboBoxOption[]
  selectPlaceholder?: string
  setOpen: (isOpen: boolean) => void
  setValue: (option: string) => void
  value: string
}

export default function ComboBox({
  id,
  inputPlaceholder,
  open,
  options,
  selectPlaceholder,
  value,
  setOpen,
  setValue,
}: ComboBoxProp): React.ReactNode{

  const selectPlaceholderToUse = !!selectPlaceholder ? selectPlaceholder : "Select an option...";
  const inputPlaceHolderToUse = !!inputPlaceholder ? inputPlaceholder : "Search for option";

  return (
    <div id={id}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : selectPlaceholderToUse
            }
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={inputPlaceHolderToUse} />
            <CommandList>
              <CommandEmpty>No values found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}