import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types/script";
import { Check, ChevronsUpDown, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerTagSelectorProps {
  customers: Customer[];
  selectedCustomers: string[];
  onSelectionChange: (customerIds: string[]) => void;
  label?: string;
}

export const CustomerTagSelector = ({ 
  customers, 
  selectedCustomers, 
  onSelectionChange, 
  label = "Kunden" 
}: CustomerTagSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      onSelectionChange(selectedCustomers.filter(id => id !== customerId));
    } else {
      onSelectionChange([...selectedCustomers, customerId]);
    }
  };

  const handleRemove = (customerId: string) => {
    onSelectionChange(selectedCustomers.filter(id => id !== customerId));
  };

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || "";
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Selected Tags */}
      {selectedCustomers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-background/30 rounded-lg border border-border min-h-[40px]">
          {selectedCustomers.map(customerId => (
            <Badge 
              key={customerId} 
              variant="removable" 
              className="flex items-center gap-1"
            >
              <Users className="h-3 w-3" />
              {getCustomerName(customerId)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/20"
                onClick={() => handleRemove(customerId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background/50 border-border"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {selectedCustomers.length === 0 
                ? "Kunden auswählen..." 
                : `${selectedCustomers.length} Kunde(n) ausgewählt`
              }
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-popover border-border" align="start">
          <Command className="bg-popover">
            <CommandInput 
              placeholder="Kunden suchen..." 
              value={search}
              onValueChange={setSearch}
              className="bg-transparent"
            />
            <CommandList>
              <CommandEmpty>Keine Kunden gefunden.</CommandEmpty>
              <CommandGroup>
                {filteredCustomers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.name}
                    onSelect={() => handleSelect(customer.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCustomers.includes(customer.id) 
                          ? "opacity-100" 
                          : "opacity-0"
                      )}
                    />
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    {customer.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};