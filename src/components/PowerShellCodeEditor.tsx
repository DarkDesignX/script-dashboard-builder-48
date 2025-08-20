import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Prism from "prismjs";
import "prismjs/components/prism-powershell";
import "prismjs/themes/prism.css";

interface PowerShellCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PowerShellCodeEditor = ({ value, onChange, placeholder }: PowerShellCodeEditorProps) => {
  const [isPreview, setIsPreview] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Code kopiert!",
      description: "Der PowerShell-Code wurde in die Zwischenablage kopiert.",
    });
  };

  const formatCode = (code: string) => {
    const highlightedCode = Prism.highlight(code, Prism.languages.powershell, 'powershell');
    
    return code
      .split('\n')
      .map((line, index) => {
        const highlightedLine = Prism.highlight(line, Prism.languages.powershell, 'powershell');
        return (
          <div key={index} className="flex">
            <span className="text-muted-foreground text-xs mr-4 select-none min-w-[2rem]">
              {index + 1}
            </span>
            <span 
              className="flex-1 font-mono text-sm"
              dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }}
            />
          </div>
        );
      });
  };

  return (
    <Card className="bg-gradient-secondary border-border">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">
            PowerShell Code
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              className="bg-background/50"
            >
              {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isPreview ? 'Bearbeiten' : 'Vorschau'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="bg-background/50"
            >
              <Copy className="h-4 w-4" />
              Kopieren
            </Button>
          </div>
        </div>

        {isPreview ? (
          <div className="bg-background/30 border border-border rounded-lg p-4 font-mono text-sm min-h-[200px] max-h-[400px] overflow-auto">
            {value ? formatCode(value) : (
              <div className="text-muted-foreground italic">Kein Code vorhanden</div>
            )}
          </div>
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "# PowerShell Code hier eingeben...\nGet-Process | Where-Object { $_.Name -eq 'notepad' }"}
            className="font-mono text-sm bg-background/30 border-border min-h-[200px] max-h-[400px] resize-none"
            style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
          />
        )}
      </div>
    </Card>
  );
};