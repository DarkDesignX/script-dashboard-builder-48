import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColumnFilterProps {
  options: { value: string; label: string; count?: number }[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  title: string;
  searchPlaceholder?: string;
}

export const ColumnFilter = ({
  options,
  selectedValues,
  onSelectionChange,
  title,
  searchPlaceholder = "Suchen..."
}: ColumnFilterProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter(v => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  };

  const clearFilters = () => {
    onSelectionChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 border-dashed bg-background/50",
              selectedValues.length > 0 && "border-primary bg-primary/10"
            )}
          >
            <Filter className="mr-2 h-3 w-3" />
            {title}
            {selectedValues.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {selectedValues.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 bg-popover border-border" align="start">
          <Command className="bg-popover">
            <CommandInput 
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
              className="bg-transparent"
            />
            <CommandList>
              <CommandEmpty>Keine Optionen gefunden.</CommandEmpty>
              <CommandGroup className="p-2">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleToggle(option.value)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 w-full">
                      <Checkbox
                        checked={selectedValues.includes(option.value)}
                        onChange={() => handleToggle(option.value)}
                      />
                      <Label className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({option.count})
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {selectedValues.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full justify-center"
                >
                  Filter zurücksetzen
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedValues.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 px-2"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};