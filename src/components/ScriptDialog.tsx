import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PowerShellCodeEditor } from "./PowerShellCodeEditor";
import { CustomerTagSelector } from "./CustomerTagSelector";
import { Script, Customer, categoryLabels } from "@/types/script";
import { Package, Shield, Settings, Terminal } from "lucide-react";

interface ScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script?: Script;
  customers: Customer[];
  onSave: (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const categoryIcons = {
  software: Package,
  sicherheit: Shield,
  konfiguration: Settings,
  befehl: Terminal,
};

export const ScriptDialog = ({ open, onOpenChange, script, customers, onSave }: ScriptDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    command: '',
    description: '',
    category: 'software' as Script['category'],
    isGlobal: false,
    autoEnrollment: false,
    customers: [] as string[],
  });

  useEffect(() => {
    if (script) {
      setFormData({
        name: script.name,
        command: script.command,
        description: script.description,
        category: script.category,
        isGlobal: script.isGlobal,
        autoEnrollment: script.autoEnrollment,
        customers: script.customers,
      });
    } else {
      setFormData({
        name: '',
        command: '',
        description: '',
        category: 'software',
        isGlobal: false,
        autoEnrollment: false,
        customers: [],
      });
    }
  }, [script, open]);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const handleCustomerChange = (customerIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      customers: customerIds
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {script ? 'Skript bearbeiten' : 'Neues Skript erstellen'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Skriptname eingeben..."
                className="bg-background/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value: Script['category']) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {Object.entries(categoryLabels).map(([key, label]) => {
                    const Icon = categoryIcons[key as keyof typeof categoryIcons];
                    return (
                      <SelectItem key={key} value={key} className="hover:bg-accent">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibung des Skripts..."
              className="bg-background/50 border-border"
              rows={3}
            />
          </div>

          <PowerShellCodeEditor
            value={formData.command}
            onChange={(value) => setFormData(prev => ({ ...prev, command: value }))}
          />

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isGlobal"
                checked={formData.isGlobal}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isGlobal: !!checked }))
                }
              />
              <Label htmlFor="isGlobal" className="cursor-pointer">
                Globales Skript
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoEnrollment"
                checked={formData.autoEnrollment}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, autoEnrollment: !!checked }))
                }
              />
              <Label htmlFor="autoEnrollment" className="cursor-pointer">
                Auto Enrollment
              </Label>
            </div>
          </div>

          <CustomerTagSelector
            customers={customers}
            selectedCustomers={formData.customers}
            onSelectionChange={handleCustomerChange}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-background/50 border-border"
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-primary shadow-glow"
            >
              {script ? 'Speichern' : 'Erstellen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};